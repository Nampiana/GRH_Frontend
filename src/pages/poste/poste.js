import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import usePoste from "../../hook/poste/usePoste";
import ServiceServices from "../../services/services/service";
import useTemplateScripts from "../../utils/useTemplateScripts";

function Poste() {
  useTemplateScripts();
  const { postes, createPoste, updatePoste, deletePoste } = usePoste();
  const [services, setServices] = useState([]);

  const [nomPoste, setNomPoste] = useState("");
  const [idService, setIdService] = useState("");
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    ServiceServices.getAll()
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCreateOrUpdate = () => {
    const payload = {
      nomPoste,
      idService,
    };

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
    setIdService("");
    setSelectedPoste(null);
  };

  const handleEdit = (poste) => {
    setSelectedPoste(poste);
    setNomPoste(poste.nomPoste);
    setIdService(poste.idService);
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

                      {postes.length === 0 ? (
                        <p className="text-center text-muted">Aucun poste enregistré.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Nom Poste</th>
                                <th>Service</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {postes.map((p, index) => (
                                <tr key={p.id}>
                                  <td>{index + 1}</td>
                                  <td>{p.nomPoste}</td>
                                  <td>{services.find((s) => s.id === p.idService)?.nomService || "N/A"}</td>
                                  <td>
                                    <button
                                      className="btn btn-warning btn-sm me-2"
                                      onClick={() => handleEdit(p)}
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDelete(p)}
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

              {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                          {selectedPoste ? "Modifier Poste" : "Créer Poste"}
                        </h5>
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
                        <label>Service</label>
                        <select
                          className="form-control"
                          value={idService}
                          onChange={(e) => setIdService(e.target.value)}
                        >
                          <option value="">Sélectionner un service</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nomService}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                          Annuler
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateOrUpdate}
                          disabled={!nomPoste || !idService}
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
                        Voulez-vous supprimer le poste <strong>{selectedPoste?.nomPoste}</strong> ?
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Poste;
