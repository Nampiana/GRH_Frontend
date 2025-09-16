import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Table, Form, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faExclamationCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useCategorie from "../../hook/categorie/useCategorie";
import SocieteServices from "../../services/societe/societeService";
import useTemplateScripts from "../../utils/useTemplateScripts";
import LoadingSpinner from "../../components/LoadingSpinner";
import './categorie.css'; // Créez ce fichier CSS

// Composant pour le modal de création/modification de catégorie
function CategorieFormModal({ show, onHide, categorie, societes, onSubmit, user }) {
  const [nomCategorie, setNomCategorie] = useState("");
  const [idSociete, setIdSociete] = useState("");

  useEffect(() => {
    if (categorie) {
      setNomCategorie(categorie.nomCategorie);
      // Si admin, permet de changer la société, sinon, garde celle de l'utilisateur
      setIdSociete(user.roles === 1 ? (categorie.idSociete || "") : user.societe);
    } else {
      setNomCategorie("");
      setIdSociete(user.roles === 2 ? user.societe : "");
    }
  }, [categorie, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nomCategorie,
      idSociete: user.roles === 1 ? idSociete : user.societe,
    };
    onSubmit(payload);
  };

  const isFormValid = nomCategorie.trim() !== "" && (user.roles === 2 || (user.roles === 1 && idSociete !== ""));

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{categorie ? "Modifier une catégorie" : "Créer une catégorie"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {user.roles === 1 && (
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
          )}
          <Form.Group className="mb-3">
            <Form.Label>Nom de la catégorie</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nom de la catégorie"
              value={nomCategorie}
              onChange={(e) => setNomCategorie(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={!isFormValid}>
              {categorie ? "Enregistrer les modifications" : "Créer"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Composant pour le modal de confirmation de suppression
function DeleteConfirmationModal({ show, onHide, categorieName, onConfirm }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><FontAwesomeIcon icon={faExclamationCircle} className="me-2" />Confirmer la suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="fs-5">Voulez-vous vraiment supprimer la catégorie : <br /><strong>{categorieName}</strong> ?</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={onHide} className="me-2">Annuler</Button>
        <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
      </Modal.Footer>
    </Modal>
  );
}

function Categorie() {
  useTemplateScripts();
  const { categories, createCategorie, updateCategorie, deleteCategorie, isLoading } = useCategorie();

  const [user, setUser] = useState({ roles: 1, societe: "" });
  const [societes, setSocietes] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
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
    if (selectedCategorie) {
      updateCategorie(selectedCategorie.id, payload, () => {
        setShowFormModal(false);
        setSelectedCategorie(null);
      });
    } else {
      createCategorie(payload, () => {
        setShowFormModal(false);
      });
    }
  };

  const handleDelete = () => {
    deleteCategorie(selectedCategorie.id, () => {
      setShowDeleteModal(false);
      setSelectedCategorie(null);
    });
  };

  const handleEditClick = (categorie) => {
    setSelectedCategorie(categorie);
    setShowFormModal(true);
  };

  const handleDeleteClick = (categorie) => {
    setSelectedCategorie(categorie);
    setShowDeleteModal(true);
  };

  const filteredCategories = categories.filter(c => {
    const isUserSociete = user.roles === 2 && c.idSociete === user.societe;
    const isSuperAdminFiltered = user.roles === 1 && (!selectedSocieteFilter || c.idSociete === selectedSocieteFilter);
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
                          <h4 className="fw-bold text-primary">Gestion des Catégories</h4>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedCategorie(null);
                              setShowFormModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Créer une Catégorie
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
                        ) : filteredCategories.length === 0 ? (
                          <div className="text-center p-5">
                            <p className="lead text-muted">Aucune catégorie n'a été enregistrée.</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <Table hover className="table-striped table-borderless">
                              <thead className="bg-light">
                                <tr>
                                  <th>#</th>
                                  <th>Nom de la Catégorie</th>
                                  <th>Société</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredCategories.map((c, index) => (
                                  <tr key={c.id} className="align-middle">
                                    <td>{index + 1}</td>
                                    <td className="fw-semibold">{c.nomCategorie}</td>
                                    <td>{getSocieteName(c.idSociete)}</td>
                                    <td>
                                      <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEditClick(c)}>
                                        <FontAwesomeIcon icon={faEdit} className="me-1" />Modifier
                                      </Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(c)}>
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

      <CategorieFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        categorie={selectedCategorie}
        societes={societes.filter(s => user.roles === 2 ? s.id === user.societe : true)}
        onSubmit={handleCreateOrUpdate}
        user={user}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        categorieName={selectedCategorie?.nomCategorie}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Categorie;