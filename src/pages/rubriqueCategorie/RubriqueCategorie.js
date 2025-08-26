import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useRubriqueCategorie from "../../hook/rubriqueCategorie/useRubriqueCategorie";

// ⚠️ On réutilise tes services existants
import CategorieServices from "../../services/categorie/categorie"; // ton service catégories
import RubriqueService from "../../services/rubriquePaie/rubriqueService"; // ton service rubriques

function RubriqueCategorie() {
    useTemplateScripts();

    // --- User / rôles ---
    const [user, setUser] = useState({ roles: 1, societe: "" });
    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u) setUser({ roles: u.roles, societe: u.societe });
    }, []);

    // --- Hooks associations ---
    const {
        rubriqueCategories,
        loading,
        errorMsg,
        setErrorMsg,
        createRubriqueCategorie,
        updateRubriqueCategorie,
        deleteRubriqueCategorie,
    } = useRubriqueCategorie();

    // --- Données de référence: Catégories & Rubriques ---
    const [categories, setCategories] = useState([]); // [{id, nomCategorie?, idSociete? ...}]
    const [rubriques, setRubriques] = useState([]);   // [{id, code, nomRubrique, idSociete, ...}]
    const [refLoading, setRefLoading] = useState(false);

    useEffect(() => {
        setRefLoading(true);
        Promise.all([
            CategorieServices.getAll?.() || Promise.resolve({ data: [] }),
            RubriqueService.getAll()
        ])
            .then(([catRes, rubRes]) => {
                // Supporte array ou {content:[]}
                const cats = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.content || []);
                const rubs = Array.isArray(rubRes.data) ? rubRes.data : [];
                setCategories(cats);
                setRubriques(rubs);
            })
            .catch((err) => console.error(err))
            .finally(() => setRefLoading(false));
    }, []);

    // --- Map pour accès rapide ---
    const catById = useMemo(() => {
        const m = new Map();
        categories.forEach(c => m.set(c.id, c));
        return m;
    }, [categories]);

    const rubById = useMemo(() => {
        const m = new Map();
        rubriques.forEach(r => m.set(r.id, r));
        return m;
    }, [rubriques]);

    // --- Filtrage par rôle 2: n'afficher que les associations dont la rubrique appartient à sa société ---
    const [categorieFilter, setCategorieFilter] = useState("");
    const rows = useMemo(() => {
        return (rubriqueCategories || []).filter((rc) => {
            const rub = rubById.get(rc.idRubriquePaie);
            if (!rub) return false; // si la rubrique n'est pas trouvée, on masque
            if (user.roles === 2 && rub.idSociete !== user.societe) return false;
            if (categorieFilter && rc.idCategorie !== categorieFilter) return false;
            return true;
        });
    }, [rubriqueCategories, rubById, user, categorieFilter]);

    // --- Helpers label ---
    const labelCategorie = (c) => {
        if (!c) return "N/A";
        return c.nomCategorie || c.libelle || c.nom || c.name || c.id;
    };
    const labelRubrique = (r) => {
        if (!r) return "N/A";
        const name = r.nomRubrique || r.nom || r.name || "";
        return r.code ? `${r.code}${name ? " — " + name : ""}` : (name || r.id);
    };

    // --- Formulaire ---
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);

    const [idCategorie, setIdCategorie] = useState("");
    const [idRubriquePaie, setIdRubriquePaie] = useState("");

    const resetForm = () => {
        setSelected(null);
        setIdCategorie("");
        setIdRubriquePaie("");
        setErrorMsg("");
    };

    const openCreate = () => { resetForm(); setShowModal(true); };

    const openEdit = (rc) => {
        setSelected(rc);
        setIdCategorie(rc.idCategorie || "");
        setIdRubriquePaie(rc.idRubriquePaie || "");
        setErrorMsg("");
        setShowModal(true);
    };

    const openDelete = (rc) => { setSelected(rc); setShowDelete(true); };

    const confirmDelete = () => {
        if (!selected) return;
        deleteRubriqueCategorie(selected.id, () => {
            setShowDelete(false);
            setSelected(null);
        });
    };

    // --- Listes déroulantes filtrées ---
    const categoriesOptions = useMemo(() => {
        // Si le modèle Catégorie contient idSociete, on filtre pour rôle 2
        if (user.roles === 2) {
            return categories.filter(c => !c.idSociete || c.idSociete === user.societe);
        }
        return categories;
    }, [categories, user]);

    const rubriquesOptions = useMemo(() => {
        if (user.roles === 2) {
            return rubriques.filter(r => r.idSociete === user.societe);
        }
        return rubriques;
    }, [rubriques, user]);

    // --- Validation
    const formValid = useMemo(() => !!idCategorie && !!idRubriquePaie, [idCategorie, idRubriquePaie]);

    const handleSave = () => {
        const payload = { idCategorie, idRubriquePaie };
        if (selected) {
            updateRubriqueCategorie(selected.id, payload, () => {
                setShowModal(false);
                resetForm();
            });
        } else {
            createRubriqueCategorie(payload, () => {
                setShowModal(false);
                resetForm();
            });
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
                                                    <h5>Rubriques par Catégorie</h5>
                                                    <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                                        <i className="icofont icofont-plus"></i> Lier une rubrique
                                                    </button>
                                                </div>

                                                {(errorMsg) && <div className="alert alert-danger py-2">{errorMsg}</div>}
                                                {refLoading ? <p className="text-muted">Chargement des références…</p> : null}

                                                {/* Filtre par catégorie pour ROLE 1 (utile si beaucoup de données) */}
                                                <div className="mb-3">
                                                    <label>Filtrer par Catégorie :</label>
                                                    <select
                                                        className="form-control"
                                                        value={categorieFilter}
                                                        onChange={(e) => setCategorieFilter(e.target.value)}
                                                    >
                                                        <option value="">Toutes</option>
                                                        {categoriesOptions.map((c) => (
                                                            <option key={c.id} value={c.id}>{labelCategorie(c)}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {loading ? (
                                                    <p className="text-muted">Chargement…</p>
                                                ) : rows.length === 0 ? (
                                                    <p className="text-center text-muted">Aucune association enregistrée.</p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Catégorie</th>
                                                                    <th>Rubrique</th>
                                                                    <th>Société de la Rubrique</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rows.map((rc, i) => {
                                                                    const c = catById.get(rc.idCategorie);
                                                                    const r = rubById.get(rc.idRubriquePaie);
                                                                    return (
                                                                        <tr key={rc.id}>
                                                                            <td>{i + 1}</td>
                                                                            <td>{labelCategorie(c)}</td>
                                                                            <td>{labelRubrique(r)}</td>
                                                                            <td>{r?.idSociete || "—"}</td>
                                                                            <td>
                                                                                <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(rc)}>
                                                                                    <i className="icofont icofont-edit"></i> Modifier
                                                                                </button>
                                                                                <button className="btn btn-danger btn-sm" onClick={() => openDelete(rc)}>
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

            {/* Modal Création / Édition */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{selected ? "Modifier l'association" : "Lier une rubrique à une catégorie"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Catégorie</label>
                                        <select
                                            className="form-control mb-2"
                                            value={idCategorie}
                                            onChange={(e) => setIdCategorie(e.target.value)}
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categoriesOptions.map((c) => (
                                                <option key={c.id} value={c.id}>{labelCategorie(c)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label>Rubrique de paie</label>
                                        <select
                                            className="form-control mb-2"
                                            value={idRubriquePaie}
                                            onChange={(e) => setIdRubriquePaie(e.target.value)}
                                        >
                                            <option value="">Sélectionner une rubrique</option>
                                            {rubriquesOptions.map((r) => (
                                                <option key={r.id} value={r.id}>{labelRubrique(r)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {user.roles === 2 && (
                                    <div className="alert alert-info py-2 mt-1 mb-0">
                                        Vous ne pouvez sélectionner que les <b>rubriques</b> de votre société.
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
                                <h5 className="modal-title">
                                    <i className="icofont icofont-warning-alt"></i> Confirmer la suppression
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <p className="fs-5">
                                    Supprimer cette association Catégorie ↔ Rubrique ?
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

export default RubriqueCategorie;
