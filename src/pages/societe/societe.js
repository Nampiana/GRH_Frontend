import React, { useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import { useNavigate } from "react-router-dom";
import useSociete from "../../hook/societe/societeHook";
import useTemplateScripts from "../../utils/useTemplateScripts";

function Societe() {
  useTemplateScripts();
  const { societe, updateSociete, deleteSociete } = useSociete();
  const navigate = useNavigate();

  const [selectedSociete, setSelectedSociete] = useState(null);
  const [nomSociete, setNomSociete] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [societeToDelete, setSocieteToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");



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
    setSuccessMessage("Société modifiée avec succès ✅");

    // Masquer le message et fermer le modal après 2 secondes
    setTimeout(() => {
      setShowModal(false);
      setSelectedSociete(null);
      setSuccessMessage("");
    }, 2000);
  });
};

  const closeModal = () => {
    setShowModal(false);
    setSelectedSociete(null);
  };

  return (
    <>

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
                                            setSocieteToDelete(societe);
                                            setShowDeleteModal(true);
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
                 {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
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
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {showDeleteModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirmer la suppression</h5>
                <button type="button" className="close" onClick={() => setShowDeleteModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer <strong>{societeToDelete?.nom_societe}</strong> ?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deleteSociete(societeToDelete.id);
                    setShowDeleteModal(false);
                    setSocieteToDelete(null);
                  }}
                >
                  Supprimer
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
