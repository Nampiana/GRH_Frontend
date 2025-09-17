import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useRubriqueCategorie from "../../hook/rubriqueCategorie/useRubriqueCategorie";

// ⚠️ On réutilise tes services existants
import CategorieServices from "../../services/categorie/categorie";
import RubriqueService from "../../services/rubriquePaie/rubriqueService";
import SocieteService from "../../services/societe/societeService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faPlus,
  faEdit,
  faTrash,
  faBuilding,
  faTimes,
  faSave,
  faWarning,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [categories, setCategories] = useState([]);
  const [rubriques, setRubriques] = useState([]);
  const [refLoading, setRefLoading] = useState(false);
  const [societes, setSocietes] = useState([]);

  useEffect(() => {
    setRefLoading(true);
    Promise.all([
      CategorieServices.getAll?.() || Promise.resolve({ data: [] }),
      RubriqueService.getAll(),
      SocieteService.getAll?.() || Promise.resolve({ data: [] }),
    ])
      .then(([catRes, rubRes, socRes]) => {
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.content || [];
        const rubs = Array.isArray(rubRes.data) ? rubRes.data : [];
        const socs = Array.isArray(socRes.data) ? socRes.data : socRes.data?.content || [];
        setCategories(cats);
        setRubriques(rubs);
        setSocietes(socs);
      })
      .catch((err) => {
        console.error("Erreur de chargement des données de référence", err);
        toast.error("Échec du chargement des données de référence.");
      })
      .finally(() => setRefLoading(false));
  }, []);

  // --- Map pour accès rapide ---
  const catById = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const rubById = useMemo(() => {
    const m = new Map();
    rubriques.forEach((r) => m.set(r.id, r));
    return m;
  }, [rubriques]);

  const societeById = useMemo(() => {
    const m = new Map();
    societes.forEach((s) => m.set(s.id, s));
    return m;
  }, [societes]);

  // --- Filtrage par rôle 2: n'afficher que les associations dont la rubrique appartient à sa société ---
  const [categorieFilter, setCategorieFilter] = useState("");
  const rows = useMemo(() => {
    return (rubriqueCategories || []).filter((rc) => {
      const rub = rubById.get(rc.idRubriquePaie);
      if (!rub) return false;
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
    return r.code ? `${r.code}${name ? " — " + name : ""}` : name || r.id;
  };

  const labelSociete = (s) => {
    if (!s) return "—";
    return s.nomSociete || s.raisonSociale || s.nom || s.name || s.id;
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

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (rc) => {
    setSelected(rc);
    setIdCategorie(rc.idCategorie || "");
    setIdRubriquePaie(rc.idRubriquePaie || "");
    setErrorMsg("");
    setShowModal(true);
  };

  const openDelete = (rc) => {
    setSelected(rc);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (!selected) return;
    deleteRubriqueCategorie(selected.id, () => {
      toast.info("Association supprimée avec succès.");
      setShowDelete(false);
      setSelected(null);
    });
  };

  // --- Listes déroulantes filtrées ---
  const categoriesOptions = useMemo(() => {
    if (user.roles === 2) {
      return categories.filter((c) => !c.idSociete || c.idSociete === user.societe);
    }
    return categories;
  }, [categories, user]);

  const rubriquesOptions = useMemo(() => {
    if (user.roles === 2) {
      return rubriques.filter((r) => r.idSociete === user.societe);
    }
    return rubriques;
  }, [rubriques, user]);

  // --- Validation
  const formValid = useMemo(() => !!idCategorie && !!idRubriquePaie, [idCategorie, idRubriquePaie]);

  const handleSave = () => {
    const payload = { idCategorie, idRubriquePaie };
    if (selected) {
      updateRubriqueCategorie(selected.id, payload, () => {
        toast.success("Association modifiée avec succès !");
        setShowModal(false);
        resetForm();
      });
    } else {
      createRubriqueCategorie(payload, () => {
        toast.success("Nouvelle association créée !");
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
            <div className="pcoded-content px-4">
              <div className="page-wrapper pt-4">
                <div className="page-body">
                  <h4 className="mb-4 text-primary fw-bold">
                    <FontAwesomeIcon icon={faLink} className="me-2" />
                    Rubriques par Catégorie
                  </h4>
                  <ToastContainer position="top-right" autoClose={2000} />

                  <div className="card shadow-sm border-0 rounded-3 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        <FontAwesomeIcon icon={faList} className="me-2" />
                        Liste des associations
                      </h5>
                      <button className="btn btn-primary btn-sm" onClick={openCreate}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Lier une rubrique
                      </button>
                    </div>
                    <hr className="mb-4" />

                    {refLoading ? (
                      <div className="text-center text-muted py-2">
                        <p>Chargement des références...</p>
                      </div>
                    ) : null}

                    {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

                    <div className="mb-3">
                      <label className="form-label text-muted">Filtrer par Catégorie :</label>
                      <select
                        className="form-control"
                        value={categorieFilter}
                        onChange={(e) => setCategorieFilter(e.target.value)}
                      >
                        <option value="">Toutes les catégories</option>
                        {categoriesOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {labelCategorie(c)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {loading ? (
                      <div className="text-center text-muted py-5">
                        <p>Chargement en cours...</p>
                      </div>
                    ) : rows.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <p>Aucune association enregistrée.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Catégorie</th>
                              <th>Rubrique</th>
                              <th>Société de la Rubrique</th>
                              <th className="text-end">Actions</th>
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
                                  <td>
                                    <FontAwesomeIcon icon={faBuilding} className="text-secondary me-2" />
                                    {labelSociete(societeById.get(r?.idSociete))}
                                  </td>
                                  <td className="text-end">
                                    <button
                                      className="btn btn-warning btn-sm me-2"
                                      onClick={() => openEdit(rc)}
                                      title="Modifier"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => openDelete(rc)}
                                      title="Supprimer"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
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
          </div>
        </div>
      </div>

      {/* Modal Création / Édition */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow rounded-3">
              <div className={`modal-header ${selected ? "bg-warning" : "bg-primary"} text-white p-3 rounded-top-3`}>
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={selected ? faEdit : faPlus} className="me-2" />
                  {selected ? "Modifier l'association" : "Lier une rubrique à une catégorie"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted">Catégorie</label>
                    <select
                      className="form-control"
                      value={idCategorie}
                      onChange={(e) => setIdCategorie(e.target.value)}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categoriesOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {labelCategorie(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Rubrique de paie</label>
                    <select
                      className="form-control"
                      value={idRubriquePaie}
                      onChange={(e) => setIdRubriquePaie(e.target.value)}
                    >
                      <option value="">Sélectionner une rubrique</option>
                      {rubriquesOptions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {labelRubrique(r)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {user.roles === 2 && (
                  <div className="alert alert-info py-2 mt-3 mb-0">
                    <small>
                      <FontAwesomeIcon icon={faBuilding} className="me-2" />
                      Vous ne pouvez sélectionner que les <b>rubriques</b> de votre société.
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!formValid}>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
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
                  <FontAwesomeIcon icon={faWarning} className="me-2" /> Confirmer la suppression
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="fs-5">
                  Êtes-vous sûr de vouloir supprimer cette association ?
                </p>
                <small className="text-muted">Cette action est irréversible.</small>
              </div>
              <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-center">
                <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>
                  <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  <FontAwesomeIcon icon={faTrash} className="me-2" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RubriqueCategorie;