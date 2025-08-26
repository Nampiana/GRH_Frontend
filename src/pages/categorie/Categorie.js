import React, { useState, useEffect } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useCategorie from "../../hook/categorie/useCategorie";
import SocieteServices from "../../services/societe/societeService"; // même service que dans Departement
import useTemplateScripts from "../../utils/useTemplateScripts";

function Categorie() {
  useTemplateScripts();
  const { categories, createCategorie, updateCategorie, deleteCategorie } = useCategorie();

  // Récup user (même structure que ta page Département)
  const [user, setUser] = useState({ roles: 1, societe: "" });

  const [societes, setSocietes] = useState([]);
  const [nomCategorie, setNomCategorie] = useState("");
  const [idSociete, setIdSociete] = useState(""); // sélection dans la modale
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // (optionnel) filtre en haut de tableau pour role 1
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({ roles: userData.roles, societe: userData.societe });
      // Pré-remplir idSociete pour rôle 2
      if (userData.roles === 2) setIdSociete(userData.societe);
    }
  }, []);

  useEffect(() => {
    SocieteServices.getAll()
      .then((res) => {
        // adapte selon ta réponse backend (ici tu avais .content côté département)
        const list = res.data.content ?? res.data;
        setSocietes(list);
      })
      .catch(console.error);
  }, []);

  const resetForm = () => {
    setNomCategorie("");
    setSelectedCategorie(null);
    setIdSociete(user.roles === 2 ? user.societe : ""); // pour rôle 2, laisse sa société par défaut
  };

  const handleCreateOrUpdate = () => {
    // Force la société du RH côté front
    const payload = {
      nomCategorie,
      idSociete: user.roles === 1 ? idSociete : user.societe,
    };

    if (selectedCategorie) {
      updateCategorie(selectedCategorie.id, payload, () => {
        setShowModal(false);
        resetForm();
      });
    } else {
      createCategorie(payload, () => {
        setShowModal(false);
        resetForm();
      });
    }
  };

  const handleEdit = (categorie) => {
    setSelectedCategorie(categorie);
    setNomCategorie(categorie.nomCategorie);
    // Si rôle 1 : on laisse éditer idSociete ; si rôle 2 : on fixe à sa société
    setIdSociete(user.roles === 1 ? (categorie.idSociete || "") : user.societe);
    setShowModal(true);
  };

  const handleDelete = (categorie) => {
    setSelectedCategorie(categorie);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteCategorie(selectedCategorie.id, () => {
      setShowDeleteModal(false);
      resetForm();
    });
  };

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content">
              <div className="main-body">
                <div className="page-wrapper">
                  <div className="page-body">
                    <div className="card p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Liste des Catégories</h5>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            resetForm();
                            setShowModal(true);
                          }}
                        >
                          <i className="icofont icofont-plus"></i> Créer Catégorie
                        </button>
                      </div>

                      {/* Filtre par société (uniquement rôle 1) */}
                      {user.roles === 1 && (
                        <div className="mb-3">
                          <label>Filtrer par Société :</label>
                          <select
                            className="form-control"
                            value={selectedSocieteFilter}
                            onChange={(e) => setSelectedSocieteFilter(e.target.value)}
                          >
                            <option value="">Toutes les sociétés</option>
                            {societes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nomSociete}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {categories.length === 0 ? (
                        <p className="text-center text-muted">Aucune catégorie enregistrée.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Nom Catégorie</th>
                                <th>Société</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories
                                .filter((c) => {
                                  // rôle 2 : ne voir que sa société
                                  if (user.roles === 2 && c.idSociete !== user.societe) return false;
                                  // rôle 1 : appliquer filtre si choisi
                                  if (user.roles === 1 && selectedSocieteFilter && c.idSociete !== selectedSocieteFilter) return false;
                                  return true;
                                })
                                .map((c, index) => (
                                  <tr key={c.id}>
                                    <td>{index + 1}</td>
                                    <td>{c.nomCategorie}</td>
                                    <td>{societes.find((s) => s.id === c.idSociete)?.nomSociete || "N/A"}</td>
                                    <td>
                                      <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEdit(c)}
                                      >
                                        Modifier
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(c)}
                                      >
                                        Supprimer
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

              {/* Modal création/modification */}
              {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">{selectedCategorie ? "Modifier Catégorie" : "Créer Catégorie"}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        {/* Select société : visible seulement pour rôle 1 */}
                        {user.roles === 1 && (
                          <>
                            <label>Société</label>
                            <select
                              className="form-control mb-3"
                              value={idSociete}
                              onChange={(e) => setIdSociete(e.target.value)}
                              required
                            >
                              <option value="">Sélectionner une société</option>
                              {societes.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.nomSociete}
                                </option>
                              ))}
                            </select>
                          </>
                        )}

                        <label>Nom Catégorie</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nom catégorie"
                          value={nomCategorie}
                          onChange={(e) => setNomCategorie(e.target.value)}
                          required
                        />
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                          Annuler
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateOrUpdate}
                          disabled={
                            !nomCategorie.trim() ||
                            (user.roles === 1 && !idSociete) // rôle 1 doit choisir une société
                          }
                        >
                          {selectedCategorie ? "Enregistrer" : "Créer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal suppression */}
              {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Confirmer la suppression</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                      </div>
                      <div className="modal-body text-center">
                        Voulez-vous supprimer la catégorie :
                        <br />
                        <strong>{selectedCategorie?.nomCategorie}</strong> ?
                      </div>
                      <div className="modal-footer justify-content-center">
                        <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                          Annuler
                        </button>
                        <button className="btn btn-danger" onClick={confirmDelete}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div id="styleSelector"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categorie;
