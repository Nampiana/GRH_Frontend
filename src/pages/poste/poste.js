import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Table, Form, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faExclamationCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import usePoste from "../../hook/poste/usePoste";
import SocieteServices from "../../services/societe/societeService";
import useTemplateScripts from "../../utils/useTemplateScripts";
import LoadingSpinner from "../../components/LoadingSpinner";
import './poste.css'; // Assurez-vous d'avoir ce fichier CSS

// Composant pour le modal de création/modification de poste
function PosteFormModal({ show, onHide, poste, societes, onSubmit }) {
  const [nomPoste, setNomPoste] = useState("");
  const [idSociete, setIdSociete] = useState("");

  useEffect(() => {
    if (poste) {
      setNomPoste(poste.nomPoste);
      setIdSociete(poste.idSociete);
    } else {
      setNomPoste("");
      setIdSociete("");
    }
  }, [poste]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nomPoste, idSociete });
  };

  const isFormValid = nomPoste.trim() !== "" && idSociete.trim() !== "";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{poste ? "Modifier un poste" : "Créer un poste"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du poste</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nom du poste"
              value={nomPoste}
              onChange={(e) => setNomPoste(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Société</Form.Label>
            <Form.Control
              as="select"
              value={idSociete}
              onChange={(e) => setIdSociete(e.target.value)}
            >
              <option value="">Sélectionner une société</option>
              {societes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomSociete}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={!isFormValid}>
              {poste ? "Enregistrer les modifications" : "Créer"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Composant pour le modal de confirmation de suppression
function DeleteConfirmationModal({ show, onHide, posteName, onConfirm }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><FontAwesomeIcon icon={faExclamationCircle} className="me-2" />Confirmer la suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="fs-5">Voulez-vous vraiment supprimer le poste : <br /><strong>{posteName}</strong> ?</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={onHide} className="me-2">Annuler</Button>
        <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
      </Modal.Footer>
    </Modal>
  );
}

function Poste() {
  useTemplateScripts();
  const { postes, createPoste, updatePoste, deletePoste, isLoading } = usePoste();

  const [societes, setSocietes] = useState([]);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState({ roles: 1, societe: "" });
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const societesRes = await SocieteServices.getAllPaginated(0, 100);
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
    if (selectedPoste) {
      updatePoste(selectedPoste.id, payload, () => {
        setShowFormModal(false);
        setSelectedPoste(null);
      });
    } else {
      createPoste(payload, () => {
        setShowFormModal(false);
      });
    }
  };

  const handleDelete = () => {
    deletePoste(selectedPoste.id, () => {
      setShowDeleteModal(false);
      setSelectedPoste(null);
    });
  };

  const handleEditClick = (poste) => {
    setSelectedPoste(poste);
    setShowFormModal(true);
  };

  const handleDeleteClick = (poste) => {
    setSelectedPoste(poste);
    setShowDeleteModal(true);
  };

  const filteredPostes = postes.filter(p => {
    const isUserSociete = user.roles === 2 && p.idSociete === user.societe;
    const isSuperAdminFiltered = user.roles === 1 && (!selectedSocieteFilter || p.idSociete === selectedSocieteFilter);
    return isUserSociete || isSuperAdminFiltered;
  });

  const getSocieteName = (id) => societes.find(s => s.id === id)?.nomSociete || "N/A";

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
                          <h4 className="fw-bold text-primary">Gestion des Postes</h4>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedPoste(null);
                              setShowFormModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Créer un Poste
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
                                {societes.map(s => (
                                  <option key={s.id} value={s.id}>{s.nomSociete}</option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                          </div>
                        )}

                        {isLoading ? (
                          <LoadingSpinner />
                        ) : filteredPostes.length === 0 ? (
                          <div className="text-center p-5">
                            <p className="lead text-muted">Aucun poste n'a été enregistré.</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <Table hover className="table-striped table-borderless">
                              <thead className="bg-light">
                                <tr>
                                  <th>#</th>
                                  <th>Nom du Poste</th>
                                  <th>Société</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredPostes.map((p, index) => (
                                  <tr key={p.id} className="align-middle">
                                    <td>{index + 1}</td>
                                    <td className="fw-semibold">{p.nomPoste}</td>
                                    <td>{getSocieteName(p.idSociete)}</td>
                                    <td>
                                      <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEditClick(p)}>
                                        <FontAwesomeIcon icon={faEdit} className="me-1" />Modifier
                                      </Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(p)}>
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
      
      <PosteFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        poste={selectedPoste}
        societes={societes.filter(s => user.roles === 2 ? s.id === user.societe : true)}
        onSubmit={handleCreateOrUpdate}
      />
      
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        posteName={selectedPoste?.nomPoste}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Poste;