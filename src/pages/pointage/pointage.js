import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import usePointage from "../../hook/pointage/usePointage";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";

function CreatePointage() {
  useTemplateScripts();
  const { pointage, createPointage, updatePointage, fetchPointage } = usePointage();
  const [user, setUser] = useState(null);
  const [idemployerSociete, setIdemployerSociete] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    }
  }, []);

  const formatDateTime = (dt) => {
    return new Date(dt).toLocaleString("fr-FR");
  };

  const historiquePointage = pointage
    .filter((p) => {
      if (!user) return false;
      if (user.roles === 3) {
        return p.idEmployerSociete === idemployerSociete;
      }
      return true;
    })
    .sort((a, b) => new Date(b.dateArriver) - new Date(a.dateArriver));

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

                        <div className="d-flex gap-3">
                          <button
                            className="btn btn-outline-success"
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
                                setTimeout(() => setSuccessMessage(""), 2000);
                              });
                            }}
                          >
                            <i className="icofont-walking"></i> Pointe mon arrivée
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                              const todayPointage = pointage.find(p => 
                                p.idEmployerSociete === idemployerSociete &&
                                !p.dateDepart &&
                                new Date(p.dateArriver).toDateString() === new Date().toDateString()
                              );

                              if (!todayPointage) {
                                alert("⛔️ Vous devez pointer votre arrivée d'abord !");
                                return;
                              }

                              const now = new Date().toISOString();
                              const updated = {
                                ...todayPointage,
                                dateDepart: now,
                              };

                              updatePointage(todayPointage.id, updated, () => {
                                setSuccessMessage("✅ Départ pointé !");
                                setTimeout(() => setSuccessMessage(""), 2000);
                              });
                            }}
                          >
                            <i className="icofont-runner-alt-1"></i> Pointe mon départ
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="card shadow p-4 border-0">
                      <h5>Historique des Pointages</h5>
                      {historiquePointage.length === 0 ? (
                        <p className="text-muted">Aucun pointage enregistré.</p>
                      ) : (
                        <ul className="list-group list-group-flush">
                          {historiquePointage.map((p) => (
                            <li
                              key={p.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <strong>Arrivée:</strong> {formatDateTime(p.dateArriver)} <br />
                                <strong>Départ:</strong> {p.dateDepart ? formatDateTime(p.dateDepart) : <em>Non encore pointé</em>}
                              </div>
                              <span className={`badge ${p.dateDepart ? "bg-success" : "bg-warning text-dark"}`}>
                                {p.dateDepart ? "Complet" : "Incomplet"}
                              </span>
                            </li>
                          ))}
                        </ul>
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