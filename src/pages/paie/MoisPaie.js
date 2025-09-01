import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useMoisPaie from "../../hook/moispaie/useMoisPaie";
import useCyclePaie from "../../hook/cyclePaie/useCyclePaie";
import useSociete from "../../hook/societe/societeHook";

function MoisPaie() {
    useTemplateScripts();

    const { mois, loading, errorMsg, setErrorMsg, createMois, updateMois, deleteMois, fetchMois } = useMoisPaie();
    const { ouvrirMois, cloturerMois, busy, error: cycleErr, setError: setCycleErr } = useCyclePaie();
    const { societe: societes, fetchSociete } = useSociete();

    useEffect(() => { fetchSociete(); }, [fetchSociete]);

    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);

    const [periode, setPeriode] = useState(""); // CRUD classique "YYYY-MM"

    // Ouverture cycle
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
                                    <div className="page-wrapper">
                                        <div className="page-body">

                                            {/* Ouverture du cycle */}
                                            <div className="card p-3 mb-3">
                                                <h6>Ouverture de mois (cycle)</h6>
                                                {cycleErr && <div className="alert alert-danger py-2">{cycleErr}</div>}
                                                <div className="row g-2">
                                                    <div className="col-md-5">
                                                        <label>Société</label>
                                                        <select className="form-control" value={openSociete} onChange={e => setOpenSociete(e.target.value)}>
                                                            <option value="">Sélectionner</option>
                                                            {societes.map(s => <option key={s.id} value={s.id}>{s.nomSociete}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>Période</label>
                                                        <input type="month" className="form-control" value={openPeriode} onChange={e => setOpenPeriode(e.target.value.slice(0, 7))} />
                                                    </div>
                                                    <div className="col-md-3 d-flex align-items-end">
                                                        <button
                                                            className="btn btn-success w-100"
                                                            disabled={!openSociete || !openPeriode || busy}
                                                            onClick={() => ouvrirMois(openSociete, openPeriode, () => { setOpenPeriode(""); setOpenSociete(""); fetchMois(); })}
                                                        >
                                                            {busy ? "Ouverture..." : "Ouvrir le mois"}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-muted mt-2">Ouvre le mois, ajoute +2,5j congés et génère SB + rubriques à % pour tous les employés actifs.</div>
                                            </div>

                                            <div className="card p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5>Mois de Paie (CRUD basique)</h5>
                                                    <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                                        <i className="icofont icofont-plus"></i> Nouveau (manuel)
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
                                                                    <th>Période</th>
                                                                    <th>Société</th>
                                                                    <th>Statut</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {mois.map((m, i) => (
                                                                    <tr key={m.id}>
                                                                        <td>{i + 1}</td>
                                                                        <td><strong>{(m.periode || "").slice(0, 7)}</strong></td>
                                                                        <td>{societes.find(s => s.id === m.idSociete)?.nomSociete || "—"}</td>
                                                                        <td>
                                                                            <span className={`badge ${m.statut === "CLOSED" ? "bg-secondary" : "bg-success"}`}>
                                                                                {m.statut || "OPEN"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="d-flex gap-2">
                                                                            <button className="btn btn-warning btn-sm" onClick={() => openEdit(m)}>
                                                                                <i className="icofont icofont-edit"></i> Modifier
                                                                            </button>
                                                                            <button className="btn btn-danger btn-sm" onClick={() => openDelete(m)}>
                                                                                <i className="icofont icofont-trash"></i> Supprimer
                                                                            </button>
                                                                            {m.statut !== "CLOSED" && (
                                                                                <button
                                                                                    className="btn btn-outline-dark btn-sm"
                                                                                    onClick={() => cloturerMois(m.id, () => fetchMois())}
                                                                                    disabled={busy}
                                                                                >
                                                                                    Clôturer
                                                                                </button>
                                                                            )}
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

            {/* Modal Création / Édition (CRUD simple) */}
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
                                {isDuplicateLocal && <div className="alert alert-warning py-2 mt-2">Ce mois existe déjà.</div>}
                            </div>
                            <div className="modal-footer">
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
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title"><i className="icofont icofont-warning-alt"></i> Confirmer la suppression</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <p className="fs-5">
                                    Supprimer le mois :<br />
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
