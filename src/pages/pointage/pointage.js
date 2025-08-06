import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import usePointage from "../../hook/pointage/usePointage";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";
import PosteService from "../../services/poste/posteService";
import ServiceService from "../../services/services/service";

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
    return new Date(dt).toLocaleString("fr-FR");
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
                    {user?.roles === 3 && (
                      <div className="card shadow-lg border-0 p-4 bg-light rounded-4 mb-4">
                        <h4 className="mb-4 text-primary">
                          <i className="icofont-clock-time"></i> Mon Pointage
                        </h4>

                        {successMessage && (
                          <span className="badge badge-success p-2">{successMessage}</span>
                        )}

                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="btn btn-success btn-lg px-4"
                            onClick={() => {
                              const now = new Date().toISOString();
                              const payload = {
                                dateArriver: now,
                                idEmployerSociete: idemployerSociete,
                              };
                              const alreadyArrived = pointage.some(p =>
                                p.idEmployerSociete === idemployerSociete &&
                                !p.dateDepart &&
                                new Date(p.dateArriver).toDateString() === new Date().toDateString()
                              );
                              if (alreadyArrived) return;
                              createPointage(payload, () => {
                                setSuccessMessage("✅ Arrivée pointée !");
                                setTimeout(() => setSuccessMessage(""), 3000);
                              });
                            }}
                          >
                            <i className="icofont-walking"></i> Pointe mon arrivée
                          </button>

                          <button
                            className="btn btn-danger btn-lg px-4"
                            onClick={() => {
                              const todayPointage = pointage.find(p =>
                                p.idEmployerSociete === idemployerSociete &&
                                !p.dateDepart &&
                                new Date(p.dateArriver).toDateString() === new Date().toDateString()
                              );
                              if (!todayPointage) {
                                setSuccessMessage("⛔️ Vous devez pointer votre arrivée d'abord !");
                                return;
                              }
                              const now = new Date().toISOString();
                              const updated = {
                                ...todayPointage,
                                dateDepart: now,
                              };
                              updatePointage(todayPointage.id, updated, () => {
                                setSuccessMessage("✅ Départ pointé !");
                                setTimeout(() => setSuccessMessage(""), 3000);
                              });
                            }}
                          >
                            <i className="icofont-runner-alt-1"></i> Pointe mon départ
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="card shadow p-4 border-0">
                      <h5>📋 Historique des Pointages</h5>

                      {user?.roles !== 3 && (
                        <div className="row mb-3">
                          <div className="col-md-3">
                            <input type="date" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                          </div>
                          <div className="col-md-3">
                            <select className="form-control" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
                              <option value="">-- Service --</option>
                              {services.map(s => (
                                <option key={s.id} value={s.nomService}>{s.nomService}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-3">
                            <select className="form-control" value={filterPoste} onChange={(e) => setFilterPoste(e.target.value)}>
                              <option value="">-- Poste --</option>
                              {postes.map(p => (
                                <option key={p.id} value={p.nomPoste}>{p.nomPoste}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {paginatedPointages.length === 0 ? (
                        <p className="text-muted">Aucun pointage enregistré.</p>
                      ) : (
                        <>
                          <ul className="list-group list-group-flush">
                            {paginatedPointages.map((p) => {
                              const details = getEmployerDetails(p.idEmployerSociete);
                              return (
                                <li
                                  key={p.id}
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                  <div>
                                    <strong>{details.nom} {details.prenom}</strong><br />
                                    <span className="text-muted">
                                      {details.poste} - {details.service}
                                    </span><br />
                                    <strong>Arrivée:</strong> {formatDateTime(p.dateArriver)} <br />
                                    <strong>Départ:</strong> {p.dateDepart ? formatDateTime(p.dateDepart) : <em>Non encore pointé</em>}
                                  </div>
                                  <span className={`badge ${p.dateDepart ? "bg-success" : "bg-warning text-dark"}`}>
                                    {p.dateDepart ? "Complet" : "Incomplet"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="mt-4 d-flex justify-content-center">
                            <nav>
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
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div id="styleSelector"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePointage;