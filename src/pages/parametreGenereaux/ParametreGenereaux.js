import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useParametreGenereaux from "../../hook/parametreGenereaux/useParametreGenereaux";
import useSociete from "../../hook/societe/societeHook"; // ← votre hook fourni

function ParametreGenereaux() {
    useTemplateScripts();

    // --- User / rôles ---
    const [user, setUser] = useState({ roles: 1, societe: "" });
    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u) setUser({ roles: u.roles, societe: u.societe });
    }, []);

    // --- Hooks data ---
    const {
        parametres,
        loading,
        createParametre,
        updateParametre,
        deleteParametre,
    } = useParametreGenereaux();

    const { societe: societes, fetchSociete } = useSociete(); // renvoie array paginé (page=0 par défaut)

    useEffect(() => {
        fetchSociete(); // charge la page 0
    }, [fetchSociete]);

    // --- Form states ---
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const [nomParametre, setNomParametre] = useState("");
    const [idSociete, setIdSociete] = useState("");
    const [pourcentage, setPourcentage] = useState("");

    // --- Filtre liste (admin peut filtrer par société) ---
    const [societeFilter, setSocieteFilter] = useState("");

    // Options sociétés selon rôle (rôle 2 => seulement la sienne)
    const societeOptions = useMemo(() => {
        if (user.roles === 2) {
            const mine = societes.filter((s) => s.id === user.societe);
            // fallback au cas où la société de l'utilisateur n'est pas dans la page paginée
            if (mine.length === 0 && user.societe) {
                return [{ id: user.societe, nomSociete: "Mon entreprise" }];
            }
            return mine;
        }
        return societes;
    }, [societes, user]);

    // Helper libellé société
    const labelSociete = (id) =>
        (societes.find((s) => s.id === id) || societeOptions.find((s) => s.id === id))?.nomSociete || "N/A";

    // --- Handlers ---
    const resetForm = () => {
        setSelected(null);
        setNomParametre("");
        setIdSociete(user.roles === 2 ? user.societe || "" : "");
        setPourcentage("");
    };

    useEffect(() => {
        // À l'ouverture, si rôle 2, pré-remplir sa société & la rendre non modifiable
        if (showModal && user.roles === 2) {
            setIdSociete(user.societe || "");
        }
    }, [showModal, user]);

    const handleCreateOrUpdate = () => {
        const payload = {
            nomParametre: nomParametre.trim(),
            idSociete: idSociete,
            pourcentage: pourcentage === "" ? null : Number(pourcentage),
        };

        if (!payload.nomParametre || !payload.idSociete || payload.pourcentage === null || isNaN(payload.pourcentage)) {
            return;
        }

        if (selected) {
            updateParametre(selected.id, payload, () => {
                setShowModal(false);
                resetForm();
            });
        } else {
            createParametre(payload, () => {
                setShowModal(false);
                resetForm();
            });
        }
    };

    const openEdit = (row) => {
        setSelected(row);
        setNomParametre(row.nomParametre || "");
        setIdSociete(row.idSociete || (user.roles === 2 ? user.societe || "" : ""));
        setPourcentage(row.pourcentage ?? "");
        setShowModal(true);
    };

    const openDelete = (row) => {
        setSelected(row);
        setShowDelete(true);
    };

    const confirmDelete = () => {
        if (!selected) return;
        deleteParametre(selected.id, () => {
            setShowDelete(false);
            setSelected(null);
        });
    };

    // Filtrage d'affichage de la table selon rôle & filtre admin
    const rows = useMemo(() => {
        return (parametres || []).filter((p) => {
            if (user.roles === 2 && p.idSociete !== user.societe) return false;
            if (user.roles === 1 && societeFilter && p.idSociete !== societeFilter) return false;
            return true;
        });
    }, [parametres, user, societeFilter]);

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
                                                    <h5>Paramètres Généraux</h5>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => { resetForm(); setShowModal(true); }}
                                                    >
                                                        <i className="icofont icofont-plus"></i> Nouveau paramètre
                                                    </button>
                                                </div>

                                                {/* Filtre par société (admin) */}
                                                {user.roles === 1 && (
                                                    <div className="mb-3">
                                                        <label>Filtrer par Société :</label>
                                                        <select
                                                            className="form-control"
                                                            value={societeFilter}
                                                            onChange={(e) => setSocieteFilter(e.target.value)}
                                                        >
                                                            <option value="">Toutes les sociétés</option>
                                                            {societeOptions.map((s) => (
                                                                <option key={s.id} value={s.id}>{s.nomSociete}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Table */}
                                                {loading ? (
                                                    <p className="text-muted">Chargement…</p>
                                                ) : rows.length === 0 ? (
                                                    <p className="text-center text-muted">Aucun paramètre enregistré.</p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Nom du paramètre</th>
                                                                    <th>Société</th>
                                                                    <th>Pourcentage</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rows.map((p, idx) => (
                                                                    <tr key={p.id}>
                                                                        <td>{idx + 1}</td>
                                                                        <td>{p.nomParametre}</td>
                                                                        <td>{labelSociete(p.idSociete)}</td>
                                                                        <td>{p.pourcentage != null ? `${p.pourcentage} %` : "—"}</td>
                                                                        <td>
                                                                            <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(p)}>
                                                                                <i className="icofont icofont-edit"></i> Modifier
                                                                            </button>
                                                                            <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}>
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

            {/* Modal création / édition */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{selected ? "Modifier Paramètre" : "Créer Paramètre"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label>Nom du paramètre</label>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Ex: CNaPS"
                                    value={nomParametre}
                                    onChange={(e) => setNomParametre(e.target.value)}
                                />

                                <label>Société</label>
                                <select
                                    className="form-control mb-2"
                                    value={idSociete}
                                    onChange={(e) => setIdSociete(e.target.value)}
                                    disabled={user.roles === 2} // rôle 2 : verrouillé
                                >
                                    <option value="">Sélectionner une société</option>
                                    {societeOptions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nomSociete}
                                        </option>
                                    ))}
                                </select>

                                <label>Pourcentage (%)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Ex: 1 ou 5"
                                    value={pourcentage}
                                    onChange={(e) => setPourcentage(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateOrUpdate}
                                    disabled={
                                        nomParametre.trim() === "" ||
                                        idSociete === "" ||
                                        pourcentage === "" ||
                                        isNaN(Number(pourcentage))
                                    }
                                >
                                    {selected ? "Enregistrer" : "Créer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal suppression */}
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
                                    Supprimer le paramètre :
                                    <br />
                                    <strong>{selected?.nomParametre}</strong> ?
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

export default ParametreGenereaux;
