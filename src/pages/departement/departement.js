import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faExclamationCircle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useDepartement from "../../hook/departement/departementHook";
import SocieteServices from "../../services/societe/societeService";
import useTemplateScripts from "../../utils/useTemplateScripts";
import LoadingSpinner from "../../components/LoadingSpinner";
import './departement.css'; // Importez un fichier CSS pour les styles personnalisés

// Composant pour le modal de création/modification
function DepartementFormModal({ show, onHide, departement, societes, onSubmit }) {
  const [formData, setFormData] = useState({
    nomDepartement: departement?.nomDepartement || "",
    idSociete: departement?.idSociete || "",
  });

  useEffect(() => {
    if (departement) {
      setFormData({
        nomDepartement: departement.nomDepartement,
        idSociete: departement.idSociete || "",
      });
    } else {
      setFormData({ nomDepartement: "", idSociete: "" });
    }
  }, [departement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    onSubmit(formData);
  };

  const isFormValid = formData.nomDepartement.trim() !== "" && formData.idSociete.trim() !== "";

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="modal-90w">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="fw-bold">
          {departement ? "Modifier un département" : "Créer un département"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du département</Form.Label>
            <Form.Control
              type="text"
              name="nomDepartement"
              placeholder="Ex: Marketing, Ventes, RH..."
              value={formData.nomDepartement}
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
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={!isFormValid}>
              {departement ? "Enregistrer les modifications" : "Créer"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Composant pour le modal de suppression
function DeleteConfirmationModal({ show, onHide, departementName, onConfirm }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title className="fw-bold">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" /> Confirmer la suppression
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="fs-5 text-dark fw-light">
          Voulez-vous vraiment supprimer le département :
          <br />
          <strong className="text-danger">{departementName}</strong> ?
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={onHide} className="me-2">
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Supprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Composant principal
function Departement() {
  useTemplateScripts();
  const {
    departements,
    fetchDepartements,
    createDepartement,
    updateDepartement,
    deleteDepartement,
    isLoading,
  } = useDepartement();

  const [societes, setSocietes] = useState([]);
  const [user, setUser] = useState({ roles: null, societe: null });
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({ roles: userData.roles, societe: userData.societe });
    }
  }, []);

  useEffect(() => {
    fetchDepartements();
    SocieteServices.getAll()
      .then((res) => setSocietes(res.data.content))
      .catch((err) =>
        console.error("Erreur lors de la récupération des sociétés:", err)
      );
  }, [fetchDepartements]);

  const handleCreateOrUpdate = (payload) => {
    if (selectedDepartement) {
      updateDepartement(selectedDepartement.id, payload, () => {
        setShowFormModal(false);
        setSelectedDepartement(null);
      });
    } else {
      createDepartement(payload, () => {
        setShowFormModal(false);
      });
    }
  };

  const handleDelete = () => {
    deleteDepartement(selectedDepartement.id, () => {
      setShowDeleteModal(false);
      setSelectedDepartement(null);
    });
  };

  const handleEditClick = (departement) => {
    setSelectedDepartement(departement);
    setShowFormModal(true);
  };

  const handleDeleteClick = (departement) => {
    setSelectedDepartement(departement);
    setShowDeleteModal(true);
  };

  const filteredDepartements = departements.filter((d) => {
    const isUserSociete = user.roles === 2 && d.idSociete === user.societe;
    const isSuperAdminFiltered =
      user.roles === 1 && (!selectedSocieteFilter || d.idSociete === selectedSocieteFilter);
    return isUserSociete || isSuperAdminFiltered;
  });

  const getSocieteName = (idSociete) => {
    return societes.find((s) => s.id === idSociete)?.nomSociete || "N/A";
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
                          <h4 className="fw-bold text-primary">Gestion des Départements</h4>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedDepartement(null);
                              setShowFormModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Créer un Département
                          </Button>
                        </div>

                        {user.roles === 1 && (
                          <div className="mb-4">
                            <Form.Group>
                              <Form.Label className="fw-semibold">
                                <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                                Filtrer par Société
                              </Form.Label>
                              <Form.Control
                                as="select"
                                value={selectedSocieteFilter}
                                onChange={(e) => setSelectedSocieteFilter(e.target.value)}
                              >
                                <option value="">Toutes les sociétés</option>
                                {societes.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.nomSociete}
                                  </option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                          </div>
                        )}

                        {isLoading ? (
                          <LoadingSpinner />
                        ) : filteredDepartements.length === 0 ? (
                          <div className="text-center p-5">
                            <p className="lead text-muted">Aucun département n'a été enregistré pour le moment.</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <Table hover className="table-striped table-borderless">
                              <thead className="bg-light">
                                <tr>
                                  <th>#</th>
                                  <th>Nom du Département</th>
                                  <th>Société</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredDepartements.map((d, index) => (
                                  <tr key={d.id} className="align-middle">
                                    <td>{index + 1}</td>
                                    <td className="fw-semibold">{d.nomDepartement}</td>
                                    <td>{getSocieteName(d.idSociete)}</td>
                                    <td>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditClick(d)}
                                      >
                                        <FontAwesomeIcon icon={faEdit} className="me-1" />
                                        Modifier
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteClick(d)}
                                      >
                                        <FontAwesomeIcon icon={faTrash} className="me-1" />
                                        Supprimer
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
      <DepartementFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        departement={selectedDepartement}
        societes={societes.filter((s) => (user.roles === 2 ? s.id === user.societe : true))}
        onSubmit={handleCreateOrUpdate}
      />
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        departementName={selectedDepartement?.nomDepartement}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Departement;