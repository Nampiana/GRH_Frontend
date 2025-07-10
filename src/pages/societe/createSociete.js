import React, { useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useSociete from "../../hook/societe/societeHook";
import { useNavigate } from "react-router-dom";
import useTemplateScripts from "../../utils/useTemplateScripts";
import SocieteServices from "../../services/societe/societeService";

function CreateSociete() {
  useTemplateScripts();
  const { createSociete } = useSociete();
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nomSociete: "",
    logo: "",
    siege: "",
    adresse: "",
    telephone: "",
    numero_fax: "",
    numero_cnaps: "",
    numero_banque: "",
    nom_banque: "",
    adresse_banque: "",
    cp_banque: "",
    ville_banque: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSociete(formData, () => {
      setFormData({
        nomSociete: "",
        logo: "",
        siege: "",
        adresse: "",
        telephone: "",
        numero_fax: "",
        numero_cnaps: "",
        numero_banque: "",
        nom_banque: "",
        adresse_banque: "",
        cp_banque: "",
        ville_banque: "",
      });
      setSuccessMessage("✅ Société enregistrée avec succès !");
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/societe");
      }, 1500);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      SocieteServices.uploadLogo(file)
        .then((res) => {
          setFormData((prev) => ({ ...prev, logo: res.data }));
        })
        .catch((err) => console.error(err));
    }
  };

  return (
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
                      <div className="card shadow p-4 border-0">
                        {/* ✅ Entête avec bouton retour */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-light btn-sm rounded-circle shadow-sm"
                              onClick={() => navigate("/societe")}
                              title="Retour"
                            >
                              <i className="icofont icofont-arrow-left"></i>
                            </button>
                            <h4 className="mb-0 ms-2">
                              <i className="icofont icofont-building-alt"></i> Créer une Société
                            </h4>
                          </div>
                          {successMessage && (
                            <span className="badge badge-success p-2">{successMessage}</span>
                          )}
                        </div>

                        <form onSubmit={handleSubmit}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label>Nom Société <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Nom de la société"
                                name="nomSociete"
                                value={formData.nomSociete}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Logo</label>
                              <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                              {formData.logo && (
                                <div className="mt-2">
                                  <img
                                    src={`http://localhost:8080/api/societe/logo/${formData.logo}`}
                                    alt="Logo"
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <p className="small text-muted mt-1">{formData.logo}</p>
                                </div>
                              )}
                            </div>

                            <div className="col-md-6">
                              <label>Siège</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Siège de la société"
                                name="siege"
                                value={formData.siege}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Adresse</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Adresse de la société"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Téléphone</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Téléphone"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Numéro Fax</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Numéro Fax"
                                name="numero_fax"
                                value={formData.numero_fax}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Numéro CNAPS</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Numéro CNAPS"
                                name="numero_cnaps"
                                value={formData.numero_cnaps}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Numéro Banque</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Numéro Banque"
                                name="numero_banque"
                                value={formData.numero_banque}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Nom Banque</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Nom Banque"
                                name="nom_banque"
                                value={formData.nom_banque}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Adresse Banque</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Adresse Banque"
                                name="adresse_banque"
                                value={formData.adresse_banque}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-3">
                              <label>Code Postal</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Code Postal"
                                name="cp_banque"
                                value={formData.cp_banque}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="col-md-3">
                              <label>Ville Banque</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Ville"
                                name="ville_banque"
                                value={formData.ville_banque}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="mt-4 text-end">
                            <button type="submit" className="btn btn-primary btn-lg">
                              <i className="icofont icofont-save"></i> Enregistrer Société
                            </button>
                          </div>
                        </form>
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
  );
}

export default CreateSociete;
