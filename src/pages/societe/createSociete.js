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
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

     const handleSubmit = (e) => {
  e.preventDefault();

  const dataToSend = {
    nom_societe: formData.nom_societe,
  };

  createSociete(dataToSend, () => {
    setFormData({ nom_societe: "" });
    setSuccessMessage("Société enregistrée avec succès ✅");

    // Masquer automatiquement après 3 secondes
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
