import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import usePointage from "../../hook/pointage/usePointage";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";
import PosteService from "../../services/poste/posteService";
import ServiceService from "../../services/services/service";
import FacialCapture from "../../pages/faciale/FacialCapture";
import ExportPointage from "./ExportPointage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faHistory, faFilter, faSearch, faRedo } from '@fortawesome/free-solid-svg-icons';

function CreatePointage() {
  useTemplateScripts();
  const { pointage, createPointage, updatePointage, fetchPointage } = usePointage();
  const [user, setUser] = useState(null);
  const [idemployerSociete, setIdemployerSociete] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [employers, setEmployers] = useState([]);
  const [individus, setIndividus] = useState([]);
  const [postes, setPostes] = useState([]);
  const [services, setServices] = useState([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterPoste, setFilterPoste] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      EmployerSocieteService.getByUtilisateur(userData.idUtilisateur)
        .then((res) => {
          if (res.data) {
            setIdemployerSociete(res.data.id);
            fetchPointage();
          }
        })
        .catch((err) => console.error(err));

      EmployerSocieteService.getAll().then(res => setEmployers(res.data));
      IndividuService.getAll().then(res => setIndividus(res.data));
      PosteService.getAll().then(res => setPostes(res.data));
      ServiceService.getAll().then(res => setServices(res.data));
    }
  }, []);

  const formatDateTime = (dt) => {
    return new Date(dt).toLocaleString("fr-FR", {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getEmployerDetails = (idEmployerSociete) => {
    const employer = employers.find(e => e.id === idEmployerSociete);
    if (!employer) return {};

    const individu = individus.find(i => i.id === employer.idIndividue);
    const poste = postes.find(p => p.id === employer.idPoste);
    const service = services.find(s => s.id === employer.idService);

    return {
      nom: individu?.nom || "",
      prenom: individu?.prenom || "",
      poste: poste?.nomPoste || "",
      service: service?.nomService || "",
    };
  };

  const filteredPointages = pointage
    .filter((p) => {
      if (!user) return false;
      if (user.roles === 3) {
        return p.idEmployerSociete === idemployerSociete;
      }
      return true;
    })
    .filter((p) => {
      const details = getEmployerDetails(p.idEmployerSociete);
      const dateMatch = filterDate ? new Date(p.dateArriver).toDateString() === new Date(filterDate).toDateString() : true;
      const serviceMatch = filterService ? details.service === filterService : true;
      const posteMatch = filterPoste ? details.poste === filterPoste : true;
      return dateMatch && serviceMatch && posteMatch;
    })
    .sort((a, b) => new Date(b.dateArriver) - new Date(a.dateArriver));

  const totalPages = Math.ceil(filteredPointages.length / itemsPerPage);
  const paginatedPointages = filteredPointages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setFilterDate("");
    setFilterService("");
    setFilterPoste("");
  };

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content px-4">
              <div className="page-wrapper pt-4">
                <div className="page-body">
                  <div className="row">
                    {/* Section de pointage pour l'employé */}
                    {user?.roles === 3 && (
                      <div className="col-12 mb-4">
                        <div className="card shadow-sm border-0 p-4 bg-light rounded-3">
                          <h4 className="card-title text-primary fw-bold mb-4">
                            <FontAwesomeIcon icon={faClock} className="me-2" /> Mon Pointage
                          </h4>
                          {successMessage && (
                            <div className="alert alert-success d-flex align-items-center" role="alert">
                              <i className="icofont-check-circled me-2"></i>
                              <div>{successMessage}</div>
                            </div>
                          )}
                          {idemployerSociete && (
                            <FacialCapture
                              employerId={idemployerSociete}
                              pointage={pointage}
                              createPointage={createPointage}
                              updatePointage={updatePointage}
                              setSuccessMessage={setSuccessMessage}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Section d'historique et de filtres */}
                    <div className="col-12">
                      <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-body p-4">
                          <h5 className="card-title mb-4 text-primary fw-bold">
                            <FontAwesomeIcon icon={faHistory} className="me-2" /> Historique des Pointages
                          </h5>

                          {/* Filtres de recherche (pour RH) */}
                          {user?.roles !== 3 && (
                            <div className="row g-3 mb-4 p-3 bg-light rounded-3">
                              <h6 className="mb-3 text-muted">
                                <FontAwesomeIcon icon={faFilter} className="me-2" /> Filtres de recherche
                              </h6>
                              <div className="col-md-4">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Service</label>
                                <select className="form-control" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
                                  <option value="">Tous les services</option>
                                  {services.map(s => (
                                    <option key={s.id} value={s.nomService}>{s.nomService}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Poste</label>
                                <select className="form-control" value={filterPoste} onChange={(e) => setFilterPoste(e.target.value)}>
                                  <option value="">Tous les postes</option>
                                  {postes.map(p => (
                                    <option key={p.id} value={p.nomPoste}>{p.nomPoste}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-12 d-flex justify-content-end mt-3">
                                <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
                                  <FontAwesomeIcon icon={faRedo} className="me-2" /> Réinitialiser
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Liste des pointages */}
                          {paginatedPointages.length === 0 ? (
                            <div className="text-center p-5">
                              <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted mb-3" />
                              <p className="text-muted">Aucun pointage trouvé pour cette sélection.</p>
                            </div>
                          ) : (
                            <>
                              <div className="list-group">
                                {paginatedPointages.map((p) => {
                                  const details = getEmployerDetails(p.idEmployerSociete);
                                  return (
                                    <div key={p.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start mb-3 border rounded-3 p-3 shadow-sm">
                                      <div className="w-100">
                                        <div className="d-flex w-100 justify-content-between align-items-center">
                                          <h6 className="mb-1 fw-bold text-dark">{details.nom} {details.prenom}</h6>
                                          <small className={`badge bg-${p.dateDepart ? "success" : "warning text-dark"} rounded-pill`}>
                                            {p.dateDepart ? "Complet" : "Incomplet"}
                                          </small>
                                        </div>
                                        <p className="mb-1 text-muted">
                                          <i className="icofont-id-card me-1"></i> {details.poste} - {details.service}
                                        </p>
                                        <div className="d-flex justify-content-between mt-2 flex-wrap">
                                          <div className="me-3 mb-2">
                                            <i className="icofont-login text-success me-1"></i>
                                            <span className="fw-bold">Arrivée:</span> <span className="text-secondary">{formatDateTime(p.dateArriver)}</span>
                                          </div>
                                          <div className="mb-2">
                                            <i className="icofont-logout text-danger me-1"></i>
                                            <span className="fw-bold">Départ:</span> <span className="text-secondary">{p.dateDepart ? formatDateTime(p.dateDepart) : <em className="text-danger">Non pointé</em>}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <nav className="mt-4 d-flex justify-content-center">
                                <ul className="pagination">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <li
                                      key={page}
                                      className={`page-item ${page === currentPage ? "active" : ""}`}
                                      onClick={() => setCurrentPage(page)}
                                    >
                                      <button className="page-link">{page}</button>
                                    </li>
                                  ))}
                                </ul>
                              </nav>
                            </>
                          )}
                          {user?.roles === 2 && (
                            <div className="mt-4 d-flex justify-content-center">
                              <ExportPointage
                                pointage={filteredPointages}
                                employers={employers}
                                individus={individus}
                                postes={postes}
                                services={services}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePointage;