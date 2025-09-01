import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import usePaie from "../../hook/paie/usePaie";

import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import MoisPaieService from "../../services/moispaie/moisPaieService";
import PaieMoisService from "../../services/paieMois/paieMoisService";
import IndividuServices from "../../services/individu/individuService";
import CategorieServices from "../../services/categorie/categorie";

function PaieEmployer() {
    useTemplateScripts();
    const { bulletin, loading, calculer, enregistrer, setBulletin } = usePaie();

    const [employers, setEmployers] = useState([]);
    const [mois, setMois] = useState([]);
    const [idEmployer, setIdEmployer] = useState("");
    const [moisPaieId, setMoisPaieId] = useState("");

    const [individusById, setIndividusById] = useState({});
    const [categoriesById, setCategoriesById] = useState({});
    const [saisies, setSaisies] = useState([]);

    const toArray = (data) => (Array.isArray(data) ? data : data?.content || []);

    useEffect(() => {
        EmployerSocieteService.getAll()
            .then((r) => setEmployers(toArray(r.data)))
            .catch(console.error);
        MoisPaieService.getAll()
            .then((r) => setMois(toArray(r.data)))
            .catch(console.error);

        IndividuServices.getAll()
            .then((res) => {
                const arr = toArray(res.data);
                const map = {};
                arr.forEach((x) => {
                    if (x?.id) map[x.id] = x;
                });
                setIndividusById(map);
            })
            .catch(console.error);

        CategorieServices.getAll()
            .then((res) => {
                const arr = toArray(res.data);
                const map = {};
                arr.forEach((x) => {
                    if (x?.id) map[x.id] = x;
                });
                setCategoriesById(map);
            })
            .catch(console.error);
    }, []);

    const employersSorted = useMemo(() => {
        const withNames = employers.map((e) => {
            const ind = individusById[e.idIndividue] || {};
            return { ...e, _nom: ind.nom || "", _prenom: ind.prenom || "" };
        });
        return withNames.sort((a, b) => {
            const an = `${a._nom} ${a._prenom}`.trim().toLowerCase();
            const bn = `${b._nom} ${b._prenom}`.trim().toLowerCase();
            return an.localeCompare(bn);
        });
    }, [employers, individusById]);

    const addLigne = (code, libelle, operation) => {
        setSaisies((prev) => [...prev, { code, libelle, operation, montant: 0 }]);
    };

    const updateMontant = (idx, val) => {
        const copy = [...saisies];
        copy[idx].montant = Number(val || 0);
        setSaisies(copy);
    };

    // NEW: retirer une ligne
    const removeLigne = (idx) => {
        setSaisies((prev) => prev.filter((_, i) => i !== idx));
    };

    // Filtrer les mois par société de l'employé sélectionné
    const moisFiltres = useMemo(() => {
        if (!idEmployer) return mois;
        const emp = employers.find((e) => e.id === idEmployer);
        if (!emp) return mois;
        return mois.filter((m) => !m.idSociete || m.idSociete === emp.idSociete);
    }, [mois, idEmployer, employers]);

    const selectedMois = useMemo(
        () => mois.find((m) => m.id === moisPaieId),
        [mois, moisPaieId]
    );
    const isClosed = selectedMois?.statut === "CLOSED";

    const handleCalculer = () => {
        if (!idEmployer || !moisPaieId || isClosed) return;

        const bodyUpsert = {
            idEmployer,
            moisPaieId,
            lignes: saisies.map((s) => ({
                code: s.code,
                montant: s.montant,
                note: s.libelle,
            })),
        };

        PaieMoisService.upsert(bodyUpsert)
            .then(() => calculer(idEmployer, moisPaieId))
            .catch(console.error);
    };

    const handleEnregistrer = () => {
        if (!bulletin || isClosed) return;
        enregistrer(
            { idEmployer, moisPaieId, lignes: bulletin.lignes },
            () => alert("Bulletin enregistré !")
        );
    };

    const renderEmployerOptionLabel = (e) => {
        const ind = individusById[e.idIndividue];
        const cat = categoriesById[e.idCategorie];
        const nomPrenom = ind
            ? `${ind.nom || ""} ${ind.prenom || ""}`.trim()
            : e.idIndividue;
        const catLabel = cat ? cat.nomCategorie : "N/A";
        return `${nomPrenom} — ${catLabel}`;
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
                                                <h5>Calcul de paie par employé</h5>

                                                <div className="row g-2 mt-2">
                                                    <div className="col-md-5">
                                                        <label>Employé</label>
                                                        <select
                                                            className="form-control"
                                                            value={idEmployer}
                                                            onChange={(e) => setIdEmployer(e.target.value)}
                                                        >
                                                            <option value="">-- Sélectionner --</option>
                                                            {employersSorted.map((e) => (
                                                                <option key={e.id} value={e.id}>
                                                                    {renderEmployerOptionLabel(e)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label>Mois de paie</label>
                                                        <select
                                                            className="form-control"
                                                            value={moisPaieId}
                                                            onChange={(e) => setMoisPaieId(e.target.value)}
                                                        >
                                                            <option value="">-- Sélectionner --</option>
                                                            {moisFiltres.map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {(m.periode || "").slice(0, 7)}{" "}
                                                                    {m.statut === "CLOSED" ? " (Clôturé)" : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {isClosed && (
                                                    <div className="alert alert-warning mt-2 mb-0">
                                                        Ce mois est <b>clôturé</b> : calcul et enregistrement
                                                        désactivés.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Saisies manuelles rapides */}
                                            <div className="card p-3 mb-3">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <h6>Saisies manuelles du mois</h6>
                                                    <div className="btn-group">
                                                        {/* <button className="btn btn-outline-primary btn-sm" onClick={() => addLigne("SB", "Salaire de base", 1)}>+ SB</button> */}
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => addLigne("PRIME", "Prime", 1)}
                                                            disabled={isClosed}
                                                        >
                                                            + PRIME
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => addLigne("HS", "Heures sup", 1)}
                                                            disabled={isClosed}
                                                        >
                                                            + HS
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => addLigne("TP", "Transport", 1)}
                                                            disabled={isClosed}
                                                        >
                                                            + Transport
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => addLigne("AVANCE", "Avance", 0)}
                                                            disabled={isClosed}
                                                        >
                                                            - AVANCE
                                                        </button>
                                                    </div>
                                                </div>

                                                {saisies.length === 0 ? (
                                                    <p className="text-muted mt-2">
                                                        Aucune ligne. Ajoutez des lignes au besoin.
                                                    </p>
                                                ) : (
                                                    <div className="table-responsive mt-2">
                                                        <table className="table table-sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>Code</th>
                                                                    <th>Libellé</th>
                                                                    <th>Op</th>
                                                                    <th>Montant</th>
                                                                    <th style={{ width: 1 }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {saisies.map((l, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{l.code}</td>
                                                                        <td>{l.libelle}</td>
                                                                        <td>{l.operation === 1 ? "+" : "-"}</td>
                                                                        <td>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                value={l.montant}
                                                                                onChange={(e) =>
                                                                                    updateMontant(idx, e.target.value)
                                                                                }
                                                                                disabled={isClosed}
                                                                            />
                                                                        </td>
                                                                        <td className="text-nowrap">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => removeLigne(idx)}
                                                                                disabled={isClosed}
                                                                                title="Retirer cette ligne"
                                                                            >
                                                                                −
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                <div className="text-end">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        disabled={!idEmployer || !moisPaieId || isClosed}
                                                        onClick={handleCalculer}
                                                    >
                                                        {loading ? "Calcul..." : "Calculer"}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Résultat du calcul */}
                                            {bulletin && (
                                                <div className="card p-3">
                                                    <h6>Bulletin</h6>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th>Code</th>
                                                                    <th>Libellé</th>
                                                                    <th>Op</th>
                                                                    <th>Taux %</th>
                                                                    <th>Montant (MGA)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {bulletin.lignes.map((l, i) => (
                                                                    <tr key={i}>
                                                                        <td>{l.code}</td>
                                                                        <td>{l.libelle}</td>
                                                                        <td>{l.operation === 1 ? "+" : "-"}</td>
                                                                        <td>{l.taux ?? ""}</td>
                                                                        <td>
                                                                            {Number(l.montant).toLocaleString("fr-FR")}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <th colSpan="4" className="text-end">
                                                                        Total +
                                                                    </th>
                                                                    <th>
                                                                        {Number(bulletin.totalPlus).toLocaleString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </th>
                                                                </tr>
                                                                <tr>
                                                                    <th colSpan="4" className="text-end">
                                                                        Total -
                                                                    </th>
                                                                    <th>
                                                                        {Number(bulletin.totalMoins).toLocaleString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </th>
                                                                </tr>
                                                                <tr className="table-info">
                                                                    <th colSpan="4" className="text-end">
                                                                        Brut imposable
                                                                    </th>
                                                                    <th>
                                                                        {Number(
                                                                            bulletin.brutImposable ?? 0
                                                                        ).toLocaleString("fr-FR")}
                                                                    </th>
                                                                </tr>
                                                                {bulletin.irsa != null && (
                                                                    <tr className="table-warning">
                                                                        <th colSpan="4" className="text-end">
                                                                            IRSA (déjà dans les -)
                                                                        </th>
                                                                        <th>
                                                                            {Number(bulletin.irsa).toLocaleString(
                                                                                "fr-FR"
                                                                            )}
                                                                        </th>
                                                                    </tr>
                                                                )}
                                                                <tr className="table-primary">
                                                                    <th colSpan="4" className="text-end">
                                                                        Brut
                                                                    </th>
                                                                    <th>
                                                                        {Number(bulletin.brut).toLocaleString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </th>
                                                                </tr>
                                                                <tr className="table-success">
                                                                    <th colSpan="4" className="text-end">
                                                                        Net à payer
                                                                    </th>
                                                                    <th>
                                                                        {Number(bulletin.netAPayer).toLocaleString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </th>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>

                                                    <div className="text-end">
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={handleEnregistrer}
                                                            disabled={isClosed}
                                                        >
                                                            Enregistrer
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm ms-2"
                                                            onClick={() => setBulletin(null)}
                                                        >
                                                            Réinitialiser
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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

export default PaieEmployer;
