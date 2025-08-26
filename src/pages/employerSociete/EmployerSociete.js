import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useEmployerSociete from "../../hook/employerSociete/useEmployerSociete";
import SocieteServices from "../../services/societe/societeService";
import ServiceServices from "../../services/services/service";
import IndividuServices from "../../services/individu/individuService";
import PosteServices from "../../services/poste/posteService";
import CategorieServices from "../../services/categorie/categorie";
import DepartementServices from "../../services/departement/departement";
import utilisateurServices from "../../services/utilisateur/utilisateurService";
import useTemplateScripts from "../../utils/useTemplateScripts";
import useUtilisateur from "../../hook/utilisateur/utilisateurHook";

function EmployerSociete() {
  useTemplateScripts();

  const { employers, createEmployer, updateEmployer, deleteEmployer } = useEmployerSociete();
  const { updateUtilisateur } = useUtilisateur();

  // Données
  const [individus, setIndividus] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [utilisateur, setUtilisateur] = useState([]);
  const [services, setServices] = useState([]);
  const [postes, setPostes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departements, setDepartements] = useState([]);

  // User (roles, societe)
  const [user, setUser] = useState({ roles: 1, societe: "" });

  // Formulaire (➕ salaireBase)
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
    salaireBase: "", // ⇐ NEW
    role: 3
  });

  // Sélections / Modales
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Messages
  const [successMessage, setSuccessMessage] = useState("");

  // Filtres
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedDepartementFilter, setSelectedDepartementFilter] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("");
  const [selectedPosteFilter, setSelectedPosteFilter] = useState("");

  // Récup user
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({ roles: userData.roles, societe: userData.societe });
    }
  }, []);

  // Charger référentiels
  useEffect(() => {
    IndividuServices.getAll().then(res => setIndividus(res.data.content || res.data));
    SocieteServices.getAll().then(res => setSocietes(res.data.content || res.data));
    ServiceServices.getAll().then(res => setServices(res.data.content || res.data));
    PosteServices.getAll().then(res => setPostes(res.data.content || res.data));
    CategorieServices.getAll().then(res => setCategories(res.data.content || res.data));
    utilisateurServices.getAll().then(res => setUtilisateur(res.data.content || res.data));
    DepartementServices.getAll().then(res => setDepartements(res.data.content || res.data));
  }, []);

  // Format Ariary (fallback si Intl MGA indisponible)
  const formatAriary = (val) => {
    if (val === null || val === undefined || val === "") return "N/A";
    try {
      return new Intl.NumberFormat("fr-MG", {
        style: "currency",
        currency: "MGA",
        maximumFractionDigits: 0
      }).format(Number(val));
    } catch {
      return `${Number(val).toLocaleString("fr-MG")} Ar`;
    }
  };

  // Form handlers (convertit salaireBase en nombre si possible)
  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name === "salaireBase") {
      const num = value === "" ? "" : Math.max(0, Number(value));
      setFormData(prev => ({ ...prev, [name]: isNaN(num) ? "" : num }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      salaireBase: "", // ⇐ reset
      role: user.roles === 1 ? 2 : 3
    });
    setSelectedEmployer(null);
  };

  // Create / Update (➕ salaireBase dans employerSociete)
  const handleCreateOrUpdate = () => {
    let roleToAssign = formData.role;

    if (!selectedEmployer && user.roles === 1) {
      roleToAssign = 2;
    }

    const payload = {
      employerSociete: {
        idSociete: formData.idSociete,
        idService: formData.idService,
        idPoste: formData.idPoste,
        idCategorie: formData.idCategorie,
        salaireBase: formData.salaireBase === "" ? null : Number(formData.salaireBase) // ⇐ NEW
      },
      nom: formData.nom,
      prenom: formData.prenom,
      adresse: formData.adresse,
      email: formData.email,
      telephone: formData.telephone,
      idSociete: formData.idSociete,
      role: parseInt(roleToAssign, 10)
    };

    const createPayload = {
      ...payload,
      password: formData.password
    };

    if (selectedEmployer) {
      updateEmployer(selectedEmployer.id, payload, () => {
        // Mettre à jour aussi l'utilisateur lié
        const utilisateurToUpdate = {
          idIndividu: selectedEmployer.idIndividue,
          idSociete: formData.idSociete,
          etat: 1,
          roles: parseInt(formData.role, 10)
        };

        updateUtilisateur(selectedEmployer.idUtilisateur, utilisateurToUpdate, () => {
          IndividuServices.getAll().then(res => setIndividus(res.data.content || res.data));
          utilisateurServices.getAll().then(res => setUtilisateur(res.data.content || res.data));
          setSuccessMessage("Employé modifié avec succès !");
          setShowModal(false);
          resetForm();
        });
      });
    } else {
      createEmployer(createPayload, () => {
        IndividuServices.getAll().then(res => setIndividus(res.data.content || res.data));
        utilisateurServices.getAll().then(res => setUtilisateur(res.data.content || res.data));
        setSuccessMessage("Employé créé avec succès !");
        setShowModal(false);
        resetForm();
      });
    }
  };

  // Edit / Delete (pré-remplir salaireBase)
  const handleEdit = employer => {
    const individu = individus.find(i => i.id === employer.idIndividue);
    const userRole = utilisateur.find(u => u.id === employer.idUtilisateur)?.roles || 3;

    setSelectedEmployer(employer);
    setFormData({
      nom: individu?.nom || "",
      prenom: individu?.prenom || "",
      adresse: individu?.adresse || "",
      email: individu?.email || "",
      password: "",
      telephone: individu?.telephone || "",
      idSociete: employer.idSociete,
      idService: employer.idService,
      idPoste: employer.idPoste,
      idCategorie: employer.idCategorie,
      salaireBase: employer.salaireBase ?? "", // ⇐ NEW
      role: userRole
    });
    setShowModal(true);
  };

  const handleDelete = employer => {
    setSelectedEmployer(employer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteEmployer(selectedEmployer.id, () => {
      IndividuServices.getAll().then(res => setIndividus(res.data.content || res.data));
      setSuccessMessage("Employé supprimé avec succès !");
      setShowDeleteModal(false);
      resetForm();
    });
  };

  // Auto-hide message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
                        onClick={() => {
                          resetForm();
                          setShowModal(true);
                        }}
                      >
                        <i className="icofont icofont-plus"></i> Créer
                      </button>
                    </div>

                    {successMessage && (
                      <div className="alert alert-success" role="alert">
                        {successMessage}
                      </div>
                    )}

                    {/* Filtre Société (rôle 1) */}
                    {user.roles === 1 && (
                      <div className="mb-3">
                        <label>Filtrer par Société :</label>
                        <select
                          className="form-control"
                          value={selectedSocieteFilter}
                          onChange={(e) => setSelectedSocieteFilter(e.target.value)}
                        >
                          <option value="">Toutes les sociétés</option>
                          {societes.map(s => (
                            <option key={s.id} value={s.id}>{s.nomSociete}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Filtres avancés */}
                    <div className="card p-3 mb-3">
                      <div className="row g-2 align-items-end">
                        <div className="col-md-3">
                          <label>Recherche (Nom / Prénom)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                          />
                        </div>

                        <div className="col-md-3">
                          <label>Département</label>
                          <select
                            className="form-control"
                            value={selectedDepartementFilter}
                            onChange={(e) => {
                              setSelectedDepartementFilter(e.target.value);
                              setSelectedServiceFilter("");
                              setSelectedPosteFilter("");
                            }}
                          >
                            <option value="">Tous les départements</option>
                            {(user.roles === 2
                              ? departements.filter(d => d.idSociete === user.societe)
                              : departements
                            ).map(d => (
                              <option key={d.id} value={d.id}>{d.nomDepartement}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label>Service</label>
                          <select
                            className="form-control"
                            value={selectedServiceFilter}
                            onChange={(e) => {
                              setSelectedServiceFilter(e.target.value);
                              setSelectedPosteFilter("");
                            }}
                          >
                            <option value="">Tous les services</option>
                            {(user.roles === 2
                              ? services.filter(s => s.idSociete === user.societe)
                              : services
                            )
                              .filter(s => !selectedDepartementFilter || s.idDepartement === selectedDepartementFilter)
                              .map(s => (
                                <option key={s.id} value={s.id}>{s.nomService}</option>
                              ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label>Poste</label>
                          <select
                            className="form-control"
                            value={selectedPosteFilter}
                            onChange={(e) => setSelectedPosteFilter(e.target.value)}
                          >
                            <option value="">Tous les postes</option>
                            {(user.roles === 2
                              ? postes.filter(p => p.idSociete === user.societe)
                              : postes
                            ).map(p => (
                              <option key={p.id} value={p.id}>{p.nomPoste}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-12 d-flex gap-2 mt-2">
                          <button
                            className="btn btn-light border"
                            onClick={() => {
                              setSearchName("");
                              setSelectedDepartementFilter("");
                              setSelectedServiceFilter("");
                              setSelectedPosteFilter("");
                            }}
                          >
                            Réinitialiser les filtres
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tableau (➕ colonne Salaire) */}
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
                              <th>Rôles</th>
                              <th>Date d'embauche</th>
                              <th>Salaire de base</th> {/* ⇐ NEW */}
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employers
                              .filter(e => {
                                if (user.roles === 1) {
                                  if (selectedSocieteFilter && e.idSociete !== selectedSocieteFilter) return false;
                                } else if (user.roles === 2) {
                                  if (e.idSociete !== user.societe) return false;
                                } else {
                                  return false;
                                }

                                if (searchName.trim()) {
                                  const individu = individus.find(i => i.id === e.idIndividue);
                                  const full = `${(individu?.nom || "")} ${(individu?.prenom || "")}`.toLowerCase();
                                  if (!full.includes(searchName.trim().toLowerCase())) return false;
                                }

                                if (selectedDepartementFilter) {
                                  const serv = services.find(s => s.id === e.idService);
                                  if (!serv || serv.idDepartement !== selectedDepartementFilter) return false;
                                }

                                if (selectedServiceFilter && e.idService !== selectedServiceFilter) return false;
                                if (selectedPosteFilter && e.idPoste !== selectedPosteFilter) return false;

                                return true;
                              })
                              .map((e, index) => {
                                const individu = individus.find(i => i.id === e.idIndividue) || {};
                                return (
                                  <tr key={e.id}>
                                    <td>{index + 1}</td>
                                    <td>{individu.nom || "N/A"}</td>
                                    <td>{individu.prenom || "N/A"}</td>
                                    <td>{societes.find(s => s.id === e.idSociete)?.nomSociete || "N/A"}</td>
                                    <td>{services.find(s => s.id === e.idService)?.nomService || "N/A"}</td>
                                    <td>{postes.find(p => p.id === e.idPoste)?.nomPoste || "N/A"}</td>
                                    <td>{categories.find(c => c.id === e.idCategorie)?.nomCategorie || "N/A"}</td>
                                    <td>{individu.telephone || "N/A"}</td>
                                    <td>{individu.email || "N/A"}</td>
                                    <td>
                                      {(() => {
                                        const role = utilisateur.find(u => u.id === e.idUtilisateur)?.roles;
                                        return role === 2 ? "RH" : role === 3 ? "Employé" : "N/A";
                                      })()}
                                    </td>
                                    <td>{e.dateEmbauche ? new Date(e.dateEmbauche).toLocaleDateString() : "N/A"}</td>
                                    <td>{formatAriary(e.salaireBase)}</td> {/* ⇐ NEW */}
                                    <td>
                                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(e)}>
                                        Modifier
                                      </button>
                                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e)}>
                                        Supprimer
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal création/modification (➕ champ salaireBase) */}
              {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                      <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                          {selectedEmployer ? "Modifier Employé" : "Créer Employé"}
                        </h5>
                        <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {["nom", "prenom", "adresse", "email", "telephone"].map(field => (
                          <div key={field}>
                            <label className="mt-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input
                              type="text"
                              className="form-control"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                            />
                          </div>
                        ))}

                        {!selectedEmployer && (
                          <div>
                            <label className="mt-2">Password</label>
                            <input
                              type="password"
                              className="form-control"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                            />
                          </div>
                        )}

                        {(user.roles === 2 || selectedEmployer) ? (
                          <div>
                            <label className="mt-2">Rôle</label>
                            <select
                              className="form-control"
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                            >
                              <option value={2}>RH</option>
                              <option value={3}>Employé</option>
                            </select>
                          </div>
                        ) : (
                          !selectedEmployer && <input type="hidden" name="role" value={2} />
                        )}

                        <label className="mt-2">Société</label>
                        <select
                          className="form-control"
                          name="idSociete"
                          value={formData.idSociete}
                          onChange={handleInputChange}
                        >
                          <option value="">Sélectionner une société</option>
                          {user.roles === 2
                            ? societes
                              .filter(s => s.id === user.societe)
                              .map(s => (
                                <option key={s.id} value={s.id}>{s.nomSociete}</option>
                              ))
                            : societes.map(s => (
                              <option key={s.id} value={s.id}>{s.nomSociete}</option>
                            ))
                          }
                        </select>

                        <label className="mt-2">Service</label>
                        <select
                          className="form-control"
                          name="idService"
                          value={formData.idService}
                          onChange={handleInputChange}
                        >
                          <option value="">Sélectionner un service</option>
                          {(user.roles === 2
                            ? services.filter(s => s.idSociete === user.societe)
                            : services
                          ).map(s => (
                            <option key={s.id} value={s.id}>{s.nomService}</option>
                          ))}
                        </select>

                        <label className="mt-2">Poste</label>
                        <select
                          className="form-control"
                          name="idPoste"
                          value={formData.idPoste}
                          onChange={handleInputChange}
                        >
                          <option value="">Sélectionner un poste</option>
                          {(user.roles === 2
                            ? postes.filter(p => p.idSociete === user.societe)
                            : postes
                          ).map(p => (
                            <option key={p.id} value={p.id}>{p.nomPoste}</option>
                          ))}
                        </select>

                        <label className="mt-2">Catégorie</label>
                        <select
                          className="form-control"
                          name="idCategorie"
                          value={formData.idCategorie}
                          onChange={handleInputChange}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.nomCategorie}</option>
                          ))}
                        </select>

                        {/* NEW: Salaire de base */}
                        <div>
                          <label className="mt-2">Salaire de base (Ariary)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="salaireBase"
                            min="0"
                            step="1"
                            placeholder="Ex: 450000"
                            value={formData.salaireBase}
                            onChange={handleInputChange}
                          />
                          <small className="text-muted">
                            {formData.salaireBase !== "" ? `Aperçu : ${formatAriary(formData.salaireBase)}` : ""}
                          </small>
                        </div>
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

              {/* Modal suppression */}
              {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-3">
                      <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Confirmer la suppression</h5>
                        <button className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                      </div>
                      <div className="modal-body text-center">
                        Voulez-vous supprimer <strong>{formData.nom} {formData.prenom}</strong> ?
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
