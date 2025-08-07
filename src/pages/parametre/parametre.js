import React, { useState, useEffect } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import ServiceIndividu from "../../services/individu/individuService";
import useTemplateScripts from "../../utils/useTemplateScripts";

function ChangePassword() {
  useTemplateScripts();

  const [user, setUser] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const clearMessage = () => {
    setTimeout(() => {
      setMessage("");
    }, 2000); // 2 secondes
  };

  const resetForm = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("❌ Tous les champs sont obligatoires.");
      clearMessage();
      return resetForm();
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Les nouveaux mots de passe ne correspondent pas.");
      clearMessage();
      return resetForm();
    }

    try {
      await ServiceIndividu.changePassword(user.idIndividu, {
        currentPassword: oldPassword,
        newPassword,
        confirmPassword,
      });

      setMessage("✅ Mot de passe modifié avec succès.");
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data || "Erreur inconnue.";
      setMessage(`❌ ${errorMsg}`);
      resetForm();
    } finally {
      clearMessage();
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
              <div className="main-body">
                <div className="page-wrapper">
                  <div className="page-body">
                    <div className="card shadow p-4 border-0 rounded-4">
                      <h4 className="mb-4 text-danger">
                        <i className="icofont-lock"></i> Modifier le mot de passe
                      </h4>

                      {message && (
                        <div className="alert alert-info">{message}</div>
                      )}

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label>Mot de passe actuel</label>
                          <input
                            type="password"
                            name="oldPassword"
                            className="form-control"
                            value={passwordData.oldPassword}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label>Nouveau mot de passe</label>
                          <input
                            type="password"
                            name="newPassword"
                            className="form-control"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label>Confirmer le nouveau mot de passe</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="text-end">
                        <button className="btn btn-danger" onClick={() => setShowConfirmModal(true)}>
                          🔁 Mettre à jour le mot de passe
                        </button>

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
      {showConfirmModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir modifier le mot de passe ?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-danger" onClick={() => {
                  handleSubmit();
                  setShowConfirmModal(false);
                }}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}

export default ChangePassword;
