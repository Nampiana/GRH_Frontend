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

// Helper pour formater les nombres
const formatNumber = (n) => (n == null ? "" : Number(n).toLocaleString("fr-FR"));

// Helper pour détecter si un mois est clôturé
const isMonthClosed = (month) => {
    if (!month) return false;
    // Gère les différents formats de statut de clôture
    const status = (month.cloture || month.statut || month.status || "").toString().toUpperCase();
    return status === "CLOTURE" || status === "CLOSED" || month.cloture === true;
};

// Composant pour afficher les détails du bulletin
const BulletinDisplay = ({ bulletin, moisPaieId, labelPeriode, labelMoi, labelCategorie, labelSociete }) => {
    if (!bulletin) {
        return <p className="text-muted mb-0">Aucun bulletin à afficher.</p>;
    }

    const exportCSV = () => {
        const headers = ["Société", "Période", "Employé", "Catégorie", "Code", "Libellé", "Op", "Taux%", "Montant"];
        const lines = [headers.join(";")];
        const replaceSemicolon = (text) => (String(text) || "").replace(/;/g, ",");

        (bulletin.lignes || []).forEach((l) => {
            lines.push([
                replaceSemicolon(labelSociete),
                replaceSemicolon(labelPeriode(moisPaieId)),
                replaceSemicolon(labelMoi),
                replaceSemicolon(labelCategorie),
                replaceSemicolon(l.code),
                replaceSemicolon(l.libelle),
                l.operation === 1 ? "+" : "-",
                l.taux ?? "",
                l.montant ?? 0,
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
        const fn = `Bulletin_${labelPeriode(moisPaieId).replace(/\s+/g, "_")}_${labelMoi.replace(/\s+/g, "_")}.csv`;
        a.download = fn;
        a.click();
        URL.revokeObjectURL(url);
    };

    const printBulletin = () => {
        const escapeHtml = (text) => String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const head = `
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                .header-info { text-align: center; margin-bottom: 20px; }
                h2, h3 { margin: 0; color: #0056b3; }
                h3 { font-weight: 400; font-size: 1.2rem; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                th, td { border: 1px solid #ddd; padding: 12px 15px; font-size: 14px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: 600; color: #495057; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                .text-end { text-align: right; }
                .table-info th { background-color: #e9ecef; }
                .table-warning th { background-color: #fff3cd; }
                .table-success th { background-weight: bold; font-size: 1.1em; background-color: #d4edda; color: #155724; }
                .btn { display: none; }
            </style>
        `;

        const lignes = (bulletin.lignes || []).map((l) => `
            <tr>
                <td>${escapeHtml(l.code)}</td>
                <td>${escapeHtml(l.libelle)}</td>
                <td>${l.operation === 1 ? "+" : "-"}</td>
                <td>${l.taux != null ? l.taux : ""}</td>
                <td class="text-end">${formatNumber(l.montant)}</td>
            </tr>
        `).join("");

        const extraRows = `
            ${"brutImposable" in bulletin ? `<tr class="table-info"><th colspan="4" class="text-end">Brut imposable</th><th class="text-end">${formatNumber(bulletin.brutImposable ?? 0)}</th></tr>` : ""}
            ${"irsa" in bulletin && bulletin.irsa != null ? `<tr class="table-warning"><th colspan="4" class="text-end">IRSA</th><th class="text-end">${formatNumber(bulletin.irsa ?? 0)}</th></tr>` : ""}
        `;

        const html = `
            <div class="header-info">
                <h2>${escapeHtml(labelSociete)}</h2>
                <h3>Bulletin de paie — ${escapeHtml(labelMoi)} (${escapeHtml(labelCategorie)}) — ${escapeHtml(labelPeriode(moisPaieId))}</h3>
            </div>
            <table>
                <thead>
                    <tr><th>Code</th><th>Libellé</th><th>Op</th><th>Taux %</th><th>Montant</th></tr>
                </thead>
                <tbody>${lignes}</tbody>
                <tfoot>
                    <tr><th colspan="4" class="text-end">Total +</th><th class="text-end">${formatNumber(bulletin.totalPlus)}</th></tr>
                    <tr><th colspan="4" class="text-end">Total −</th><th class="text-end">${formatNumber(bulletin.totalMoins)}</th></tr>
                    ${extraRows}
                    <tr class="table-primary"><th colspan="4" class="text-end">Brut</th><th class="text-end">${formatNumber(bulletin.brut)}</th></tr>
                    <tr class="table-success"><th colspan="4" class="text-end">Net à payer</th><th class="text-end"><strong>${formatNumber(bulletin.netAPayer)}</strong></th></tr>
                </tfoot>
            </table>
        `;

        const w = window.open("", "_blank", "width=800,height=600");
        if (!w) return;
        w.document.write(`<html><head><title>Bulletin de paie</title>${head}</head><body>${html}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => {
            w.print();
            w.close();
        }, 500); // Délai pour s'assurer que le contenu est rendu
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-primary fw-bold">Bulletin — {labelPeriode(moisPaieId)}</h6>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={exportCSV}>
                        <i className="feather icon-download me-1"></i> Export CSV
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={printBulletin}>
                        <i className="feather icon-printer me-1"></i> Imprimer / PDF
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-striped">
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
                                <td className="text-end">{formatNumber(l.montant)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="table-primary">
                            <th colSpan="4" className="text-end">Total +</th>
                            <th className="text-end">{formatNumber(bulletin.totalPlus)}</th>
                        </tr>
                        <tr className="table-danger">
                            <th colSpan="4" className="text-end">Total −</th>
                            <th className="text-end">{formatNumber(bulletin.totalMoins)}</th>
                        </tr>
                        {"brutImposable" in bulletin && (
                            <tr className="table-info">
                                <th colSpan="4" className="text-end">Brut imposable</th>
                                <th className="text-end">{formatNumber(bulletin.brutImposable ?? 0)}</th>
                            </tr>
                        )}
                        {"irsa" in bulletin && bulletin.irsa != null && (
                            <tr className="table-warning">
                                <th colSpan="4" className="text-end">IRSA</th>
                                <th className="text-end">{formatNumber(bulletin.irsa ?? 0)}</th>
                            </tr>
                        )}
                        <tr className="table-success">
                            <th colSpan="4" className="text-end fs-5">Net à payer</th>
                            <th className="text-end fs-5"><strong>{formatNumber(bulletin.netAPayer)}</strong></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    );
};

function MesBulletins() {
    useTemplateScripts();

    const [user, setUser] = useState(null);
    const [references, setReferences] = useState({
        societe: null,
        moisList: [],
        employer: null,
        individu: null,
        categorie: null,
    });
    const [bulletinState, setBulletinState] = useState({
        moisPaieId: "",
        bulletin: null,
        loading: false,
        infoMsg: "",
    });

    // Charger l'utilisateur au démarrage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser({ id: storedUser.idUtilisateur, roles: storedUser.roles, societe: storedUser.societe });
        }
    }, []);

    // Charger les références (société, mois)
    useEffect(() => {
        const fetchReferences = async () => {
            try {
                const [societeRes, moisRes] = await Promise.all([
                    SocieteServices.getAll(),
                    MoisPaieService.getAll(),
                ]);
                const moisData = Array.isArray(moisRes.data) ? moisRes.data : moisRes.data?.content || [];
                const societeData = Array.isArray(societeRes.data) ? societeRes.data : societeRes.data?.content || [];

                setReferences((prev) => ({
                    ...prev,
                    moisList: moisData,
                    societe: societeData.find((s) => s.id === user?.societe) || null,
                }));
            } catch (error) {
                console.error("Erreur lors du chargement des références", error);
            }
        };

        if (user) {
            fetchReferences();
        }
    }, [user]);

    // Charger les données de l'employé, de l'individu et de la catégorie
    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (!user?.id) return;

            try {
                // Tente de récupérer l'employé directement
                let employerData;
                try {
                    const res = await EmployerSocieteService.getByUtilisateur(user.id);
                    employerData = res?.data?.id ? res.data : null;
                } catch {
                    // Fallback si la première méthode échoue
                    const res = await EmployerSocieteService.getAll();
                    const allEmployers = Array.isArray(res.data) ? res.data : res.data?.content || [];
                    employerData = allEmployers.find((e) => e.idUtilisateur === user.id);
                }

                if (employerData) {
                    const [individuRes, categorieRes] = await Promise.all([
                        IndividuServices.getAll(),
                        CategorieServices.getAll(),
                    ]);
                    const allIndividus = Array.isArray(individuRes.data) ? individuRes.data : individuRes.data?.content || [];
                    const allCategories = Array.isArray(categorieRes.data) ? categorieRes.data : categorieRes.data?.content || [];

                    setReferences((prev) => ({
                        ...prev,
                        employer: employerData,
                        individu: allIndividus.find((i) => i.id === employerData.idIndividue) || null,
                        categorie: allCategories.find((c) => c.id === employerData.idCategorie) || null,
                    }));
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données de l'employé", error);
            }
        };

        if (user?.id) {
            fetchEmployeeData();
        }
    }, [user]);

    // Déterminer les mois disponibles pour la sélection
    const monthOptions = useMemo(() => {
        const closedMonths = references.moisList.filter(isMonthClosed);
        const sortedMonths = (closedMonths.length > 0 ? closedMonths : references.moisList)
            .slice()
            .sort((a, b) => (b.periode || "").localeCompare(a.periode || ""));
        return sortedMonths;
    }, [references.moisList]);

    // Helpers pour les libellés
    const labelSociete = references.societe?.nomSociete || "Ma société";
    const labelMoi = `${references.individu?.nom || ""} ${references.individu?.prenom || ""}`.trim() || "Moi";
    const labelCategorie = references.categorie?.nomCategorie || "N/A";
    const labelPeriode = (id) => monthOptions.find((m) => m.id === id)?.periode || id || "";

    // Gérer la sélection du mois
    const handleMonthChange = (e) => {
        setBulletinState(prev => ({ ...prev, moisPaieId: e.target.value, bulletin: null, infoMsg: "" }));
    };

    // Charger le bulletin de paie
    const loadBulletin = async () => {
        const { moisPaieId } = bulletinState;
        if (!references.employer?.id || !moisPaieId) return;

        setBulletinState(prev => ({ ...prev, loading: true, infoMsg: "", bulletin: null }));
        const selectedMonth = references.moisList.find((m) => m.id === moisPaieId);

        if (references.moisList.some(isMonthClosed) && !isMonthClosed(selectedMonth)) {
            setBulletinState(prev => ({
                ...prev,
                infoMsg: "Ce mois n’est pas encore clôturé. Le bulletin sera visible après clôture.",
                loading: false,
            }));
            return;
        }

        try {
            const res = await PaieService.calculer(references.employer.id, moisPaieId);
            setBulletinState(prev => ({ ...prev, bulletin: res.data, infoMsg: "" }));
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || "Erreur lors du calcul du bulletin. Veuillez réessayer plus tard.";
            setBulletinState(prev => ({ ...prev, infoMsg: msg }));
        } finally {
            setBulletinState(prev => ({ ...prev, loading: false }));
        }
    };

    const showNoClosureFlagInfo = references.moisList.length > 0 && !references.moisList.some(isMonthClosed);
    const isLoadingEmployeeData = !references.employer;

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

                                            <div className="card p-4 shadow-sm">
                                                <h4 className="mb-2 fw-bold text-dark">Mes bulletins de paie</h4>
                                                <p className="text-muted mb-4">
                                                    Visualisez vos bulletins par période. Les bulletins sont visibles <b>après clôture du mois</b>.
                                                </p>

                                                {showNoClosureFlagInfo && (
                                                    <div className="alert alert-warning border-0 d-flex align-items-center py-2">
                                                        <i className="feather icon-alert-triangle me-2"></i>
                                                        <div>
                                                            Votre API ne renvoie pas l’état de clôture des mois. Tous les mois sont affichés.
                                                            Ajoutez un indicateur de clôture côté backend pour une meilleure gestion.
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label fw-bold">Société</label>
                                                        <input className="form-control" value={labelSociete} disabled />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label fw-bold">Employé</label>
                                                        <input className="form-control" value={labelMoi} disabled />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label fw-bold">Catégorie</label>
                                                        <input className="form-control" value={labelCategorie} disabled />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card p-4 shadow-sm mt-3">
                                                <div className="d-flex flex-column flex-md-row align-items-md-end gap-3">
                                                    <div className="flex-grow-1">
                                                        <label className="form-label fw-bold">Période</label>
                                                        <select
                                                            className="form-select"
                                                            value={bulletinState.moisPaieId}
                                                            onChange={handleMonthChange}
                                                            disabled={isLoadingEmployeeData}
                                                        >
                                                            <option value="">— Sélectionner une période —</option>
                                                            {monthOptions.map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.periode}{isMonthClosed(m) ? " — Clôturé" : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={loadBulletin}
                                                        disabled={!bulletinState.moisPaieId || isLoadingEmployeeData || bulletinState.loading}
                                                    >
                                                        {bulletinState.loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Chargement…
                                                            </>
                                                        ) : (
                                                            "Voir mon bulletin"
                                                        )}
                                                    </button>
                                                </div>

                                                {bulletinState.infoMsg && (
                                                    <div className="alert alert-info mt-3 mb-0 py-2">
                                                        {bulletinState.infoMsg}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card p-4 shadow-sm mt-3">
                                                <BulletinDisplay
                                                    bulletin={bulletinState.bulletin}
                                                    moisPaieId={bulletinState.moisPaieId}
                                                    labelPeriode={labelPeriode}
                                                    labelMoi={labelMoi}
                                                    labelCategorie={labelCategorie}
                                                    labelSociete={labelSociete}
                                                />
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