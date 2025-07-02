import React from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import { useNavigate } from "react-router-dom";
import useSociete from "../../hook/societe/societeHook";

function Societe() {
  const { societe } = useSociete();
  const navigate = useNavigate();

  const navigateToCreateUser = () => {
    navigate("/create-societe");
  };

  return (
    <>
      {/* Préloader (inutile si tu ne l'utilises pas dynamiquement) */}
      <div class="theme-loader">
        <div class="ball-scale">
            <div class='contain'>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">

                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
                <div class="ring">
                    <div class="frame"></div>
                </div>
            </div>
        </div>
    </div>

      <div id="pcoded" className="pcoded">
        <div className="pcoded-overlay-box"></div>
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
                        <div className="card d-flex flex-column">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Liste Sociétés</h5>
                            <div className="card-header-right">
                              <ul className="list-unstyled card-option">
                                <li>
                                  <i className="icofont icofont-simple-left"></i>
                                </li>
                                <li>
                                  <i className="icofont icofont-maximize full-card"></i>
                                </li>
                                <li>
                                  <i className="icofont icofont-minus minimize-card"></i>
                                </li>
                                <li>
                                  <i className="icofont icofont-refresh reload-card"></i>
                                </li>
                                <li>
                                  <i className="icofont icofont-error close-card"></i>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="card-block table-border-style flex-grow-1">
                            <div className="table-responsive">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Nom société</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {societe.map((societe) => (
                                    <tr key={societe.id}>
                                      <td>{societe.id}</td>
                                      <td>{societe.nom_societe}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* ✅ Bouton bien centré en bas de la carte */}
                          <div className="card-footer text-center">
                            <button
                              className="btn btn-primary btn-round"
                              onClick={navigateToCreateUser}
                            >
                              Créer Société
                            </button>
                          </div>
                        </div>
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
    </>
  );
}

export default Societe;
