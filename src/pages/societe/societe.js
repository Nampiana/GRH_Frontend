import React, { useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import { useNavigate } from "react-router-dom";
import useSociete from "../../hook/societe/societeHook";

function Societe() {
  const { societe, updateSociete, deleteSociete } = useSociete();
  const navigate = useNavigate();

  const [selectedSociete, setSelectedSociete] = useState(null);
  const [nomSociete, setNomSociete] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigateToCreateUser = () => {
    navigate("/create-societe");
  };

  const handleEditClick = (societe) => {
    setSelectedSociete(societe);
    setNomSociete(societe.nom_societe);
    setShowModal(true);
  };

  const handleUpdate = () => {
    updateSociete(selectedSociete.id, { nom_societe: nomSociete }, () => {
      setShowModal(false);
      setSelectedSociete(null);
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSociete(null);
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
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {societe.map((societe) => (
                                    <tr key={societe.id}>
                                      <td>{societe.id}</td>
                                      <td>{societe.nom_societe}</td>
                                      <td>
                                        <button
                                          className="btn btn-warning btn-sm mr-2"
                                          onClick={() => handleEditClick(societe)}
                                        >
                                          Modifier
                                        </button>
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() => {
                                            if (window.confirm("Êtes-vous sûr de vouloir supprimer cette société ?")) {
                                              deleteSociete(societe.id);
                                            }
                                          }}
                                        >
                                          Supprimer
                                        </button>
                                      </td>
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

      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier Société</h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom société</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nomSociete}
                    onChange={(e) => setNomSociete(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Confirmer modification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Societe;
