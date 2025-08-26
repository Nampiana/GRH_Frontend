import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useRubriquePaie from "../../hook/rubriquePaie/useRubriquePaie";
import useSociete from "../../hook/societe/societeHook";
import ParametreGenereauxService from "../../services/parametreGenereaux/parametreGenereauxService";
import RubriqueService from "../../services/rubriquePaie/rubriqueService";

function RubriquePaie() {
    useTemplateScripts();

    // --- User / rôles ---
    const [user, setUser] = useState({ roles: 1, societe: "" });
    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u) setUser({ roles: u.roles, societe: u.societe });
    }, []);

    // --- Hook rubriques ---
    const {
        rubriques,
        loading,
        errorMsg,
        setErrorMsg,
        createRubrique,
        updateRubrique,
        deleteRubrique,
    } = useRubriquePaie();

    // --- Sociétés ---
    const { societe: societes, fetchSociete } = useSociete();
    useEffect(() => { fetchSociete(); }, [fetchSociete]);

    // --- Paramètres généraux ---
    const [params, setParams] = useState([]); // [{id, nomParametre, idSociete, pourcentage}]
    useEffect(() => {
        ParametreGenereauxService.getAll()
            .then(res => setParams(Array.isArray(res.data) ? res.data : []))
            .catch(console.error);
    }, []);

    // --- Filtrage / libellés ---
    const societeOptions = useMemo(() => {
        if (user.roles === 2) {
            const mine = societes.filter(s => s.id === user.societe);
            if (mine.length === 0 && user.societe) return [{ id: user.societe, nomSociete: "Mon entreprise" }];
            return mine;
        }
        return societes;
    }, [societes, user]);

    const labelSociete = (id) =>
        (societes.find(s => s.id === id) || societeOptions.find(s => s.id === id))?.nomSociete || "N/A";

    // params dispo selon société choisie dans le formulaire
    const paramsBySociete = (idSociete) => params.filter(p => p.idSociete === idSociete);

    const findParam = (id) => params.find(p => p.id === id);

    // --- Filtre admin tableau ---
    const [societeFilter, setSocieteFilter] = useState("");

    const rows = useMemo(() => {
        return (rubriques || []).filter(r => {
            if (user.roles === 2 && r.idSociete !== user.societe) return false;
            if (user.roles === 1 && societeFilter && r.idSociete !== societeFilter) return false;
            return true;
        });
    }, [rubriques, user, societeFilter]);

    // --- Modaux & sélection ---
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);

    // --- Formulaire ---
    const [code, setCode] = useState("");
    const [nomRubrique, setNomRubrique] = useState("");
    const [typeRubrique, setTypeRubrique] = useState("");
    const [operation, setOperation] = useState(1);
    const [idSociete, setIdSociete] = useState("");
    const [idParametreGenereaux, setIdParametreGenereaux] = useState(""); // null/"" = manuel

    // init rôle 2
    useEffect(() => {
        if (user.roles === 2) setIdSociete(user.societe || "");
    }, [user]);

    // reset param si la société change (éviter incohérence)
    useEffect(() => {
        setIdParametreGenereaux("");
    }, [idSociete]);

    const resetForm = () => {
        setSelected(null);
        setCode("");
        setNomRubrique("");
        setTypeRubrique("");
        setOperation(1);
        setIdSociete(user.roles === 2 ? user.societe || "" : "");
        setIdParametreGenereaux("");
        setErrorMsg("");
    };

    const openCreate = () => { resetForm(); setShowModal(true); };
    const openEdit = (r) => {
        setSelected(r);
        setCode(r.code || "");
        setNomRubrique(r.nomRubrique || "");
        setTypeRubrique(r.typeRubrique || "");
        setOperation(typeof r.operation === "number" ? r.operation : 1);
        setIdSociete(r.idSociete || (user.roles === 2 ? user.societe || "" : ""));
        setIdParametreGenereaux(r.idParametreGenereaux || "");
        setErrorMsg("");
        setShowModal(true);
    };
    const openDelete = (r) => { setSelected(r); setShowDelete(true); };
    const confirmDelete = () => {
        if (!selected) return;
        deleteRubrique(selected.id, () => {
            setShowDelete(false);
            setSelected(null);
        });
    };

    // validation
    const formValid = useMemo(() => {
        if (!code.trim() || !nomRubrique.trim() || !idSociete) return false;
        // si paramétrée, vérifier que le param appartient à la même société
        if (idParametreGenereaux) {
            const p = findParam(idParametreGenereaux);
            if (!p || p.idSociete !== idSociete) return false;
        }
        return true;
    }, [code, nomRubrique, idSociete, idParametreGenereaux]);

    const handleSave = () => {
        const payload = {
            code: code.trim().toUpperCase(),
            nomRubrique: nomRubrique.trim(),
            typeRubrique: typeRubrique || null,
            operation: Number(operation),
            idSociete,
            idParametreGenereaux: idParametreGenereaux || null, // null => manuel
        };

        if (selected) {
            updateRubrique(selected.id, payload, () => { setShowModal(false); resetForm(); });
        } else {
            createRubrique(payload, () => { setShowModal(false); resetForm(); });
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
                                                    <h5>Rubriques de Paie</h5>
                                                    <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                                        <i className="icofont icofont-plus"></i> Nouvelle rubrique
                                                    </button>
                                                </div>

                                                {/* Filtre admin */}
                                                {user.roles === 1 && (
                                                    <div className="mb-3">
                                                        <label>Filtrer par Société :</label>
                                                        <select
                                                            className="form-control"
                                                            value={societeFilter}
                                                            onChange={(e) => setSocieteFilter(e.target.value)}
                                                        >
                                                            <option value="">Toutes les sociétés</option>
                                                            {societeOptions.map(s => (
                                                                <option key={s.id} value={s.id}>{s.nomSociete}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

                                                {loading ? (
                                                    <p className="text-muted">Chargement…</p>
                                                ) : rows.length === 0 ? (
                                                    <p className="text-center text-muted">Aucune rubrique enregistrée.</p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Code</th>
                                                                    <th>Nom</th>
                                                                    <th>Type</th>
                                                                    <th>Op</th>
                                                                    <th>Mode</th>
                                                                    <th>Paramètre</th>
                                                                    <th>Taux (%)</th>
                                                                    <th>Société</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rows.map((r, i) => {
                                                                    const param = r.idParametreGenereaux ? findParam(r.idParametreGenereaux) : null;
                                                                    return (
                                                                        <tr key={r.id}>
                                                                            <td>{i + 1}</td>
                                                                            <td><strong>{r.code}</strong></td>
                                                                            <td>{r.nomRubrique}</td>
                                                                            <td>{r.typeRubrique || "—"}</td>
                                                                            <td>{r.operation === 1 ? "+" : "-"}</td>
                                                                            <td>{param ? "Paramètre" : "Manuel"}</td>
                                                                            <td>{param ? param.nomParametre : "—"}</td>
                                                                            <td>{param ? param.pourcentage : "—"}</td>
                                                                            <td>{labelSociete(r.idSociete)}</td>
                                                                            <td>
                                                                                <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(r)}>
                                                                                    <i className="icofont icofont-edit"></i> Modifier
                                                                                </button>
                                                                                <button className="btn btn-danger btn-sm" onClick={() => openDelete(r)}>
                                                                                    <i className="icofont icofont-trash"></i> Supprimer
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
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

            {/* Modal Création / Edition */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{selected ? "Modifier la rubrique" : "Créer une rubrique"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <label>Code</label>
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="Ex: SB, CNAPS, HS"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            maxLength={10}
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <label>Nom de la rubrique</label>
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="Ex: Salaire de base"
                                            value={nomRubrique}
                                            onChange={(e) => setNomRubrique(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <label>Type</label>
                                        <select
                                            className="form-control mb-2"
                                            value={typeRubrique}
                                            onChange={(e) => setTypeRubrique(e.target.value)}
                                        >
                                            <option value="">—</option>
                                            <option value="I">I (Imposable)</option>
                                            <option value="C">C (Cotisation)</option>
                                            <option value="N">N (Non imposable)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label>Opération</label>
                                        <select
                                            className="form-control mb-2"
                                            value={operation}
                                            onChange={(e) => setOperation(Number(e.target.value))}
                                        >
                                            <option value={1}>+ (Crédit)</option>
                                            <option value={0}>- (Débit)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label>Société</label>
                                        <select
                                            className="form-control mb-2"
                                            value={idSociete}
                                            onChange={(e) => setIdSociete(e.target.value)}
                                            disabled={user.roles === 2}
                                        >
                                            <option value="">Sélectionner une société</option>
                                            {societeOptions.map(s => (
                                                <option key={s.id} value={s.id}>{s.nomSociete}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Paramètre généraux (optionnel) */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Paramètre généraux (pourcentage % du SB)</label>
                                        <select
                                            className="form-control"
                                            value={idParametreGenereaux}
                                            onChange={(e) => setIdParametreGenereaux(e.target.value)}
                                            disabled={!idSociete} // il faut d'abord choisir la société
                                        >
                                            <option value="">— Aucun (manuel) —</option>
                                            {paramsBySociete(idSociete).map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nomParametre} — {p.pourcentage}%
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {!idParametreGenereaux && (
                                    <div className="alert alert-info mt-3 mb-0 py-2">
                                        Cette rubrique sera <strong>saisie manuellement</strong> (PRIME, HS, AVANCE…).
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={!formValid}>
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
                                    Supprimer la rubrique :
                                    <br />
                                    <strong>{selected?.code} — {selected?.nomRubrique}</strong> ?
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

export default RubriquePaie;
