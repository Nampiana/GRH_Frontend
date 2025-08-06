import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useTemplateScripts from "../utils/useTemplateScripts";

function Sidebar() {
  useTemplateScripts();
  const { logout } = useContext(AuthContext);

  const [user, setUser] = useState({ nom: "", prenom: "", role: null });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("itoooooooooooo", userData);

    if (userData) {
      setUser({
        nom: userData.username,
        role: userData.roles
      });
    }
  }, []);

  return (
    <nav className="pcoded-navbar">
      <div className="sidebar_toggle">
        <a href="#"><i className="icon-close icons"></i></a>
      </div>
      <div className="pcoded-inner-navbar main-menu">
        <div>
          <div className="main-menu-header">
            <img
              className="img-40 img-radius"
              src="assets/images/avatar-4.jpg"
              alt="User-Profile-Image"
            />
            <div className="user-details">
              <span>{user.nom}</span>
              <span id="more-details">
                UX Designer <i className="ti-angle-down"></i>
              </span>
            </div>
          </div>

          <div className="main-menu-content">
            <ul>
              <li className="more-details">
                <Link to="#"><i className="ti-user"></i>View Profile</Link>
                <Link to="#"><i className="ti-settings"></i>Settings</Link>
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault(); // empêche la navigation inutile
                    logout();           // appelle ta fonction logout
                  }}
                >
                  <i className="ti-layout-sidebar-left"></i>Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pcoded-search">
          <span className="searchbar-toggle"></span>
          <div className="pcoded-search-box">
            <input type="text" placeholder="Search" />
            <span className="search-icon">
              <i className="ti-search" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        <div className="pcoded-navigatio-lavel" data-i18n="nav.category.navigation">
          Layout
        </div>
        <ul className="pcoded-item pcoded-left-item">
          {user.role === 1 && (
            <>
              <li>
                <Link to="/societe">
                  <i className="ti-briefcase me-2" style={{ color: "#007bff" }}></i> Sociète
                </Link>
              </li>
              <li>
                <Link to="/departement">
                  <i className="ti-layers-alt me-2" style={{ color: "#28a745" }}></i> Département
                </Link>
              </li>
              <li>
                <Link to="/service">
                  <i className="ti-agenda me-2" style={{ color: "#17a2b8" }}></i> Services
                </Link>
              </li>
              <li>
                <Link to="/poste">
                  <i className="ti-id-badge me-2" style={{ color: "#ffc107" }}></i> Poste
                </Link>
              </li>
              <li>
                <Link to="/categorie">
                  <i className="ti-tag me-2" style={{ color: "#fd7e14" }}></i> Categorie
                </Link>
              </li>
              <li>
                <Link to="/employerSociete">
                  <i className="ti-user me-2" style={{ color: "#6f42c1" }}></i> Employer
                </Link>
              </li>
              <li>
                <Link to="/pointage">
                  <i className="ti-time me-2" style={{ color: "#dc3545" }}></i> Pointage
                </Link>
              </li>

            </>
          )}

          {user.role === 2 && (
            <>
              <li>
                <Link to="/departement">
                  <i className="ti-layers-alt me-2" style={{ color: "#28a745" }}></i> Département
                </Link>
              </li>
              <li>
                <Link to="/service">
                  <i className="ti-agenda me-2" style={{ color: "#17a2b8" }}></i> Services
                </Link>
              </li>
              <li>
                <Link to="/poste">
                  <i className="ti-id-badge me-2" style={{ color: "#ffc107" }}></i> Poste
                </Link>
              </li>
              <li>
                <Link to="/categorie">
                  <i className="ti-tag me-2" style={{ color: "#fd7e14" }}></i> Categorie
                </Link>
              </li>
              <li>
                <Link to="/employerSociete">
                  <i className="ti-user me-2" style={{ color: "#6f42c1" }}></i> Employer
                </Link>
              </li>
              <li>
                <Link to="/pointage">
                  <i className="ti-time me-2" style={{ color: "#dc3545" }}></i> Pointage
                </Link>
              </li>
              <li>
                <Link to="/conge">
                  <i className="ti-calendar me-2" style={{ color: "#35dcc6ff" }}></i> Congé
                </Link>
              </li>
            </>
          )}

          {user.role === 3 && (
            <>
              <li>
                <Link to="/pointage">
                  <i className="ti-time me-2" style={{ color: "#dc3545" }}></i> Pointage
                </Link>
              </li>
              <li>
                <Link to="/conge">
                  <i className="ti-calendar me-2" style={{ color: "#35dcc6ff" }}></i> Congé
                </Link>
              </li>
            </>
          )}
        </ul>

      </div>
    </nav>
  );
}

export default Sidebar;
