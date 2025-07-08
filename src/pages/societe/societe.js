import React, { useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import { useNavigate } from "react-router-dom";
import useSociete from "../../hook/societe/societeHook";
import useTemplateScripts from "../../utils/useTemplateScripts";
import SocieteServices from "../../services/societe/societeService";

function Societe() {
  useTemplateScripts();
  const { societe, updateSociete, deleteSociete } = useSociete();
  const navigate = useNavigate();

  const [selectedSociete, setSelectedSociete] = useState(null);

  const [nomSociete, setNomSociete] = useState("");
  const [logo, setLogo] = useState("");
  const [siege, setSiege] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [numeroFax, setNumeroFax] = useState("");
  const [numeroCnaps, setNumeroCnaps] = useState("");
  const [numeroBanque, setNumeroBanque] = useState("");
  const [nomBanque, setNomBanque] = useState("");
  const [adresseBanque, setAdresseBanque] = useState("");
  const [cpBanque, setCpBanque] = useState("");
  const [villeBanque, setVilleBanque] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [societeToDelete, setSocieteToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigateToCreateUser = () => {
    navigate("/create-societe");
  };

  const handleEditClick = (societe) => {
    setSelectedSociete(societe);
    setNomSociete(societe.nom_societe || "");
    setLogo(societe.logo || "");
    setSiege(societe.siege || "");
    setAdresse(societe.adresse || "");
    setTelephone(societe.telephone || "");
    setNumeroFax(societe.numero_fax || "");
    setNumeroCnaps(societe.numero_cnaps || "");
    setNumeroBanque(societe.numero_banque || "");
    setNomBanque(societe.nom_banque || "");
    setAdresseBanque(societe.adresse_banque || "");
    setCpBanque(societe.cp_banque || "");
    setVilleBanque(societe.ville_banque || "");
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updatedSociete = {
      ...selectedSociete,
      nom_societe: nomSociete,
      logo: logo,
      siege: siege,
      adresse: adresse,
      telephone: telephone,
      numero_fax: numeroFax,
      numero_cnaps: numeroCnaps,
      numero_banque: numeroBanque,
      nom_banque: nomBanque,
      adresse_banque: adresseBanque,
      cp_banque: parseInt(cpBanque, 10),
      ville_banque: villeBanque,
    };

    updateSociete(selectedSociete.id, updatedSociete, () => {
      setSuccessMessage("Société modifiée avec succès ✅");
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

  const handleFileChangeUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      SocieteServices.uploadLogo(file)
        .then((res) => {
          console.log("Nouveau logo uploadé:", res.data);
          setLogo(res.data);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <>
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
                        <div className="card p-3">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Liste des Sociétés</h5>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={navigateToCreateUser}
                            >
                              <i className="icofont icofont-plus"></i> Ajouter une société
                            </button>
                          </div>

                          <div className="row">
                            {societe.map((s) => (
                              <div key={s.id} className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                  <div className="card-body text-center">
                                    {s.logo && (
                                      <img
                                        src={`http://localhost:8080/api/societe/logo/${s.logo}`}
                                        alt="Logo"
                                        className="rounded-circle mb-3"
                                        style={{
                                          width: "90px",
                                          height: "90px",
                                          objectFit: "cover",
                                          border: "2px solid #007bff",
                                        }}
                                      />
                                    )}
                                    <h5>{s.nom_societe}</h5>
                                    <p className="text-muted small mb-1">
                                      {s.siege} - {s.adresse}
                                    </p>
                                    <p className="mb-1">
                                      <strong>Tél:</strong> {s.telephone}
                                    </p>
                                    <p className="mb-1">
                                      <strong>Fax:</strong> {s.numero_fax}
                                    </p>
                                    <p className="mb-1">
                                      <strong>CNAPS:</strong> {s.numero_cnaps}
                                    </p>
                                    <hr />
                                    <p className="mb-1">
                                      <strong>Banque:</strong> {s.nom_banque}
                                    </p>
                                    <p className="mb-1">
                                      <strong>N°:</strong> {s.numero_banque}
                                    </p>
                                    <p className="mb-1">
                                      <strong>Adresse:</strong> {s.adresse_banque}
                                    </p>
                                    <p className="mb-1">
                                      <strong>CP:</strong> {s.cp_banque} -{" "}
                                      <strong>Ville:</strong> {s.ville_banque}
                                    </p>
                                  </div>
                                  <div className="card-footer d-flex justify-content-around">
                                    <button
                                      className="btn btn-warning btn-sm"
                                      onClick={() => handleEditClick(s)}
                                    >
                                      <i className="icofont icofont-edit"></i> Modifier
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => {
                                        setSocieteToDelete(s);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      <i className="icofont icofont-trash"></i> Supprimer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
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

      {/* Modal de modification */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
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
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label>Nom société</label>
                    <input type="text" className="form-control" value={nomSociete} onChange={(e) => setNomSociete(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={handleFileChangeUpdate}
                    />
                    {logo && (
                      <div className="mt-2">
                        <img
                          src={`http://localhost:8080/api/societe/logo/${logo}`}
                          alt="Logo actuel"
                          style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                        <p className="text-muted small mb-0">{logo}</p>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 form-group">
                    <label>Siège</label>
                    <input type="text" className="form-control" value={siege} onChange={(e) => setSiege(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Adresse</label>
                    <input type="text" className="form-control" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Téléphone</label>
                    <input type="text" className="form-control" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Numéro Fax</label>
                    <input type="text" className="form-control" value={numeroFax} onChange={(e) => setNumeroFax(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Numéro CNAPS</label>
                    <input type="text" className="form-control" value={numeroCnaps} onChange={(e) => setNumeroCnaps(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Numéro Banque</label>
                    <input type="text" className="form-control" value={numeroBanque} onChange={(e) => setNumeroBanque(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Nom Banque</label>
                    <input type="text" className="form-control" value={nomBanque} onChange={(e) => setNomBanque(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Adresse Banque</label>
                    <input type="text" className="form-control" value={adresseBanque} onChange={(e) => setAdresseBanque(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Code Postal Banque</label>
                    <input type="number" className="form-control" value={cpBanque} onChange={(e) => setCpBanque(e.target.value)} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Ville Banque</label>
                    <input type="text" className="form-control" value={villeBanque} onChange={(e) => setVilleBanque(e.target.value)} />
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
      )}

      {/* Modal de suppression */}
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
                <h5 className="modal-title text-danger">
                  Confirmer la suppression
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{societeToDelete?.nom_societe}</strong> ?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
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
