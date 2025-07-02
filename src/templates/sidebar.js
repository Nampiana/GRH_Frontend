import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function Sidebar() {
  const { logout } = useContext(AuthContext);

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
              <span>John Doe</span>
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
          <li className="active">
            <Link to="/societe">
              <span className="pcoded-micon">
                <i className="ti-home"></i>
                <b>D</b>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.dash.main">
                Sociète
              </span>
              <span className="pcoded-mcaret"></span>
            </Link>
          </li>

          <li className="pcoded-hasmenu">
            <a href="javascript:void(0)">
              <span className="pcoded-micon">
                <i className="ti-layout-grid2-alt"></i>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.basic-components.main">
                Components
              </span>
              <span className="pcoded-mcaret"></span>
            </a>
            <ul className="pcoded-submenu">
              <li>
                <Link to="/accordion">
                  <span className="pcoded-micon">
                    <i className="ti-angle-right"></i>
                  </span>
                  <span className="pcoded-mtext" data-i18n="nav.basic-components.alert">
                    Accordion
                  </span>
                  <span className="pcoded-mcaret"></span>
                </Link>
              </li>
              <li>
                <Link to="/breadcrumb">
                  <span className="pcoded-micon">
                    <i className="ti-angle-right"></i>
                  </span>
                  <span className="pcoded-mtext" data-i18n="nav.basic-components.breadcrumbs">
                    Breadcrumbs
                  </span>
                  <span className="pcoded-mcaret"></span>
                </Link>
              </li>
              {/* Ajouter d'autres liens si nécessaire */}
            </ul>
          </li>
        </ul>

        <div className="pcoded-navigatio-lavel" data-i18n="nav.category.forms">
          Forms &amp; Tables
        </div>
        <ul className="pcoded-item pcoded-left-item">
          <li>
            <Link to="/form-elements-component">
              <span className="pcoded-micon">
                <i className="ti-layers"></i>
                <b>FC</b>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.form-components.main">
                Form Components
              </span>
              <span className="pcoded-mcaret"></span>
            </Link>
          </li>
          <li>
            <Link to="/bs-basic-table">
              <span className="pcoded-micon">
                <i className="ti-layers"></i>
                <b>FC</b>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.form-components.main">
                Basic Table
              </span>
              <span className="pcoded-mcaret"></span>
            </Link>
          </li>
        </ul>

        <div className="pcoded-navigatio-lavel" data-i18n="nav.category.forms">
          Chart &amp; Maps
        </div>
        <ul className="pcoded-item pcoded-left-item">
          <li>
            <Link to="/chart">
              <span className="pcoded-micon">
                <i className="ti-layers"></i>
                <b>FC</b>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.form-components.main">
                Chart
              </span>
              <span className="pcoded-mcaret"></span>
            </Link>
          </li>
          <li>
            <Link to="/map-google">
              <span className="pcoded-micon">
                <i className="ti-layers"></i>
                <b>FC</b>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.form-components.main">
                Maps
              </span>
              <span className="pcoded-mcaret"></span>
            </Link>
          </li>
        </ul>

        <div className="pcoded-navigatio-lavel" data-i18n="nav.category.other">
          Other
        </div>
        <ul className="pcoded-item pcoded-left-item">
          <li className="pcoded-hasmenu">
            <a href="javascript:void(0)">
              <span className="pcoded-micon">
                <i className="ti-direction-alt"></i>
                <b>M</b>
              </span>
              <span className="pcoded-mtext" data-i18n="nav.menu-levels.main">
                Menu Levels
              </span>
              <span className="pcoded-mcaret"></span>
            </a>
            <ul className="pcoded-submenu">
              <li>
                <a href="javascript:void(0)">
                  <span className="pcoded-micon">
                    <i className="ti-angle-right"></i>
                  </span>
                  <span className="pcoded-mtext" data-i18n="nav.menu-levels.menu-level-21">
                    Menu Level 2.1
                  </span>
                  <span className="pcoded-mcaret"></span>
                </a>
              </li>
              {/* Ajouter d'autres niveaux de menus ici */}
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Sidebar;
