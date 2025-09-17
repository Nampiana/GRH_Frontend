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
import ModalForm from '../../components/ModalForm';
import ModalDelete from '../../components/ModalDelete';

// NOTE: Assurez-vous d'avoir les dépendances Bootstrap 5 pour les classes CSS.
// Si ce n'est pas le cas, vous devrez adapter les classes (ex: 'd-flex', 'g-2', etc.)
// ou installer Bootstrap via npm/yarn.

function EmployerSociete() {
  useTemplateScripts();

  const { employers, createEmployer, updateEmployer, deleteEmployer } = useEmployerSociete();
  const { updateUtilisateur } = useUtilisateur();

  // --- États et données ---
  const [individus, setIndividus] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [utilisateur, setUtilisateur] = useState([]);
  const [services, setServices] = useState([]);
  const [postes, setPostes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [user, setUser] = useState({ roles: 1, societe: "" });

  const [formData, setFormData] = useState({
    nom: "", prenom: "", adresse: "", email: "", password: "", telephone: "",
    idSociete: "", idService: "", idPoste: "", idCategorie: "",
    salaireBase: "", dateDebauche: "", role: 3
  });

  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // --- Filtres ---
  const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedDepartementFilter, setSelectedDepartementFilter] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("");
  const [selectedPosteFilter, setSelectedPosteFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // --- Chargement initial des données ---
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({ roles: userData.roles, societe: userData.societe });
    }
    IndividuServices.getAll().then(res => setIndividus(res.data.content || res.data));
    SocieteServices.getAll().then(res => setSocietes(res.data.content || res.data));
    ServiceServices.getAll().then(res => setServices(res.data.content || res.data));
    PosteServices.getAll().then(res => setPostes(res.data.content || res.data));
    CategorieServices.getAll().then(res => setCategories(res.data.content || res.data));
    utilisateurServices.getAll().then(res => setUtilisateur(res.data.content || res.data));
    DepartementServices.getAll().then(res => setDepartements(res.data.content || res.data));
  }, []);

  // --- Fonctions utilitaires ---
  const formatAriary = (val) => {
    if (val === null || val === undefined || val === "") return "N/A";
    try {
      return new Intl.NumberFormat("fr-MG", { style: "currency", currency: "MGA", maximumFractionDigits: 0 }).format(Number(val));
    } catch {
      return `${Number(val).toLocaleString("fr-MG")} Ar`;
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "", prenom: "", adresse: "", email: "", password: "", telephone: "",
      idSociete: "", idService: "", idPoste: "", idCategorie: "",
      salaireBase: "", dateDebauche: "", role: user.roles === 1 ? 2 : 3
    });
    setSelectedEmployer(null);
  };

  // --- Gestionnaires d'événements ---
  const handleInputChange = e => {
    const { name, value } = e.target;
    const isNumberField = ["salaireBase"].includes(name);
    const newValue = isNumberField ? (value === "" ? "" : Math.max(0, Number(value))) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleCreateOrUpdate = () => {
    const roleToAssign = selectedEmployer && user.roles === 1 ? formData.role : (user.roles === 1 ? 2 : formData.role);
    const payload = {
      employerSociete: {
        idSociete: formData.idSociete, idService: formData.idService, idPoste: formData.idPoste,
        idCategorie: formData.idCategorie, salaireBase: formData.salaireBase === "" ? null : Number(formData.salaireBase),
        dateDebauche: formData.dateDebauche || null
      },
      nom: formData.nom, prenom: formData.prenom, adresse: formData.adresse,
      email: formData.email, telephone: formData.telephone,
      idSociete: formData.idSociete, role: parseInt(roleToAssign, 10)
    };

    if (selectedEmployer) {
      const utilisateurToUpdate = {
        idIndividu: selectedEmployer.idIndividue, idSociete: formData.idSociete,
        etat: 1, roles: parseInt(formData.role, 10)
      };
      updateEmployer(selectedEmployer.id, payload, () => {
        updateUtilisateur(selectedEmployer.idUtilisateur, utilisateurToUpdate, () => {
          setSuccessMessage("Employé modifié avec succès !");
          setShowModal(false);
          resetForm();
        });
      });
    } else {
      createEmployer({ ...payload, password: formData.password }, () => {
        setSuccessMessage("Employé créé avec succès !");
        setShowModal(false);
        resetForm();
      });
    }
  };

  const handleEdit = employer => {
    const individu = individus.find(i => i.id === employer.idIndividue);
    const userRole = utilisateur.find(u => u.id === employer.idUtilisateur)?.roles || 3;
    setSelectedEmployer(employer);
    setFormData({
      nom: individu?.nom || "", prenom: individu?.prenom || "", adresse: individu?.adresse || "",
      email: individu?.email || "", password: "", telephone: individu?.telephone || "",
      idSociete: employer.idSociete, idService: employer.idService, idPoste: employer.idPoste,
      idCategorie: employer.idCategorie, salaireBase: employer.salaireBase ?? "",
      dateDebauche: employer.dateDebauche ? employer.dateDebauche.split("T")[0] : "",
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

  // Filtrage des employés
  const filteredEmployers = employers
    .filter(e => {
      const isSuperAdmin = user.roles === 1;
      const isRh = user.roles === 2;

      // Filtre par société
      if (isSuperAdmin && selectedSocieteFilter && e.idSociete !== selectedSocieteFilter) return false;
      if (isRh && e.idSociete !== user.societe) return false;

      // Filtre par recherche nom/prénom
      if (searchName.trim()) {
        const individu = individus.find(i => i.id === e.idIndividue);
        const fullName = `${(individu?.nom || "")} ${(individu?.prenom || "")}`.toLowerCase();
        if (!fullName.includes(searchName.trim().toLowerCase())) return false;
      }

      // Filtres avancés
      if (selectedDepartementFilter) {
        const serv = services.find(s => s.id === e.idService);
        if (!serv || serv.idDepartement !== selectedDepartementFilter) return false;
      }
      if (selectedServiceFilter && e.idService !== selectedServiceFilter) return false;
      if (selectedPosteFilter && e.idPoste !== selectedPosteFilter) return false;

      return true;
    });

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content">
              <div className="page-wrapper p-4">
                <div className="page-header mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="page-title">Gestion des Employés</h2>
                      <p className="text-muted">Gérez et suivez facilement les employés de votre société.</p>
                    </div>
                    <div className="col-md-4 text-end">
                      <button
                        className="btn btn-primary shadow-sm"
                        onClick={() => {
                          resetForm();
                          setShowModal(true);
                        }}
                      >
                        <i className="icofont icofont-plus me-2"></i> Nouvel Employé
                      </button>
                    </div>
                  </div>
                </div>

                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                )}

                {/* --- Section des filtres et recherche --- */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header border-0 pb-0">
                    <h5 className="card-title">Filtres de recherche</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6 col-lg-4">
                        <label className="form-label text-muted fw-bold">Rechercher par nom</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="icofont icofont-search"></i></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nom ou prénom..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                          />
                        </div>
                      </div>
                      {user.roles === 1 && (
                        <div className="col-md-6 col-lg-4">
                          <label className="form-label text-muted fw-bold">Filtrer par Société</label>
                          <select
                            className="form-select"
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
                      <div className="col-md-12 col-lg-4 d-flex align-items-end">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          aria-expanded={showAdvancedFilters}
                          aria-controls="advancedFiltersCollapse"
                        >
                          <i className={`icofont icofont-caret-${showAdvancedFilters ? 'up' : 'down'} me-2`}></i>
                          Filtres avancés
                        </button>
                      </div>
                    </div>
                    <div className={`collapse ${showAdvancedFilters ? 'show' : ''}`} id="advancedFiltersCollapse">
                      <div className="row g-3 mt-3">
                        <div className="col-md-4">
                          <label className="form-label text-muted fw-bold">Département</label>
                          <select
                            className="form-select"
                            value={selectedDepartementFilter}
                            onChange={(e) => {
                              setSelectedDepartementFilter(e.target.value);
                              setSelectedServiceFilter("");
                              setSelectedPosteFilter("");
                            }}
                          >
                            <option value="">Tous les départements</option>
                            {(user.roles === 2 ? departements.filter(d => d.idSociete === user.societe) : departements).map(d => (
                              <option key={d.id} value={d.id}>{d.nomDepartement}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-muted fw-bold">Service</label>
                          <select
                            className="form-select"
                            value={selectedServiceFilter}
                            onChange={(e) => {
                              setSelectedServiceFilter(e.target.value);
                              setSelectedPosteFilter("");
                            }}
                          >
                            <option value="">Tous les services</option>
                            {(user.roles === 2 ? services.filter(s => s.idSociete === user.societe) : services)
                              .filter(s => !selectedDepartementFilter || s.idDepartement === selectedDepartementFilter)
                              .map(s => (
                                <option key={s.id} value={s.id}>{s.nomService}</option>
                              ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-muted fw-bold">Poste</label>
                          <select
                            className="form-select"
                            value={selectedPosteFilter}
                            onChange={(e) => setSelectedPosteFilter(e.target.value)}
                          >
                            <option value="">Tous les postes</option>
                            {(user.roles === 2 ? postes.filter(p => p.idSociete === user.societe) : postes).map(p => (
                              <option key={p.id} value={p.id}>{p.nomPoste}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-end">
                      <button className="btn btn-link text-muted" onClick={() => {
                        setSearchName("");
                        setSelectedSocieteFilter("");
                        setSelectedDepartementFilter("");
                        setSelectedServiceFilter("");
                        setSelectedPosteFilter("");
                        setShowAdvancedFilters(false);
                      }}>
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- Section du tableau des employés --- */}
                <div className="card shadow-sm">
                  <div className="card-body p-0">
                    {filteredEmployers.length === 0 ? (
                      <p className="text-center text-muted py-5 mb-0">Aucun employé ne correspond aux critères de recherche.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover table-borderless align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th scope="col" className="text-muted fw-bold">Nom et Prénom</th>
                              <th scope="col" className="text-muted fw-bold">Détails</th>
                              <th scope="col" className="text-muted fw-bold">Contact</th>
                              <th scope="col" className="text-muted fw-bold">Salaire</th>
                              <th scope="col" className="text-muted fw-bold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEmployers.map(e => {
                              const individu = individus.find(i => i.id === e.idIndividue) || {};
                              const societe = societes.find(s => s.id === e.idSociete)?.nomSociete || "N/A";
                              const service = services.find(s => s.id === e.idService)?.nomService || "N/A";
                              const poste = postes.find(p => p.id === e.idPoste)?.nomPoste || "N/A";
                              const categorie = categories.find(c => c.id === e.idCategorie)?.nomCategorie || "N/A";
                              const role = utilisateur.find(u => u.id === e.idUtilisateur)?.roles === 2 ? "RH" : "Employé";
                              const dateEmbauche = e.dateEmbauche ? new Date(e.dateEmbauche).toLocaleDateString() : "N/A";
                              const dateDebauche = e.dateDebauche ? new Date(e.dateDebauche).toLocaleDateString() : "Actif";

                              return (
                                <tr key={e.id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="flex-shrink-0 me-3">
                                        <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                          <i className="icofont icofont-user"></i>
                                        </div>
                                      </div>
                                      <div className="flex-grow-1">
                                        <p className="mb-0 fw-bold">{individu.nom || "N/A"} {individu.prenom || "N/A"}</p>
                                        <p className="mb-0 text-muted small">{poste} - {service}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <p className="mb-0 fw-bold">{societe}</p>
                                    <p className="mb-0 text-muted small">{categorie}</p>
                                  </td>
                                  <td>
                                    <p className="mb-0"><i className="icofont icofont-phone me-2 text-primary"></i>{individu.telephone || "N/A"}</p>
                                    <p className="mb-0"><i className="icofont icofont-ui-email me-2 text-primary"></i>{individu.email || "N/A"}</p>
                                  </td>
                                  <td>
                                    <p className="mb-0 fw-bold">{formatAriary(e.salaireBase)}</p>
                                    <p className="mb-0 text-muted small">{dateEmbauche}</p>
                                  </td>
                                  <td className="text-center">
                                    <div className="btn-group" role="group">
                                      <button className="btn btn-light btn-sm text-warning" onClick={() => handleEdit(e)}>
                                        <i className="icofont icofont-edit"></i>
                                      </button>
                                      <button className="btn btn-light btn-sm text-danger" onClick={() => handleDelete(e)}>
                                        <i className="icofont icofont-trash"></i>
                                      </button>
                                    </div>
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
            </div>
          </div>
        </div>
      </div>

      <ModalForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        formData={formData}
        handleInputChange={handleInputChange}
        handleCreateOrUpdate={handleCreateOrUpdate}
        selectedEmployer={selectedEmployer}
        user={user}
        societes={societes}
        services={services}
        postes={postes}
        categories={categories}
        formatAriary={formatAriary}
      />

      <ModalDelete
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        confirmDelete={confirmDelete}
        nom={formData.nom}
        prenom={formData.prenom}
      />
    </div>
  );
}

export default EmployerSociete;