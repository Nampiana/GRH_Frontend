import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import MoisPaieService from "../../services/moispaie/moisPaieService";
import PaieService from "../../services/paie/paieService";
import IndividuServices from "../../services/individu/individuService";
import CategorieServices from "../../services/categorie/categorie";
import SocieteServices from "../../services/societe/societeService";

// J'ai enlevé tout le reste du code qui n'a pas besoin d'être modifié ici.
// C'est la section `return` qui nous intéresse.

function BulletinsMois() {
  useTemplateScripts();

  // --- User (rôle / société)
  const [user, setUser] = useState({ roles: 1, societe: "" });
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u) setUser({ roles: u.roles, societe: u.societe });
  }, []);

  // --- Référentiels
  const [societes, setSocietes] = useState([]);
  const [moisList, setMoisList] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [individusById, setIndividusById] = useState({});
  const [categoriesById, setCategoriesById] = useState({});

  // --- Filtres
  const [societeId, setSocieteId] = useState("");
  const [moisPaieId, setMoisPaieId] = useState("");
  const [searchName, setSearchName] = useState("");

  // --- Résultats bulletins
  const [bulletins, setBulletins] = useState([]); // [{ employer, individu, categorie, bulletin, error }]
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const toArray = (data) => (Array.isArray(data) ? data : data?.content || []);

  // Charger référentiels
  useEffect(() => {
    SocieteServices.getAll().then((r) => setSocietes(toArray(r.data))).catch(console.error);
    MoisPaieService.getAll().then((r) => setMoisList(toArray(r.data))).catch(console.error);
    EmployerSocieteService.getAll().then((r) => setEmployers(toArray(r.data))).catch(console.error);

    IndividuServices.getAll()
      .then((r) => {
        const arr = toArray(r.data);
        const map = {};
        arr.forEach((x) => x?.id && (map[x.id] = x));
        setIndividusById(map);
      })
      .catch(console.error);

    CategorieServices.getAll()
      .then((r) => {
        const arr = toArray(r.data);
        const map = {};
        arr.forEach((x) => x?.id && (map[x.id] = x));
        setCategoriesById(map);
      })
      .catch(console.error);
  }, []);

  // Options société selon rôle
  const societeOptions = useMemo(() => {
    if (user.roles === 2) {
      const mine = societes.filter((s) => s.id === user.societe);
      return mine.length ? mine : (user.societe ? [{ id: user.societe, nomSociete: "Mon entreprise" }] : []);
    }
    return societes;
  }, [societes, user]);

  useEffect(() => {
    if (user.roles === 2 && user.societe) setSocieteId(user.societe);
  }, [user]);

  // Employés de la société choisie
  const employersInSociete = useMemo(
    () => employers.filter((e) => (societeId ? e.idSociete === societeId : true)),
    [employers, societeId]
  );

  // Employés actifs uniquement (pas de dateDebauche)
  const activeEmployers = useMemo(
    () => employersInSociete.filter(e => !e.dateDebauche),
    [employersInSociete]
  );

  // Format helpers
  const fmt = (n) => (n == null ? "" : Number(n).toLocaleString("fr-FR"));
  const labelSociete = (id) => societeOptions.find((s) => s.id === id)?.nomSociete || "N/A";
  const labelName = (emp) => {
    const ind = individusById[emp.idIndividue] || {};
    return `${ind.nom || ""} ${ind.prenom || ""}`.trim() || emp.id;
  };
  const labelCategorie = (emp) => categoriesById[emp.idCategorie]?.nomCategorie || "N/A";
  const monthLabel = (id) => moisList.find((m) => m.id === id)?.periode || id || "";

  // Recherche
  const filteredRows = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    if (!q) return bulletins;
    return bulletins.filter((row) => {
      const full = labelName(row.employer).toLowerCase();
      return full.includes(q);
    });
  }, [bulletins, searchName]);

  // Totaux agrégés
  const totals = useMemo(() => {
    const ok = filteredRows.filter((r) => r.bulletin && !r.error).map((r) => r.bulletin);
    const sum = (k) => ok.reduce((acc, b) => acc + (Number(b[k]) || 0), 0);
    return {
      totalPlus: sum("totalPlus"),
      totalMoins: sum("totalMoins"),
      brut: sum("brut"),
      net: sum("netAPayer"),
    };
  }, [filteredRows]);

  // Calculer tous les bulletins
  const computeAll = async () => {
    if (!societeId || !moisPaieId) {
      alert("Sélectionne la Société et le Mois.");
      return;
    }

    const targets = activeEmployers; // ✅ uniquement actifs
    if (targets.length === 0) {
      alert("Aucun employé actif trouvé pour cette société.");
      setBulletins([]);
      return;
    }

    setLoading(true);
    setBulletins([]);
    setProgress({ done: 0, total: targets.length });

    const out = [];

    // 1) Actifs -> appel API
    for (let i = 0; i < targets.length; i++) {
      const emp = targets[i];
      try {
        const res = await PaieService.calculer(emp.id, moisPaieId);
        out.push({
          employer: emp,
          individu: individusById[emp.idIndividue] || null,
          categorie: categoriesById[emp.idCategorie] || null,
          bulletin: res.data,
          error: null,
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Erreur de calcul";
        out.push({
          employer: emp,
          individu: individusById[emp.idIndividue] || null,
          categorie: categoriesById[emp.idCategorie] || null,
          bulletin: null,
          error: msg,
        });
      }
      setProgress({ done: i + 1, total: targets.length });
    }

    // 2) Débouchés -> ligne d’info sans appel API (optionnel mais utile)
    employersInSociete
      .filter(e => !!e.dateDebauche)
      .forEach(emp => {
        out.push({
          employer: emp,
          individu: individusById[emp.idIndividue] || null,
          categorie: categoriesById[emp.idCategorie] || null,
          bulletin: null,
          error: "Employé débouché — paie non calculable",
        });
      });

    // Tri par nom
    out.sort((a, b) => labelName(a.employer).localeCompare(labelName(b.employer)));
    setBulletins(out);
    setLoading(false);
  };

  // Export CSV (Excel)
  const exportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = [
      "Société", "Mois", "Employé", "Catégorie",
      "TotalPlus", "TotalMoins", "Brut", "BrutImposable", "IRSA", "NetAPayer",
      "Etat", "Message"
    ];

    const lines = [headers.join(";")];

    filteredRows.forEach((row) => {
      const empName = labelName(row.employer).replace(/;/g, ",");
      const catName = labelCategorie(row.employer).replace(/;/g, ",");
      if (row.bulletin && !row.error) {
        const b = row.bulletin;
        lines.push([
          labelSociete(societeId),
          monthLabel(moisPaieId),
          empName,
          catName,
          b.totalPlus,
          b.totalMoins,
          b.brut,
          b.brutImposable ?? "",
          b.irsa ?? "",
          b.netAPayer,
          "OK",
          ""
        ].join(";"));

      } else {
        lines.push(
          [
            labelSociete(societeId),
            monthLabel(moisPaieId),
            empName,
            catName,
            "",
            "",
            "",
            "",
            "",
            "",
            "ERREUR",
            (row.error || "").replace(/[\r\n;]+/g, " "),
          ].join(";")
        );
      }
    });

    // Totaux en bas
    lines.push([
      "", "", "TOTALS", "",
      totals.totalPlus,
      totals.totalMoins,
      totals.brut,
      filteredRows.reduce((a, r) => a + (Number(r?.bulletin?.brutImposable) || 0), 0),
      filteredRows.reduce((a, r) => a + (Number(r?.bulletin?.irsa) || 0), 0),
      totals.net,
      "",
      ""
    ].join(";"));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fn = `Bulletins_${labelSociete(societeId)}_${monthLabel(moisPaieId)}.csv`.replace(/\s+/g, "_");
    a.download = fn;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Impression / PDF (via impression navigateur)
  const escapeHtml = (txt) =>
    String(txt || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const printAll = () => {
    if (filteredRows.length === 0) return;

    const head = `
      <style>
        body { font-family: Arial, sans-serif; }
        h1,h2,h3 { margin: 0 0 8px; }
        .header { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; }
        th { background: #f2f2f2; text-align: left; }
        .totals { margin-top: 16px; }
        .page-break { page-break-after: always; }
        .text-end { text-align: right; }
      </style>
    `;
    const summaryTable = `
      <h2>Bulletins — ${labelSociete(societeId)} — ${monthLabel(moisPaieId)}</h2>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Employé</th><th>Catégorie</th>
            <th>Total +</th><th>Total −</th><th>Brut</th><th>Net</th><th>État</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRows
            .map((row, i) => {
              if (row.bulletin && !row.error) {
                const b = row.bulletin;
                return `<tr>
                  <td>${i + 1}</td>
                  <td>${escapeHtml(labelName(row.employer))}</td>
                  <td>${escapeHtml(labelCategorie(row.employer))}</td>
                  <td class="text-end">${fmt(b.totalPlus)}</td>
                  <td class="text-end">${fmt(b.totalMoins)}</td>
                  <td class="text-end">${fmt(b.brut)}</td>
                  <td class="text-end"><strong>${fmt(b.netAPayer)}</strong></td>
                  <td>OK</td>
                </tr>`;
              } else {
                return `<tr>
                  <td>${i + 1}</td>
                  <td>${escapeHtml(labelName(row.employer))}</td>
                  <td>${escapeHtml(labelCategorie(row.employer))}</td>
                  <td colspan="4" style="color:#b00;">Erreur: ${escapeHtml(row.error || "")}</td>
                  <td>ERREUR</td>
                </tr>`;
              }
            })
            .join("")}
        </tbody>
      </table>
      <div class="totals">
        <strong>Totaux — </strong>
        Total +: ${fmt(totals.totalPlus)} |
        Total −: ${fmt(totals.totalMoins)} |
        Brut: ${fmt(totals.brut)} |
        Net: <strong>${fmt(totals.net)}</strong>
      </div>
      <div class="page-break"></div>
    `;

    const details = filteredRows
      .map((row) => {
        if (!(row.bulletin && !row.error)) return "";
        const b = row.bulletin;
        const lignes = (b.lignes || [])
          .map(
            (l) => `<tr>
              <td>${escapeHtml(l.code)}</td>
              <td>${escapeHtml(l.libelle)}</td>
              <td>${l.operation === 1 ? "+" : "-"}</td>
              <td>${l.taux != null ? l.taux : ""}</td>
              <td class="text-end">${fmt(l.montant)}</td>
            </tr>`
          )
          .join("");
        return `
          <h3>${escapeHtml(labelName(row.employer))} — ${escapeHtml(labelCategorie(row.employer))}</h3>
          <table>
            <thead>
              <tr><th>Code</th><th>Libellé</th><th>Op</th><th>Taux %</th><th>Montant</th></tr>
            </thead>
            <tbody>${lignes}</tbody>
            <tfoot>
              <tr><th colspan="4" class="text-end">Total +</th><th class="text-end">${fmt(b.totalPlus)}</th></tr>
              <tr><th colspan="4" class="text-end">Total −</th><th class="text-end">${fmt(b.totalMoins)}</th></tr>
              <tr class="table-info"><th colspan="4" class="text-end">Brut imposable</th><th class="text-end">${fmt(b.brutImposable ?? 0)}</th></tr>
              ${b.irsa != null
                ? `<tr class="table-warning"><th colspan="4" class="text-end">IRSA (incluse dans les −)</th><th class="text-end">${fmt(b.irsa)}</th></tr>`
                : ""}
              <tr class="table-primary"><th colspan="4" class="text-end">Brut</th><th class="text-end">${fmt(b.brut)}</th></tr>
              <tr class="table-success"><th colspan="4" class="text-end">Net à payer</th><th class="text-end">${fmt(b.netAPayer)}</th></tr>
            </tfoot>
          </table>
          <div class="page-break"></div>
        `;
      })
      .join("");

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Bulletins</title>${head}</head><body>${summaryTable}${details}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  // Détail modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const openDetail = (row) => {
    setDetailRow(row);
    setShowDetail(true);
  };
  
  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content">
              <div className="pcoded-inner-content">
                <div className="main-body">
                  <div className="page-wrapper">
                    <div className="page-body">
                      {/* --- En-tête avec titre, boutons et filtres --- */}
                      <div className="card shadow-sm p-4 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4 className="m-0 text-primary fw-bold">
                            <i className="feather icon-file-text me-2"></i>
                            Bulletins de salaire
                          </h4>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            {/* Bouton pour charger les bulletins avec un indicateur de chargement */}
                            <button
                              className="btn btn-primary d-flex align-items-center"
                              disabled={!societeId || !moisPaieId || loading}
                              onClick={computeAll}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Calcul en cours… ({progress.done}/{progress.total})
                                </>
                              ) : (
                                <>
                                  <i className="feather icon-play me-2"></i>
                                  Charger les bulletins
                                </>
                              )}
                            </button>
                            {/* Bouton d'exportation avec icône */}
                            <button
                              className="btn btn-outline-success d-flex align-items-center"
                              disabled={loading || filteredRows.length === 0}
                              onClick={exportCSV}
                            >
                              <i className="feather icon-download me-2"></i>
                              Export Excel
                            </button>
                            {/* Bouton d'impression avec icône */}
                            <button
                              className="btn btn-outline-info d-flex align-items-center"
                              disabled={loading || filteredRows.length === 0}
                              onClick={printAll}
                            >
                              <i className="feather icon-printer me-2"></i>
                              Imprimer / PDF
                            </button>
                          </div>
                        </div>

                        {/* Les filtres sont mieux présentés en une seule ligne */}
                        <div className="row g-3">
                          <div className="col-lg-4 col-md-6">
                            <label className="form-label text-muted">Société</label>
                            <select
                              className="form-control"
                              value={societeId}
                              onChange={(e) => setSocieteId(e.target.value)}
                              disabled={user.roles === 2}
                            >
                              <option value="">— Sélectionner —</option>
                              {societeOptions.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.nomSociete}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <label className="form-label text-muted">Mois de la paie</label>
                            <select
                              className="form-control"
                              value={moisPaieId}
                              onChange={(e) => setMoisPaieId(e.target.value)}
                            >
                              <option value="">— Sélectionner —</option>
                              {moisList
                                .slice()
                                .sort((a, b) => (b.periode || "").localeCompare(a.periode || ""))
                                .map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.periode}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="col-lg-4 col-md-12">
                            <label className="form-label text-muted">Rechercher un employé</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tapez le nom ou prénom..."
                              value={searchName}
                              onChange={(e) => setSearchName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* --- Résultats des bulletins --- */}
                      <div className="card shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="m-0 text-muted">
                            <i className="feather icon-list me-1"></i>
                            Résultats ({filteredRows.length})
                          </h6>
                          {/* Totaux agrégés en cartes pour une meilleure visibilité */}
                          <div className="d-flex gap-3 flex-wrap justify-content-end">
                            <div className="bg-light p-2 rounded-3 text-center">
                              <small className="text-muted d-block">Total Net à Payer</small>
                              <h5 className="mb-0 text-success fw-bold">{fmt(totals.net)} Ar</h5>
                            </div>
                            <div className="bg-light p-2 rounded-3 text-center">
                              <small className="text-muted d-block">Total Brut</small>
                              <h5 className="mb-0 text-info fw-bold">{fmt(totals.brut)} Ar</h5>
                            </div>
                          </div>
                        </div>
                        <hr className="my-3"/>

                        {loading && (
                          <div className="alert alert-info text-center py-3">
                            <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                            Calcul en cours…
                          </div>
                        )}

                        {filteredRows.length === 0 && !loading ? (
                          <div className="text-center py-5 text-muted">
                            <i className="feather icon-alert-circle d-block mb-3" style={{ fontSize: '3rem' }}></i>
                            <p className="mb-0">Aucun bulletin à afficher pour la sélection. <br/> Veuillez choisir une société et un mois, puis **Charger les bulletins**.</p>
                          </div>
                        ) : (
                          <>
                            <div className="table-responsive">
                              <table className="table table-hover table-striped">
                                <thead className="table-light">
                                  <tr>
                                    <th>#</th>
                                    <th>Employé</th>
                                    <th>Catégorie</th>
                                    <th className="text-end">Total (+)</th>
                                    <th className="text-end">Total (−)</th>
                                    <th className="text-end">Brut</th>
                                    <th className="text-end">Net à payer</th>
                                    <th className="text-center">État</th>
                                    <th className="text-center">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredRows.map((row, i) => {
                                    if (row.bulletin && !row.error) {
                                      const b = row.bulletin;
                                      return (
                                        <tr key={row.employer.id}>
                                          <td>{i + 1}</td>
                                          <td className="fw-bold">{labelName(row.employer)}</td>
                                          <td className="text-muted">{labelCategorie(row.employer)}</td>
                                          <td className="text-end">{fmt(b.totalPlus)}</td>
                                          <td className="text-end">{fmt(b.totalMoins)}</td>
                                          <td className="text-end">{fmt(b.brut)}</td>
                                          <td className="text-end">
                                            <span className="text-success fw-bold">{fmt(b.netAPayer)}</span>
                                          </td>
                                          <td className="text-center">
                                            <span className="badge bg-success">OK</span>
                                          </td>
                                          <td className="text-center">
                                            <button
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => openDetail(row)}
                                              title="Voir les détails et imprimer ce bulletin"
                                            >
                                              <i className="feather icon-eye"></i>
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    }
                                    return (
                                      <tr key={row.employer.id} className="table-danger">
                                        <td>{i + 1}</td>
                                        <td className="fw-bold">{labelName(row.employer)}</td>
                                        <td className="text-muted">{labelCategorie(row.employer)}</td>
                                        <td colSpan={4} className="text-start fst-italic">
                                          Erreur de calcul : {row.error}
                                        </td>
                                        <td className="text-center">
                                          <span className="badge bg-danger">ERREUR</span>
                                        </td>
                                        <td className="text-center">
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => openDetail(row)}
                                            title="Afficher le message d'erreur"
                                          >
                                            <i className="feather icon-info"></i>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="table-primary">
                                    <th colSpan="3" className="text-end">TOTALS</th>
                                    <th className="text-end">{fmt(totals.totalPlus)}</th>
                                    <th className="text-end">{fmt(totals.totalMoins)}</th>
                                    <th className="text-end">{fmt(totals.brut)}</th>
                                    <th className="text-end">{fmt(totals.net)}</th>
                                    <th colSpan="2"></th>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div id="styleSelector"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Détail Bulletin */}
      {showDetail && detailRow && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content border-0 shadow rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Bulletin — {labelName(detailRow.employer)} ({labelCategorie(detailRow.employer)}) — {monthLabel(moisPaieId)}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetail(false)}></button>
              </div>
              <div className="modal-body">
                {detailRow.bulletin && !detailRow.error ? (
                  <>
                    <div className="row row-cols-md-2 g-2 mb-3">
                      <div className="col"><div className="p-2 bg-light rounded-3"><strong>Société:</strong> {labelSociete(societeId)}</div></div>
                      <div className="col"><div className="p-2 bg-light rounded-3"><strong>Mois:</strong> {monthLabel(moisPaieId)}</div></div>
                      <div className="col"><div className="p-2 bg-light rounded-3"><strong>Employé:</strong> {labelName(detailRow.employer)}</div></div>
                      <div className="col"><div className="p-2 bg-light rounded-3"><strong>Catégorie:</strong> {labelCategorie(detailRow.employer)}</div></div>
                    </div>
                    <p className="text-muted small mb-3">
                      <i className="feather icon-info me-1"></i> CNAPS/OSTIE calculés en % du <em>SB</em>. IRSA calculée en % du <em>Brut imposable</em>.
                    </p>
                    <div className="table-responsive">
                      <table className="table table-hover table-sm">
                        <thead className="thead-light">
                          <tr>
                            <th>Code</th>
                            <th>Libellé</th>
                            <th>Op</th>
                            <th>Taux %</th>
                            <th className="text-end">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailRow.bulletin.lignes.map((l, i) => (
                            <tr key={i}>
                              <td>{l.code}</td>
                              <td>{l.libelle}</td>
                              <td>{l.operation === 1 ? "+" : "-"}</td>
                              <td>{l.taux != null ? l.taux : ""}</td>
                              <td className="text-end">{fmt(l.montant)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-group-divider">
                          <tr className="fw-bold table-light">
                            <td colSpan="4" className="text-end">Total +</td>
                            <td className="text-end">{fmt(detailRow.bulletin.totalPlus)}</td>
                          </tr>
                          <tr className="fw-bold table-light">
                            <td colSpan="4" className="text-end">Total −</td>
                            <td className="text-end">{fmt(detailRow.bulletin.totalMoins)}</td>
                          </tr>
                          <tr className="fw-bold table-info">
                            <td colSpan="4" className="text-end">Brut imposable</td>
                            <td className="text-end">{fmt(detailRow.bulletin.brutImposable ?? 0)}</td>
                          </tr>
                          {detailRow.bulletin.irsa != null && (
                            <tr className="fw-bold table-warning">
                              <td colSpan="4" className="text-end">IRSA (incluse dans les −)</td>
                              <td className="text-end">{fmt(detailRow.bulletin.irsa)}</td>
                            </tr>
                          )}
                          <tr className="fw-bold table-primary">
                            <td colSpan="4" className="text-end">Brut</td>
                            <td className="text-end">{fmt(detailRow.bulletin.brut)}</td>
                          </tr>
                          <tr className="fw-bold table-success">
                            <td colSpan="4" className="text-end">Net à payer</td>
                            <td className="text-end">{fmt(detailRow.bulletin.netAPayer)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning mb-0">
                    <h6 className="alert-heading">Erreur de calcul</h6>
                    <p className="mb-0">{detailRow.error || "Aucun détail disponible."}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-info" onClick={printAll}>
                  <i className="feather icon-printer me-2"></i>
                  Imprimer ce bulletin
                </button>
                <button className="btn btn-primary" onClick={() => setShowDetail(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulletinsMois;