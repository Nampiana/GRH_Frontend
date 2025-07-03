import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useSociete from "../../hook/societe/societeHook";
import { useNavigate } from "react-router-dom";
import useTemplateScripts from "../../utils/useTemplateScripts";

function CreateSociete() {
  useTemplateScripts();
  const { societe, createSociete } = useSociete();
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom_societe: "",
    logo: "",
    siege: "",
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

    const dataToSend = { ...formData }; // envoie tout le formulaire

    createSociete(dataToSend, () => {
      setFormData({
        nom_societe: "",
        logo: "",
        siege: "",
        telephone: "",
        numero_fax: "",
        numero_cnaps: "",
        numero_banque: "",
        nom_banque: "",
        adresse_banque: "",
        cp_banque: "",
        ville_banque: "",
      });

      setSuccessMessage("Société enregistrée avec succès ✅");

      setTimeout(() => {
        setSuccessMessage("");
        navigate("/societe");
      }, 1000);
    });
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
                        <div class="card">
                          <div class="card-header">
                            <h5>Ajouter un socièté</h5>
                            {successMessage && (
                              <div className="alert alert-success mt-3" role="alert">
                                {successMessage}
                              </div>
                            )}
                            <div class="card-header-right"><i class="icofont icofont-spinner-alt-5"></i></div>
                          </div>
                          <div class="card-block">
                            <form onSubmit={handleSubmit}>
                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Nom socièté</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control form-control-normal"
                                    placeholder="nom socièté"
                                    name="nom_societe"
                                    value={formData.nom_societe}
                                    onChange={handleChange}
                                    required />
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Logo</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="logo"
                                    value={formData.logo}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Siège</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="siege"
                                    value={formData.siege}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Téléphone</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Numéro Fax</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="numero_fax"
                                    value={formData.numero_fax}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Numéro CNAPS</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="numero_cnaps"
                                    value={formData.numero_cnaps}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Numéro Banque</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="numero_banque"
                                    value={formData.numero_banque}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Nom Banque</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="nom_banque"
                                    value={formData.nom_banque}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Adresse Banque</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="adresse_banque"
                                    value={formData.adresse_banque}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Code Postal Banque</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="cp_banque"
                                    value={formData.cp_banque}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Ville Banque</label>
                                <div class="col-sm-10">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="ville_banque"
                                    value={formData.ville_banque}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <div className="col-sm-10 offset-sm-2">
                                  <button type="submit" className="btn btn-primary">
                                    Créer
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
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
    </>
  );
}

export default CreateSociete;
