import React from "react";
import { Link } from "react-router-dom";

function Topbar() {
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
    <nav className="navbar header-navbar pcoded-header">
      <div className="navbar-wrapper">
        <div className="navbar-logo">
          <a className="mobile-menu" id="mobile-collapse" href="#!">
            <i className="ti-menu"></i>
          </a>
          <a className="mobile-search morphsearch-search" href="#">
            <i className="ti-search"></i>
          </a>
          <Link to="/">
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
              <a href="#!" onClick={toggleFullScreen}>
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
                  <a href="#">
                    <i className="ti-user"></i> Profile
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="ti-email"></i> My Messages
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="ti-lock"></i> Lock Screen
                  </a>
                </li>
                <li>
                  <Link to="/auth-signin">
                    <i className="ti-layout-sidebar-left"></i> Logout
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Topbar;
