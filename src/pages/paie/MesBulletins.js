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

function MesBulletins() {
    useTemplateScripts();

    // --- Utilisateur connecté (supposé stocké en localStorage)
    const [user, setUser] = useState({ id: "", roles: 3, societe: "" });
    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u) setUser({ id: u.idUtilisateur, roles: u.roles, societe: u.societe });
    }, []);

    // --- Référentiels
    const [societe, setSociete] = useState(null);
    const [moisList, setMoisList] = useState([]);
    const [employer, setEmployer] = useState(null);
    const [individu, setIndividu] = useState(null);
    const [categorie, setCategorie] = useState(null);

    // --- Sélection
    const [moisPaieId, setMoisPaieId] = useState("");

    // --- Bulletin courant
    const [bulletin, setBulletin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [infoMsg, setInfoMsg] = useState("");

    const toArray = (data) => (Array.isArray(data) ? data : data?.content || []);

    // Helpers format
    const fmt = (n) => (n == null ? "" : Number(n).toLocaleString("fr-FR"));

    // Détecter si un MoisPaie est clôturé (plusieurs variantes supportées)
    const isClosed = (m) => {
        if (!m) return false;
        if (typeof m.cloture === "boolean") return m.cloture;
        const s = (m.statut || m.status || "").toString().toUpperCase();
        if (s === "CLOTURE" || s === "CLOSED") return true;
        // fallback: pas d’info => on considère non-clôturé (la sélection utilisera un autre fallback si aucun n’est closed)
        return false;
    };

    // Charger référentiels de base
    useEffect(() => {
        // Société (facultatif, juste pour libellé)
        SocieteServices.getAll()
            .then((res) => {
                const arr = toArray(res.data);
                const s = arr.find((x) => x.id === user.societe) || null;
                setSociete(s);
            })
            .catch(() => { });

        // Mois de paie
        MoisPaieService.getAll()
            .then((r) => setMoisList(toArray(r.data)))
            .catch(console.error);
    }, [user.societe]);

    // Récupérer l’employé lié à cet utilisateur
    useEffect(() => {
        if (!user?.id) return;

        // 1) Essai direct via /by-utilisateur/{idUtilisateur}
        EmployerSocieteService.getByUtilisateur(user.id)
            .then((r) => {
                if (r?.data?.id) {
                    setEmployer(r.data);
                } else {
                    throw new Error("NotFound");
                }
            })
            .catch(() => {
                // 2) Fallback: on prend dans /employer-societe et on filtre
                EmployerSocieteService.getAll()
                    .then((res) => {
                        const arr = toArray(res.data);
                        const me = arr.find((e) => e.idUtilisateur === user.id);
                        if (me) setEmployer(me);
                    })
                    .catch(console.error);
            });
    }, [user.id]);

    // Charger Individu + Catégorie pour le libellé
    useEffect(() => {
        if (!employer?.id) return;

        IndividuServices.getAll()
            .then((res) => {
                const arr = toArray(res.data);
                setIndividu(arr.find((i) => i.id === employer.idIndividue) || null);
            })
            .catch(() => { });

        CategorieServices.getAll()
            .then((res) => {
                const arr = toArray(res.data);
                setCategorie(arr.find((c) => c.id === employer.idCategorie) || null);
            })
            .catch(() => { });
    }, [employer]);

    // Options de mois visibles par l’employé — uniquement les clôturés si dispo.
    const closedMonths = useMemo(() => moisList.filter(isClosed), [moisList]);

    const monthOptions = useMemo(() => {
        // S’il existe au moins un mois “clôturé” => n’afficher que ceux-là
        if (closedMonths.length > 0) {
            return closedMonths.slice().sort((a, b) => (b.periode || "").localeCompare(a.periode || ""));
        }
        // sinon (backend pas patché) => afficher tous (mais on affichera un bandeau d’avertissement)
        return moisList.slice().sort((a, b) => (b.periode || "").localeCompare(a.periode || ""));
    }, [moisList, closedMonths]);

    // Label utils
    const labelSociete = societe?.nomSociete || "Ma société";
    const labelMoi = `${individu?.nom || ""} ${individu?.prenom || ""}`.trim() || "Moi";
    const labelCategorie = categorie?.nomCategorie || "N/A";
    const labelPeriode = (id) => monthOptions.find((m) => m.id === id)?.periode || id || "";

    // Charger le bulletin
    const loadBulletin = () => {
        if (!employer?.id || !moisPaieId) return;
        // Si on a la notion de clôture, empêcher l’accès si non clôturé
        const month = moisList.find((m) => m.id === moisPaieId);
        if (month && closedMonths.length > 0 && !isClosed(month)) {
            setInfoMsg("Ce mois n’est pas encore clôturé. Le bulletin sera visible après clôture.");
            setBulletin(null);
            return;
        }
        setInfoMsg("");
        setLoading(true);
        setBulletin(null);
        PaieService.calculer(employer.id, moisPaieId)
            .then((res) => setBulletin(res.data))
            .catch((err) => {
                const msg = err?.response?.data?.error || err?.message || "Erreur de calcul";
                setInfoMsg(msg);
            })
            .finally(() => setLoading(false));
    };

    // Export CSV
    const exportCSV = () => {
        if (!bulletin) return;
        const headers = ["Société", "Période", "Employé", "Catégorie", "Code", "Libellé", "Op", "Taux%", "Montant"];
        const lines = [headers.join(";")];

        (bulletin.lignes || []).forEach((l) => {
            lines.push([
                labelSociete,
                labelPeriode(moisPaieId),
                labelMoi.replace(/;/g, ","),
                labelCategorie.replace(/;/g, ","),
                l.code,
                (l.libelle || "").replace(/;/g, ","),
                l.operation === 1 ? "+" : "-",
                l.taux ?? "",
                l.montant ?? 0
            ].join(";"));
        });

        lines.push(["", "", "", "", "", "TOTAL +", "", "", bulletin.totalPlus ?? 0].join(";"));
        lines.push(["", "", "", "", "", "TOTAL -", "", "", bulletin.totalMoins ?? 0].join(";"));
        if ("brutImposable" in bulletin) {
            lines.push(["", "", "", "", "", "Brut imposable", "", "", bulletin.brutImposable ?? 0].join(";"));
            if ("irsa" in bulletin && bulletin.irsa != null) {
                lines.push(["", "", "", "", "", "IRSA", "", "", bulletin.irsa ?? 0].join(";"));
            }
        }
        lines.push(["", "", "", "", "", "Brut", "", "", bulletin.brut ?? 0].join(";"));
        lines.push(["", "", "", "", "", "Net à payer", "", "", bulletin.netAPayer ?? 0].join(";"));

        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const fn = `Bulletin_${labelPeriode(moisPaieId)}_${labelMoi.replace(/\s+/g, "_")}.csv`;
        a.download = fn;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Impression simple (navigateur)
    const printBulletin = () => {
        if (!bulletin) return;
        const escapeHtml = (txt) =>
            String(txt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const head = `
      <style>
        body { font-family: Arial, sans-serif; padding: 12px; }
        h2,h3 { margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; }
        th { background: #f2f2f2; text-align: left; }
        .text-end { text-align: right; }
      </style>
    `;

        const lignes = (bulletin.lignes || [])
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

        const extraRows = `
      ${"brutImposable" in bulletin
                ? `<tr><th colspan="4" class="text-end">Brut imposable</th><th class="text-end">${fmt(bulletin.brutImposable ?? 0)}</th></tr>`
                : ""}
      ${"irsa" in bulletin && bulletin.irsa != null
                ? `<tr><th colspan="4" class="text-end">IRSA</th><th class="text-end">${fmt(bulletin.irsa ?? 0)}</th></tr>`
                : ""}
    `;

        const html = `
      <h2>${escapeHtml(labelSociete)}</h2>
      <h3>Bulletin de paie — ${escapeHtml(labelMoi)} (${escapeHtml(labelCategorie)}) — ${escapeHtml(labelPeriode(moisPaieId))}</h3>

      <table>
        <thead>
          <tr><th>Code</th><th>Libellé</th><th>Op</th><th>Taux%</th><th>Montant</th></tr>
        </thead>
        <tbody>${lignes}</tbody>
        <tfoot>
          <tr><th colspan="4" class="text-end">Total +</th><th class="text-end">${fmt(bulletin.totalPlus)}</th></tr>
          <tr><th colspan="4" class="text-end">Total −</th><th class="text-end">${fmt(bulletin.totalMoins)}</th></tr>
          ${extraRows}
          <tr><th colspan="4" class="text-end">Brut</th><th class="text-end">${fmt(bulletin.brut)}</th></tr>
          <tr><th colspan="4" class="text-end">Net à payer</th><th class="text-end"><strong>${fmt(bulletin.netAPayer)}</strong></th></tr>
        </tfoot>
      </table>
    `;

        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(`<html><head><title>Bulletin</title>${head}</head><body>${html}</body></html>`);
        w.document.close();
        w.focus();
        w.print();
    };

    // Message d’avertissement si API ne renvoie pas l’info “clôture”
    const showNoClosureFlagInfo = useMemo(
        () => closedMonths.length === 0 && moisList.length > 0,
        [closedMonths.length, moisList.length]
    );

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
                                                <h5>Mes bulletins de paie</h5>
                                                <p className="text-muted mb-2">
                                                    Visualisez vos bulletins par période. Les bulletins sont visibles <b>après clôture du mois</b>.
                                                </p>

                                                {showNoClosureFlagInfo && (
                                                    <div className="alert alert-warning py-2">
                                                        Votre API ne renvoie pas l’état de <b>clôture</b> des mois (champs <code>cloture</code> / <code>statut</code>).
                                                        Par défaut, tous les mois sont proposés. Ajoutez un indicateur de clôture côté backend pour restreindre l’accès.
                                                    </div>
                                                )}

                                                {!employer ? (
                                                    <div className="alert alert-info py-2">
                                                        Chargement de votre profil employé…
                                                    </div>
                                                ) : (
                                                    <div className="row g-2 mt-2">
                                                        <div className="col-md-4">
                                                            <label>Société</label>
                                                            <input className="form-control" value={labelSociete} disabled />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label>Employé</label>
                                                            <input className="form-control" value={labelMoi} disabled />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label>Catégorie</label>
                                                            <input className="form-control" value={labelCategorie} disabled />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sélecteur de période */}
                                            <div className="card p-3 mb-3">
                                                <div className="row g-2 align-items-end">
                                                    <div className="col-md-6">
                                                        <label>Période</label>
                                                        <select
                                                            className="form-control"
                                                            value={moisPaieId}
                                                            onChange={(e) => setMoisPaieId(e.target.value)}
                                                            disabled={!employer}
                                                        >
                                                            <option value="">— Sélectionner —</option>
                                                            {monthOptions.map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.periode}{isClosed(m) ? " — (Clôturé)" : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6 text-end">
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={loadBulletin}
                                                            disabled={!moisPaieId || !employer || loading}
                                                        >
                                                            {loading ? "Chargement…" : "Voir mon bulletin"}
                                                        </button>
                                                    </div>
                                                </div>

                                                {infoMsg && (
                                                    <div className="alert alert-warning mt-2 mb-0 py-2">{infoMsg}</div>
                                                )}
                                            </div>

                                            {/* Résultat */}
                                            <div className="card p-3">
                                                {!bulletin ? (
                                                    <p className="text-muted mb-0">Aucun bulletin à afficher.</p>
                                                ) : (
                                                    <>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <h6 className="mb-0">
                                                                Bulletin — {labelPeriode(moisPaieId)}
                                                            </h6>
                                                            <div className="d-flex gap-2">
                                                                <button className="btn btn-outline-secondary btn-sm" onClick={exportCSV}>
                                                                    Export CSV
                                                                </button>
                                                                <button className="btn btn-outline-secondary btn-sm" onClick={printBulletin}>
                                                                    Imprimer / PDF
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="table-responsive">
                                                            <table className="table table-hover">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Code</th>
                                                                        <th>Libellé</th>
                                                                        <th>Op</th>
                                                                        <th>Taux %</th>
                                                                        <th className="text-end">Montant</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(bulletin.lignes || []).map((l, i) => (
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
                                                                        <th className="text-end">{fmt(bulletin.totalPlus)}</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th colSpan="4" className="text-end">Total −</th>
                                                                        <th className="text-end">{fmt(bulletin.totalMoins)}</th>
                                                                    </tr>
                                                                    {"brutImposable" in bulletin && (
                                                                        <tr className="table-info">
                                                                            <th colSpan="4" className="text-end">Brut imposable</th>
                                                                            <th className="text-end">{fmt(bulletin.brutImposable ?? 0)}</th>
                                                                        </tr>
                                                                    )}
                                                                    {"irsa" in bulletin && bulletin.irsa != null && (
                                                                        <tr className="table-warning">
                                                                            <th colSpan="4" className="text-end">IRSA</th>
                                                                            <th className="text-end">{fmt(bulletin.irsa ?? 0)}</th>
                                                                        </tr>
                                                                    )}
                                                                    <tr className="table-primary">
                                                                        <th colSpan="4" className="text-end">Brut</th>
                                                                        <th className="text-end">{fmt(bulletin.brut)}</th>
                                                                    </tr>
                                                                    <tr className="table-success">
                                                                        <th colSpan="4" className="text-end">Net à payer</th>
                                                                        <th className="text-end"><strong>{fmt(bulletin.netAPayer)}</strong></th>
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
        </div>
    );
}

export default MesBulletins;
