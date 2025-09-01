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
        const targets = employersInSociete;
        if (targets.length === 0) {
            alert("Aucun employé trouvé pour cette société.");
            return;
        }

        setLoading(true);
        setBulletins([]);
        setProgress({ done: 0, total: targets.length });

        const out = [];
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
              <tr><th colspan="4" class="text-end">Brut imposable</th><th class="text-end">${fmt(b.brutImposable ?? 0)}</th></tr>
              ${b.irsa != null
                        ? `<tr><th colspan="4" class="text-end">IRSA (incluse dans les −)</th><th class="text-end">${fmt(b.irsa)}</th></tr>`
                        : ""}
              <tr><th colspan="4" class="text-end">Brut</th><th class="text-end">${fmt(b.brut)}</th></tr>
              <tr><th colspan="4" class="text-end">Net à payer</th><th class="text-end">${fmt(b.netAPayer)}</th></tr>
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
                                            <div className="card p-3 mb-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5>Bulletins du mois — Vue complète</h5>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            disabled={!societeId || !moisPaieId || loading}
                                                            onClick={computeAll}
                                                        >
                                                            {loading ? `Calcul… (${progress.done}/${progress.total})` : "Charger les bulletins"}
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            disabled={loading || filteredRows.length === 0}
                                                            onClick={exportCSV}
                                                        >
                                                            Export Excel (CSV)
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            disabled={loading || filteredRows.length === 0}
                                                            onClick={printAll}
                                                        >
                                                            Imprimer / PDF
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="row g-2 mt-2">
                                                    <div className="col-md-4">
                                                        <label>Société</label>
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
                                                    <div className="col-md-4">
                                                        <label>Mois</label>
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
                                                    <div className="col-md-4">
                                                        <label>Recherche (Nom / Prénom)</label>
                                                        <input
                                                            className="form-control"
                                                            placeholder="Tapez pour filtrer…"
                                                            value={searchName}
                                                            onChange={(e) => setSearchName(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card p-3">
                                                {loading && (
                                                    <div className="alert alert-info py-2">
                                                        Calcul en cours… {progress.done}/{progress.total}
                                                    </div>
                                                )}

                                                {filteredRows.length === 0 ? (
                                                    <p className="text-muted text-center mb-0">Aucune donnée à afficher.</p>
                                                ) : (
                                                    <>
                                                        <div className="table-responsive">
                                                            <table className="table table-hover">
                                                                <thead className="thead-light">
                                                                    <tr>
                                                                        <th>#</th>
                                                                        <th>Employé</th>
                                                                        <th>Catégorie</th>
                                                                        <th>Total +</th>
                                                                        <th>Total −</th>
                                                                        <th>Brut</th>
                                                                        <th>Net</th>
                                                                        <th>État</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredRows.map((row, i) => {
                                                                        if (row.bulletin && !row.error) {
                                                                            const b = row.bulletin;
                                                                            return (
                                                                                <tr key={row.employer.id}>
                                                                                    <td>{i + 1}</td>
                                                                                    <td>{labelName(row.employer)}</td>
                                                                                    <td>{labelCategorie(row.employer)}</td>
                                                                                    <td>{fmt(b.totalPlus)}</td>
                                                                                    <td>{fmt(b.totalMoins)}</td>
                                                                                    <td>{fmt(b.brut)}</td>
                                                                                    <td>
                                                                                        <strong>{fmt(b.netAPayer)}</strong>
                                                                                    </td>
                                                                                    <td><span className="badge bg-success">OK</span></td>
                                                                                    <td>
                                                                                        <button
                                                                                            className="btn btn-sm btn-outline-primary"
                                                                                            onClick={() => openDetail(row)}
                                                                                        >
                                                                                            Voir / Imprimer
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <tr key={row.employer.id} className="table-warning">
                                                                                <td>{i + 1}</td>
                                                                                <td>{labelName(row.employer)}</td>
                                                                                <td>{labelCategorie(row.employer)}</td>
                                                                                <td colSpan={4} style={{ color: "#b00" }}>
                                                                                    Erreur de calcul : {row.error}
                                                                                </td>
                                                                                <td><span className="badge bg-danger">ERREUR</span></td>
                                                                                <td>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-secondary"
                                                                                        onClick={() => openDetail(row)}
                                                                                    >
                                                                                        Détails
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr className="table-light">
                                                                        <th colSpan="3" className="text-end">TOTALS</th>
                                                                        <th>{fmt(totals.totalPlus)}</th>
                                                                        <th>{fmt(totals.totalMoins)}</th>
                                                                        <th>{fmt(totals.brut)}</th>
                                                                        <th><strong>{fmt(totals.net)}</strong></th>
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
                                        <p className="text-muted small mb-2">
                                            CNAPS/OSTIE calculés en % du <em>SB</em>. IRSA calculée en % du <em>Brut imposable</em>.
                                        </p>

                                        <div className="table-responsive">
                                            <table className="table table-hover">
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
                                                <tfoot>
                                                    <tr>
                                                        <th colSpan="4" className="text-end">Total +</th>
                                                        <th className="text-end">{fmt(detailRow.bulletin.totalPlus)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="4" className="text-end">Total −</th>
                                                        <th className="text-end">{fmt(detailRow.bulletin.totalMoins)}</th>
                                                    </tr>
                                                    <tr className="table-info">
                                                        <th colSpan="4" className="text-end">Brut imposable</th>
                                                        <th className="text-end">{fmt(detailRow.bulletin.brutImposable ?? 0)}</th>
                                                    </tr>
                                                    {detailRow.bulletin.irsa != null && (
                                                        <tr className="table-warning">
                                                            <th colSpan="4" className="text-end">IRSA (incluse dans les −)</th>
                                                            <th className="text-end">{fmt(detailRow.bulletin.irsa)}</th>
                                                        </tr>
                                                    )}
                                                    <tr className="table-primary">
                                                        <th colSpan="4" className="text-end">Brut</th>
                                                        <th className="text-end">{fmt(detailRow.bulletin.brut)}</th>
                                                    </tr>
                                                    <tr className="table-success">
                                                        <th colSpan="4" className="text-end">Net à payer</th>
                                                        <th className="text-end">{fmt(detailRow.bulletin.netAPayer)}</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="alert alert-warning mb-0">
                                        {detailRow.error || "Aucun détail disponible."}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        const w = window.open("", "_blank");
                                        if (!w) return;
                                        const body = document.querySelector(".modal-body");
                                        const html = body ? body.innerHTML : "";
                                        w.document.write(`
                      <html>
                        <head>
                          <title>Bulletin — ${labelName(detailRow.employer)}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 12px; }
                            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                            th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; }
                            th { background: #f2f2f2; text-align: left; }
                            .text-end { text-align: right; }
                          </style>
                        </head>
                        <body>
                          <h3>Bulletin — ${labelName(detailRow.employer)} (${labelCategorie(detailRow.employer)}) — ${monthLabel(moisPaieId)}</h3>
                          ${html}
                        </body>
                      </html>`);
                                        w.document.close();
                                        w.focus();
                                        w.print();
                                    }}
                                >
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
