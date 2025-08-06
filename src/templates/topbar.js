import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useTemplateScripts from "../utils/useTemplateScripts";

function Topbar() {
  useTemplateScripts();
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  // Fonction pour la gestion du plein écran (exemple)
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (

    <>
      <nav className="navbar header-navbar pcoded-header">
        <div className="navbar-wrapper">
          <div className="navbar-logo">
            <a className="mobile-menu" id="mobile-collapse" >
              <i className="ti-menu"></i>
            </a>
            <a className="mobile-search morphsearch-search" href="#">
              <i className="ti-search"></i>
            </a>
            <Link to="/societe">
              <img className="img-fluid" src="assets/images/logo.png" alt="Theme-Logo" />
            </Link>
            <a className="mobile-options">
              <i className="ti-more"></i>
            </a>
          </div>

          <div className="navbar-container container-fluid">
            <ul className="nav-left">
              <li>
                <div className="sidebar_toggle">
                  <a href="javascript:void(0)">
                    <i className="ti-menu"></i>
                  </a>
                </div>
              </li>

              <li>
                <a onClick={toggleFullScreen}>
                  <i className="ti-fullscreen"></i>
                </a>
              </li>
            </ul>

            <ul className="nav-right">
              <li className="header-notification">
                <a href="#!">
                  <i className="ti-bell"></i>
                  <span className="badge bg-c-pink"></span>
                </a>
                <ul className="show-notification">
                  <li>
                    <h6>Notifications</h6>
                    <label className="label label-danger">New</label>
                  </li>
                  <li>
                    <div className="media">
                      <img
                        className="d-flex align-self-center img-radius"
                        src="assets/images/avatar-4.jpg"
                        alt="Generic placeholder image"
                      />
                      <div className="media-body">
                        <h5 className="notification-user">John Doe</h5>
                        <p className="notification-msg">Lorem ipsum dolor sit amet, consectetuer elit.</p>
                        <span className="notification-time">30 minutes ago</span>
                      </div>
                    </div>
                  </li>
                  {/* Autres notifications */}
                </ul>
              </li>

              <li className="user-profile header-notification">
                <a href="#!">
                  <img src="assets/images/avatar-4.jpg" className="img-radius" alt="User-Profile-Image" />
                  <span>John Doe</span>
                  <i className="ti-angle-down"></i>
                </a>
                <ul className="show-notification profile-notification">
                  <li>
                    <a href="#!">
                      <i className="ti-settings"></i> Settings
                    </a>
                  </li>
                  <li>
                    <a href="/profil">
                      <i className="ti-user"></i> Profile
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLogoutModal(true); // 👉 afficher le modal
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <i className="ti-layout-sidebar-left"></i> Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="icofont icofont-warning-alt mr-2"></i>
                  Confirmer la déconnexion
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={() => setShowLogoutModal(false)}
                  style={{ opacity: 1 }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body text-center"
                style={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                  padding: "20px",
                }}
              >
                <p className="lead mb-0">Êtes-vous sûr de vouloir vous déconnecter ?</p>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowLogoutModal(false)}
                >
                  <i className="icofont icofont-close-circled"></i> Annuler
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    logout();
                  }}
                >
                  <i className="icofont icofont-logout"></i> Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
}

export default Topbar;
