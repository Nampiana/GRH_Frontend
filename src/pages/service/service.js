import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Table, Form, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faExclamationCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useService from "../../hook/service/useService";
import DepartementServices from "../../services/departement/departement";
import SocieteServices from "../../services/societe/societeService";
import useTemplateScripts from "../../utils/useTemplateScripts";
import LoadingSpinner from "../../components/LoadingSpinner";
import './service.css'; // Créez ce fichier CSS pour les styles personnalisés

// Composant pour le modal de création/modification
function ServiceFormModal({ show, onHide, service, departements, societes, onSubmit }) {
  const [formData, setFormData] = useState({
    nomService: service?.nomService || "",
    idDepartement: service?.idDepartement || "",
    idSociete: service?.idSociete || "",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        nomService: service.nomService,
        idDepartement: service.idDepartement || "",
        idSociete: service.idSociete || "",
      });
    } else {
      setFormData({ nomService: "", idDepartement: "", idSociete: "" });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.nomService.trim() !== "" && formData.idDepartement.trim() !== "";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{service ? "Modifier un service" : "Créer un service"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du service</Form.Label>
            <Form.Control
              type="text"
              name="nomService"
              placeholder="Nom du service"
              value={formData.nomService}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Société</Form.Label>
            <Form.Control
              as="select"
              name="idSociete"
              value={formData.idSociete}
              onChange={handleChange}
            >
              <option value="">Sélectionner une société</option>
              {societes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomSociete}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Département</Form.Label>
            <Form.Control
              as="select"
              name="idDepartement"
              value={formData.idDepartement}
              onChange={handleChange}
            >
              <option value="">Sélectionner un département</option>
              {departements.filter(d => formData.idSociete ? d.idSociete === formData.idSociete : true)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nomDepartement}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={!isFormValid}>
              {service ? "Enregistrer les modifications" : "Créer"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Composant pour le modal de suppression
function DeleteConfirmationModal({ show, onHide, serviceName, onConfirm }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><FontAwesomeIcon icon={faExclamationCircle} className="me-2" />Confirmer la suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="fs-5">Voulez-vous vraiment supprimer le service : <br /><strong>{serviceName}</strong> ?</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={onHide} className="me-2">Annuler</Button>
        <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
      </Modal.Footer>
    </Modal>
  );
}

function Service() {
  useTemplateScripts();
  const { services, createService, updateService, deleteService, isLoading } = useService();

  const [departements, setDepartements] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [user, setUser] = useState({ roles: 1, societe: "" });
  const [selectedService, setSelectedService] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");
  const [selectedDepartementFilter, setSelectedDepartementFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const departementsRes = await DepartementServices.getAll();
      setDepartements(departementsRes.data.content || departementsRes.data);

      const societesRes = await SocieteServices.getAll();
      setSocietes(societesRes.data.content || societesRes.data);
    } catch (err) {
      console.error("Erreur de récupération des données:", err);
    }
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({ roles: userData.roles, societe: userData.societe });
    }
    fetchData();
  }, [fetchData]);

  const handleCreateOrUpdate = (payload) => {
    if (selectedService) {
      updateService(selectedService.id, payload, () => {
        setShowFormModal(false);
        setSelectedService(null);
      });
    } else {
      createService(payload, () => {
        setShowFormModal(false);
      });
    }
  };

  const handleDelete = () => {
    deleteService(selectedService.id, () => {
      setShowDeleteModal(false);
      setSelectedService(null);
    });
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setShowFormModal(true);
  };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const filteredServices = services.filter(s => {
    const isUserSociete = user.roles === 2 && s.idSociete === user.societe;
    const isSuperAdminFiltered = user.roles === 1 && (!selectedSocieteFilter || s.idSociete === selectedSocieteFilter);
    const isDepartementFiltered = !selectedDepartementFilter || s.idDepartement === selectedDepartementFilter;

    return (isUserSociete || isSuperAdminFiltered) && isDepartementFiltered;
  });

  const getDepartementName = (id) => departements.find(d => d.id === id)?.nomDepartement || "N/A";
  const getSocieteName = (id) => societes.find(s => s.id === id)?.nomSociete || "N/A";

  const handleSocieteFilterChange = (e) => {
    setSelectedSocieteFilter(e.target.value);
    setSelectedDepartementFilter(""); // Réinitialiser le filtre de département quand la société change
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
                      <Card className="p-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4 className="fw-bold text-primary">Gestion des Services</h4>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedService(null);
                              setShowFormModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Créer un Service
                          </Button>
                        </div>
                        
                        <div className="d-flex flex-wrap gap-3 mb-4">
                          {user.roles === 1 && (
                            <Form.Group className="flex-grow-1">
                              <Form.Label className="fw-semibold">
                                <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                                Filtrer par Société
                              </Form.Label>
                              <Form.Control
                                as="select"
                                value={selectedSocieteFilter}
                                onChange={handleSocieteFilterChange}
                              >
                                <option value="">Toutes les sociétés</option>
                                {societes.map(s => (
                                  <option key={s.id} value={s.id}>{s.nomSociete}</option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                          )}
                          <Form.Group className="flex-grow-1">
                            <Form.Label className="fw-semibold">
                              <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                              Filtrer par Département
                            </Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedDepartementFilter}
                              onChange={(e) => setSelectedDepartementFilter(e.target.value)}
                            >
                              <option value="">Tous les départements</option>
                              {departements
                                .filter(d => (user.roles === 2 ? d.idSociete === user.societe : true) && (!selectedSocieteFilter || d.idSociete === selectedSocieteFilter))
                                .map(d => (
                                  <option key={d.id} value={d.id}>{d.nomDepartement}</option>
                                ))}
                            </Form.Control>
                          </Form.Group>
                        </div>

                        {isLoading ? (
                          <LoadingSpinner />
                        ) : filteredServices.length === 0 ? (
                          <div className="text-center p-5">
                            <p className="lead text-muted">Aucun service n'a été enregistré.</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <Table hover className="table-striped table-borderless">
                              <thead className="bg-light">
                                <tr>
                                  <th>#</th>
                                  <th>Nom du Service</th>
                                  <th>Département</th>
                                  <th>Société</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredServices.map((s, index) => (
                                  <tr key={s.id} className="align-middle">
                                    <td>{index + 1}</td>
                                    <td className="fw-semibold">{s.nomService}</td>
                                    <td>{getDepartementName(s.idDepartement)}</td>
                                    <td>{getSocieteName(s.idSociete)}</td>
                                    <td>
                                      <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEditClick(s)}>
                                        <FontAwesomeIcon icon={faEdit} className="me-1" />Modifier
                                      </Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(s)}>
                                        <FontAwesomeIcon icon={faTrash} className="me-1" />Supprimer
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </div>
                <div id="styleSelector"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ServiceFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        service={selectedService}
        departements={departements.filter(d => user.roles === 2 ? d.idSociete === user.societe : true)}
        societes={societes.filter(s => user.roles === 2 ? s.id === user.societe : true)}
        onSubmit={handleCreateOrUpdate}
      />
      
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        serviceName={selectedService?.nomService}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Service;