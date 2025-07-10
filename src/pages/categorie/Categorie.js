import React, { useState, useEffect } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useCategorie from "../../hook/categorie/useCategorie";
import useTemplateScripts from "../../utils/useTemplateScripts";

function Categorie() {
  useTemplateScripts();
  const {
    categories,
    createCategorie,
    updateCategorie,
    deleteCategorie,
  } = useCategorie();

  const [nomCategorie, setNomCategorie] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCreateOrUpdate = () => {
    const payload = { nomCategorie };

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

  const resetForm = () => {
    setNomCategorie("");
    setSelectedCategorie(null);
  };

  const handleEdit = (categorie) => {
    setSelectedCategorie(categorie);
    setNomCategorie(categorie.nomCategorie);
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
                        <h5>Liste des Catégories Service</h5>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowModal(true)}
                        >
                          <i className="icofont icofont-plus"></i> Créer Catégorie
                        </button>
                      </div>

                      {categories.length === 0 ? (
                        <p className="text-center text-muted">Aucune catégorie enregistrée.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Nom Catégorie</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories.map((c, index) => (
                                <tr key={c.id}>
                                  <td>{index + 1}</td>
                                  <td>{c.nomCategorie}</td>
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
                <div
                  className="modal fade show d-block"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                          {selectedCategorie ? "Modifier Catégorie" : "Créer Catégorie"}
                        </h5>
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <label>Nom Catégorie</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nom catégorie"
                          value={nomCategorie}
                          onChange={(e) => setNomCategorie(e.target.value)}
                        />
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Annuler
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateOrUpdate}
                          disabled={!nomCategorie.trim()}
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
                <div
                  className="modal fade show d-block"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Confirmer la suppression</h5>
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          onClick={() => setShowDeleteModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body text-center">
                        Voulez-vous supprimer la catégorie :
                        <br />
                        <strong>{selectedCategorie?.nomCategorie}</strong> ?
                      </div>
                      <div className="modal-footer justify-content-center">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowDeleteModal(false)}
                        >
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categorie;
