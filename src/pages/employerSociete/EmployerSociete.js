import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useEmployerSociete from "../../hook/employerSociete/useEmployerSociete";
import SocieteServices from "../../services/societe/societeService";
import ServiceServices from "../../services/services/service";
import IndividuServices from "../../services/individu/individuService";
import PosteServices from "../../services/poste/posteService";
import CategorieServices from "../../services/categorie/categorie";
import useTemplateScripts from "../../utils/useTemplateScripts";

function EmployerSociete() {
  useTemplateScripts();

  const { employers, createEmployer, updateEmployer, deleteEmployer } = useEmployerSociete();
  const [Individu, setIndividu] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [services, setServices] = useState([]);
  const [postes, setPostes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    email: "",
    password: "",
    telephone: "",
    idSociete: "",
    idService: "",
    idPoste: "",
    idCategorie: "",
    role: 3
  });

  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    IndividuServices.getAll().then(res => setIndividu(res.data.content || res.data));
    SocieteServices.getAll().then(res => setSocietes(res.data.content || res.data));
    ServiceServices.getAll().then(res => setServices(res.data.content || res.data));
    PosteServices.getAll().then(res => setPostes(res.data.content || res.data));
    CategorieServices.getAll().then(res => setCategories(res.data.content || res.data));
  }, []);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = () => {
    const payload = {
      employerSociete: {
        idSociete: formData.idSociete,
        idService: formData.idService,
        idPoste: formData.idPoste,
        idCategorie: formData.idCategorie
      },
      nom: formData.nom,
      prenom: formData.prenom,
      adresse: formData.adresse,
      email: formData.email,
      password: formData.password,
      telephone: formData.telephone,
      idSociete: formData.idSociete,
      role: parseInt(formData.role, 10)
    };

    if (selectedEmployer) {
      updateEmployer(selectedEmployer.id, payload, () => {
        setShowModal(false);
        resetForm();
      });
    } else {
      createEmployer(payload, () => {
        setShowModal(false);
        resetForm();
      });
    }
  };

  const handleEdit = employer => {
    setSelectedEmployer(employer);
    setFormData({
      nom: employer.nomIndividu,
      prenom: employer.prenomIndividu,
      adresse: employer.adresseIndividu,
      email: employer.emailIndividu,
      password: "",
      telephone: employer.telephoneIndividu,
      idSociete: employer.idSociete,
      idService: employer.idService,
      idPoste: employer.idPoste,
      idCategorie: employer.idCategorie,
      role: employer.role
    });
    setShowModal(true);
  };

  const handleDelete = employer => {
    setSelectedEmployer(employer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteEmployer(selectedEmployer.id, () => {
      setShowDeleteModal(false);
      resetForm();
    });
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      adresse: "",
      email: "",
      password: "",
      telephone: "",
      idSociete: "",
      idService: "",
      idPoste: "",
      idCategorie: "",
      role: 3
    });
    setSelectedEmployer(null);
  };

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content">
              <div className="page-wrapper">
                <div className="page-body">
                  <div className="card p-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Liste des Employés Société</h5>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowModal(true)}
                      >
                        <i className="icofont icofont-plus"></i> Créer
                      </button>
                    </div>

                    {employers.length === 0 ? (
                      <p className="text-center text-muted">Aucun employé enregistré.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Nom</th>
                              <th>Prénom</th>
                              <th>Société</th>
                              <th>Service</th>
                              <th>Poste</th>
                              <th>Catégorie</th>
                              <th>Téléphone</th>
                              <th>Email</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employers.map((e, index) => (
                              <tr key={e.id}>
                                <td>{index + 1}</td>
                                <td>{Individu.find(i => i.id === e.idIndividue)?.nom || "N/A"}</td>
                                <td>{Individu.find(i => i.id === e.idIndividue)?.prenom || "N/A"}</td>
                                <td>{societes.find(s => s.id === e.idSociete)?.nomSociete || "N/A"}</td>
                                <td>{services.find(s => s.id === e.idService)?.nomService || "N/A"}</td>
                                <td>{postes.find(p => p.id === e.idPoste)?.nomPoste || "N/A"}</td>
                                <td>{categories.find(c => c.id === e.idCategorie)?.nomCategorie || "N/A"}</td>
                                <td>{Individu.find(i => i.id === e.idIndividue)?.telephone || "N/A"}</td>
                                <td>{Individu.find(i => i.id === e.idIndividue)?.email || "N/A"}</td>
                                <td>
                                  <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => handleEdit(e)}
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(e)}
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

              {/** Modal de création/modification */}
              {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                      <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                          {selectedEmployer ? "Modifier Employé" : "Créer Employé"}
                        </h5>
                        <button
                          className="btn-close btn-close-white"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        {/* Formulaire complet */}
                        {["nom", "prenom", "adresse", "email", "password", "telephone"].map(field => (
                          <div key={field}>
                            <label className="mt-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input
                              type={field === "password" ? "password" : "text"}
                              className="form-control"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                            />
                          </div>
                        ))}

                        <label className="mt-2">Société</label>
                        <select className="form-control" name="idSociete" value={formData.idSociete} onChange={handleInputChange}>
                          <option value="">Sélectionner une société</option>
                          {societes.map(s => (
                            <option key={s.id} value={s.id}>{s.nomSociete}</option>
                          ))}
                        </select>

                        <label className="mt-2">Service</label>
                        <select className="form-control" name="idService" value={formData.idService} onChange={handleInputChange}>
                          <option value="">Sélectionner un service</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.nomService}</option>
                          ))}
                        </select>

                        <label className="mt-2">Poste</label>
                        <select className="form-control" name="idPoste" value={formData.idPoste} onChange={handleInputChange}>
                          <option value="">Sélectionner un poste</option>
                          {postes.map(p => (
                            <option key={p.id} value={p.id}>{p.nomPoste}</option>
                          ))}
                        </select>

                        <label className="mt-2">Catégorie</label>
                        <select className="form-control" name="idCategorie" value={formData.idCategorie} onChange={handleInputChange}>
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.nomCategorie}</option>
                          ))}
                        </select>
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                        <button className="btn btn-primary" onClick={handleCreateOrUpdate}>
                          {selectedEmployer ? "Enregistrer" : "Créer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/** Modal de suppression */}
              {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Confirmer la suppression</h5>
                        <button
                          className="btn-close btn-close-white"
                          onClick={() => setShowDeleteModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body text-center">
                        Voulez-vous supprimer <strong>{selectedEmployer?.nomIndividu} {selectedEmployer?.prenomIndividu}</strong> ?
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

export default EmployerSociete;
