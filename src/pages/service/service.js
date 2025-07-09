import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useService from "../../hook/service/useService";
import DepartementServices from "../../services/departement/departement";
import useTemplateScripts from "../../utils/useTemplateScripts";

function Service() {
  useTemplateScripts();
  const { services, createService, updateService, deleteService } = useService();
  const [departements, setDepartements] = useState([]);

  const [nomService, setNomService] = useState("");
  const [idDepartement, setIdDepartement] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    DepartementServices.getAll()
      .then((res) => setDepartements(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCreateOrUpdate = () => {
    const payload = {
      nomService,
      idDepartement,
    };

    if (selectedService) {
      updateService(selectedService.id, payload, () => {
        setShowModal(false);
        resetForm();
      });
    } else {
      createService(payload, () => {
        setShowModal(false);
        resetForm();
      });
    }
  };

  const resetForm = () => {
    setNomService("");
    setIdDepartement("");
    setSelectedService(null);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setNomService(service.nomService);
    setIdDepartement(service.idDepartement);
    setShowModal(true);
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteService(selectedService.id, () => {
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
                        <h5>Liste des Services</h5>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                          <i className="icofont icofont-plus"></i> Créer Service
                        </button>
                      </div>

                      {services.length === 0 ? (
                        <p className="text-center text-muted">Aucun service enregistré.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Nom Service</th>
                                <th>Département</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {services.map((s, index) => (
                                <tr key={s.id}>
                                  <td>{index + 1}</td>
                                  <td>{s.nomService}</td>
                                  <td>{departements.find((d) => d.id === s.idDepartement)?.nomDepartement || "N/A"}</td>
                                  <td>
                                    <button
                                      className="btn btn-warning btn-sm me-2"
                                      onClick={() => handleEdit(s)}
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDelete(s)}
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
                          {selectedService ? "Modifier Service" : "Créer Service"}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <label>Nom du Service</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={nomService}
                          onChange={(e) => setNomService(e.target.value)}
                          placeholder="Nom du service"
                        />
                        <label>Département</label>
                        <select
                          className="form-control"
                          value={idDepartement}
                          onChange={(e) => setIdDepartement(e.target.value)}
                        >
                          <option value="">Sélectionner un département</option>
                          {departements.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nomDepartement}
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
                          disabled={!nomService || !idDepartement}
                        >
                          {selectedService ? "Enregistrer" : "Créer"}
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
                        Voulez-vous supprimer le service <strong>{selectedService?.nomService}</strong> ?
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

export default Service;
