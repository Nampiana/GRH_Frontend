import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useMoisPaie from "../../hook/moispaie/useMoisPaie";
import useCyclePaie from "../../hook/cyclePaie/useCyclePaie";
import useSociete from "../../hook/societe/societeHook";

// Importations des icônes Font Awesome pour un design plus moderne
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faLock, faUnlockAlt, faExclamationTriangle, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';

function MoisPaie() {
    useTemplateScripts();

    const { mois, loading, errorMsg, setErrorMsg, createMois, updateMois, deleteMois, fetchMois } = useMoisPaie();
    const { ouvrirMois, cloturerMois, busy, error: cycleErr, setError: setCycleErr } = useCyclePaie();
    const { societe: societes, fetchSociete } = useSociete();

    useEffect(() => { fetchSociete(); }, [fetchSociete]);

    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);

    const [periode, setPeriode] = useState("");
    const [openPeriode, setOpenPeriode] = useState("");
    const [openSociete, setOpenSociete] = useState("");

    const normalizePeriode = (p) => (p || "").slice(0, 7);

    const resetForm = () => {
        setSelected(null);
        setPeriode("");
        setErrorMsg("");
    };

    const openCreate = () => { resetForm(); setShowModal(true); };
    const openEdit = (row) => { setSelected(row); setPeriode(normalizePeriode(row.periode)); setErrorMsg(""); setShowModal(true); };
    const openDelete = (row) => { setSelected(row); setShowDelete(true); };

    const confirmDelete = () => {
        if (!selected) return;
        deleteMois(selected.id, () => {
            setShowDelete(false);
            setSelected(null);
        });
    };

    const formValid = useMemo(() => !!normalizePeriode(periode), [periode]);

    const isDuplicateLocal = useMemo(() => {
        const p = normalizePeriode(periode);
        if (!p) return false;
        return mois.some((m) => m.periode === p && (!selected || selected.periode !== p));
    }, [periode, mois, selected]);

    const handleSave = () => {
        const payload = { periode: normalizePeriode(periode) };
        if (selected) {
            updateMois(selected.id, payload, () => { setShowModal(false); resetForm(); });
        } else {
            createMois(payload, () => { setShowModal(false); resetForm(); });
        }
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
                                    <div className="page-wrapper p-4"> {/* Ajout de padding */}
                                        <div className="page-header d-flex justify-content-between align-items-center mb-4">
                                            <h4 className="fw-bold">Gestion des Mois de Paie</h4>
                                        </div>

                                        {/* Nouvelle carte pour l'ouverture du cycle, avec un design plus moderne */}
                                        <div className="card shadow-sm p-4 mb-4 rounded-lg border-0">
                                            <h5 className="card-title text-primary mb-3">
                                                <FontAwesomeIcon icon={faUnlockAlt} className="me-2" /> Ouverture d'un nouveau cycle
                                            </h5>
                                            {cycleErr && <div className="alert alert-danger p-2 rounded-lg">{cycleErr}</div>}
                                            <div className="row g-3">
                                                <div className="col-md-5">
                                                    <label className="form-label">Société</label>
                                                    <select className="form-select" value={openSociete} onChange={e => setOpenSociete(e.target.value)}>
                                                        <option value="">Sélectionner une société</option>
                                                        {societes.map(s => <option key={s.id} value={s.id}>{s.nomSociete}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">Période</label>
                                                    <input type="month" className="form-control" value={openPeriode} onChange={e => setOpenPeriode(e.target.value.slice(0, 7))} />
                                                </div>
                                                <div className="col-md-3 d-flex align-items-end">
                                                    <button
                                                        className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center"
                                                        disabled={!openSociete || !openPeriode || busy}
                                                        onClick={() => ouvrirMois(openSociete, openPeriode, () => { setOpenPeriode(""); setOpenSociete(""); fetchMois(); })}
                                                    >
                                                        {busy ? <FontAwesomeIcon icon={faSyncAlt} spin className="me-2" /> : <FontAwesomeIcon icon={faUnlockAlt} className="me-2" />}
                                                        {busy ? "Ouverture..." : "Ouvrir le mois"}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-muted small mt-3">Cette action génère les données de paie de base pour le mois sélectionné.</div>
                                        </div>

                                        {/* Nouvelle carte pour le tableau des mois de paie */}
                                        <div className="card shadow-sm p-4 rounded-lg border-0">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="card-title text-primary mb-0">
                                                    <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Mois de paie existants
                                                </h5>
                                                <button className="btn btn-primary d-flex align-items-center" onClick={openCreate}>
                                                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Nouveau mois
                                                </button>
                                            </div>

                                            {errorMsg && <div className="alert alert-danger p-2 rounded-lg">{errorMsg}</div>}

                                            {loading ? (
                                                <p className="text-center text-muted py-5">
                                                    <FontAwesomeIcon icon={faSyncAlt} spin size="2x" className="mb-2" />
                                                    <br />
                                                    Chargement en cours...
                                                </p>
                                            ) : mois.length === 0 ? (
                                                <div className="text-center text-muted py-5">
                                                    <p className="fs-5">Aucun mois enregistré.</p>
                                                    <p>Cliquez sur "Nouveau mois" pour commencer.</p>
                                                </div>
                                            ) : (
                                                <div className="table-responsive">
                                                    <table className="table table-hover align-middle">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Période</th>
                                                                <th>Société</th>
                                                                <th>Statut</th>
                                                                <th className="text-end">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mois.map((m, i) => (
                                                                <tr key={m.id}>
                                                                    <td><strong className="text-dark">{normalizePeriode(m.periode)}</strong></td>
                                                                    <td>{societes.find(s => s.id === m.idSociete)?.nomSociete || "—"}</td>
                                                                    <td>
                                                                        <span className={`badge rounded-pill ${m.statut === "CLOSED" ? "bg-secondary" : "bg-success"}`}>
                                                                            {m.statut === "CLOSED" ? "Clôturé" : "Ouvert"}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-end">
                                                                        {m.statut !== "CLOSED" && (
                                                                            <button
                                                                                className="btn btn-outline-dark btn-sm me-2"
                                                                                onClick={() => cloturerMois(m.id, () => fetchMois())}
                                                                                disabled={busy}
                                                                            >
                                                                                <FontAwesomeIcon icon={faLock} className="me-1" /> Clôturer
                                                                            </button>
                                                                        )}
                                                                        <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(m)}>
                                                                            <FontAwesomeIcon icon={faEdit} />
                                                                        </button>
                                                                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(m)}>
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
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

            {/* Modal Création / Édition */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-primary text-white p-3 rounded-top-3">
                                <h5 className="modal-title">{selected ? "Modifier le mois" : "Créer un mois"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label htmlFor="periodeInput" className="form-label">Période</label>
                                    <input
                                        id="periodeInput"
                                        type="month"
                                        className="form-control"
                                        value={normalizePeriode(periode)}
                                        onChange={(e) => setPeriode(e.target.value)}
                                    />
                                </div>
                                {isDuplicateLocal && <div className="alert alert-warning p-2 mt-2 rounded-lg">Ce mois existe déjà.</div>}
                                {errorMsg && <div className="alert alert-danger p-2 mt-2 rounded-lg">{errorMsg}</div>}
                            </div>
                            <div className="modal-footer d-flex justify-content-end p-3">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={!formValid || isDuplicateLocal}>
                                    {selected ? "Enregistrer" : "Créer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Suppression */}
            {showDelete && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-danger text-white p-3 rounded-top-3">
                                <h5 className="modal-title">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Confirmer la suppression
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
                            </div>
                            <div className="modal-body text-center p-4">
                                <p className="fs-5 text-dark">
                                    Êtes-vous sûr de vouloir supprimer la période :
                                </p>
                                <strong className="d-block fs-3 text-danger">{normalizePeriode(selected?.periode)}</strong>
                                <p className="mt-2 text-muted">Cette action est irréversible.</p>
                            </div>
                            <div className="modal-footer justify-content-center p-3">
                                <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Annuler</button>
                                <button className="btn btn-danger" onClick={confirmDelete}>Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MoisPaie;