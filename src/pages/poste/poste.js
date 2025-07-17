// ...imports
import React, { useState, useEffect } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import usePoste from "../../hook/poste/usePoste";
import SocieteServices from "../../services/societe/societeService";
import useTemplateScripts from "../../utils/useTemplateScripts";

function Poste() {
  useTemplateScripts();
  const { postes, createPoste, updatePoste, deletePoste } = usePoste();

  const [societes, setSocietes] = useState([]);
  const [nomPoste, setNomPoste] = useState("");
  const [idSociete, setIdSociete] = useState("");
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState({ roles: 1, societe: "" });
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({ roles: userData.roles, societe: userData.societe });
    }
  }, []);

  useEffect(() => {
    SocieteServices.getAllPaginated(0, 100)
      .then((res) => {
        const data = res.data.content || res.data;
        setSocietes(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreateOrUpdate = () => {
    const payload = { nomPoste, idSociete };

    if (selectedPoste) {
      updatePoste(selectedPoste.id, payload, () => {
        setShowModal(false);
        resetForm();
      });
    } else {
      createPoste(payload, () => {
        setShowModal(false);
        resetForm();
      });
    }
  };

  const resetForm = () => {
    setNomPoste("");
    setIdSociete("");
    setSelectedPoste(null);
  };

  const handleEdit = (poste) => {
    setSelectedPoste(poste);
    setNomPoste(poste.nomPoste);
    setIdSociete(poste.idSociete);
    setShowModal(true);
  };

  const handleDelete = (poste) => {
    setSelectedPoste(poste);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deletePoste(selectedPoste.id, () => {
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
                        <h5>Liste des Postes</h5>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                          <i className="icofont icofont-plus"></i> Créer Poste
                        </button>
                      </div>
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


                      {postes.length === 0 ? (
                        <p className="text-center text-muted">Aucun poste enregistré.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Nom Poste</th>
                                <th>Société</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {postes
                                .filter(p => {
                                  if (user.roles === 1) {
                                    return selectedSocieteFilter ? p.idSociete === selectedSocieteFilter : true;
                                  }
                                  if (user.roles === 2) {
                                    return p.idSociete === user.societe;
                                  }
                                  return true;
                                })
                                .map((p, index) => (
                                  <tr key={p.id}>
                                    <td>{index + 1}</td>
                                    <td>{p.nomPoste}</td>
                                    <td>{societes.find((s) => s.id === p.idSociete)?.nomSociete || "N/A"}</td>
                                    <td>
                                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(p)}>Modifier</button>
                                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Supprimer</button>
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

              {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">{selectedPoste ? "Modifier Poste" : "Créer Poste"}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <label>Nom du Poste</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={nomPoste}
                          onChange={(e) => setNomPoste(e.target.value)}
                          placeholder="Nom du poste"
                        />

                        <label>Société</label>
                        <select
                          className="form-control mb-2"
                          value={idSociete}
                          onChange={(e) => setIdSociete(e.target.value)}
                        >
                          <option value="">Sélectionner une société</option>
                          {societes
                            .filter(s => user.roles === 2 ? s.id === user.societe : true)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nomSociete}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateOrUpdate}
                          disabled={!nomPoste.trim() || !idSociete}
                        >
                          {selectedPoste ? "Enregistrer" : "Créer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Confirmer la suppression</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                      </div>
                      <div className="modal-body text-center">
                        Voulez-vous supprimer le poste : <strong>{selectedPoste?.nomPoste}</strong> ?
                      </div>
                      <div className="modal-footer justify-content-center">
                        <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                        <button className="btn btn-danger" onClick={confirmDelete}>Supprimer</button>
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

export default Poste;
