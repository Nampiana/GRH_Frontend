import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import useMoisPaie from "../../hook/moispaie/useMoisPaie";

function MoisPaie() {
    useTemplateScripts();

    const { mois, loading, errorMsg, setErrorMsg, createMois, updateMois, deleteMois } = useMoisPaie();

    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);

    // champ formulaire
    const [periode, setPeriode] = useState(""); // "YYYY-MM"

    // normalise au format "YYYY-MM" (au cas où)
    const normalizePeriode = (p) => (p || "").slice(0, 7);

    const resetForm = () => {
        setSelected(null);
        setPeriode("");
        setErrorMsg("");
    };

    const openCreate = () => { resetForm(); setShowModal(true); };

    const openEdit = (row) => {
        setSelected(row);
        setPeriode(normalizePeriode(row.periode));
        setErrorMsg("");
        setShowModal(true);
    };

    const openDelete = (row) => { setSelected(row); setShowDelete(true); };

    const confirmDelete = () => {
        if (!selected) return;
        deleteMois(selected.id, () => {
            setShowDelete(false);
            setSelected(null);
        });
    };

    // Validation simple + pré-contrôle doublon côté UI
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
                                    <div className="page-wrapper">
                                        <div className="page-body">
                                            <div className="card p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5>Mois de Paie</h5>
                                                    <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                                        <i className="icofont icofont-plus"></i> Nouveau mois
                                                    </button>
                                                </div>

                                                {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

                                                {loading ? (
                                                    <p className="text-muted">Chargement…</p>
                                                ) : mois.length === 0 ? (
                                                    <p className="text-center text-muted">Aucun mois enregistré.</p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Période (YYYY-MM)</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {mois.map((m, i) => (
                                                                    <tr key={m.id}>
                                                                        <td>{i + 1}</td>
                                                                        <td><strong>{normalizePeriode(m.periode)}</strong></td>
                                                                        <td>
                                                                            <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(m)}>
                                                                                <i className="icofont icofont-edit"></i> Modifier
                                                                            </button>
                                                                            <button className="btn btn-danger btn-sm" onClick={() => openDelete(m)}>
                                                                                <i className="icofont icofont-trash"></i> Supprimer
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
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{selected ? "Modifier le mois" : "Créer un mois"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label>Période</label>
                                <input
                                    type="month"
                                    className="form-control"
                                    value={normalizePeriode(periode)}
                                    onChange={(e) => setPeriode(e.target.value)}
                                />
                                {isDuplicateLocal && (
                                    <div className="alert alert-warning py-2 mt-2">
                                        Ce mois existe déjà.
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={!formValid || isDuplicateLocal}
                                >
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
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="icofont icofont-warning-alt"></i> Confirmer la suppression
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <p className="fs-5">
                                    Supprimer le mois :
                                    <br />
                                    <strong>{normalizePeriode(selected?.periode)}</strong> ?
                                </p>
                            </div>
                            <div className="modal-footer justify-content-center">
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
