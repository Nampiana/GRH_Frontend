import React, { useContext, useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useTemplateScripts from "../utils/useTemplateScripts";

function Sidebar() {
  useTemplateScripts();
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const [user, setUser] = useState({ nom: "", prenom: "", role: null });
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({
        nom: userData.username,
        role: userData.roles
      });
    }
  }, []);

  // état d'ouverture/fermeture des groupes
  const [open, setOpen] = useState({
    organisation: true,
    rh: true,
    paie_param: true,
    paie_exec: true,
    espace: true,
  });
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  // couleurs d’accent par groupe
  const ACCENT = {
    organisation: "#4f46e5", // indigo
    rh: "#0ea5e9",            // sky
    paie_param: "#16a34a",    // green
    paie_exec: "#f59e0b",     // amber
    espace: "#f97316",        // orange
  };

  const isActive = (path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase());

  // Icônes & couleurs cohérentes par item
  // (on ne change PAS les routes ni la structure, seulement icône/couleur)
  const groups = useMemo(() => {
    if (user.role === 1) {
      return [
        {
          key: "organisation",
          label: "Organisation",
          accent: ACCENT.organisation,
          items: [
            { to: "/societe", icon: "ti-briefcase", label: "Sociète", color: "#4f46e5" }, // blue-600
            { to: "/departement", icon: "ti-layout-grid2", label: "Département", color: "#4f46e5" }, // green-600
            { to: "/service", icon: "ti-agenda", label: "Services", color: "#4f46e5" }, // cyan-600
            { to: "/poste", icon: "ti-id-badge", label: "Poste", color: "#4f46e5" }, // amber-600
            { to: "/categorie", icon: "ti-tag", label: "Categorie", color: "#4f46e5" }, // orange-600
            { to: "/employerSociete", icon: "ti-user", label: "Employer", color: "#4f46e5" }, // violet-600
            { to: "/pointage", icon: "ti-timer", label: "Pointage", color: "#4f46e5" }, // red-600
          ],
        },
        {
          key: "paie_param",
          label: "Paie — Paramétrage",
          accent: ACCENT.paie_param,
          items: [
            { to: "/parametreGenereaux", icon: "ti-settings", label: "parametre Genereaux", color: "#16a34a" }, // green-600
            { to: "/rubriquePaie", icon: "ti-list", label: "Rubrique Paie", color: "#16a34a" },
            { to: "/rubriqueCategorie", icon: "ti-bookmark", label: "Rubrique Categorie", color: "#16a34a" },
          ],
        },
      ];
    }

    if (user.role === 2) {
      return [
        {
          key: "organisation",
          label: "Organisation",
          accent: ACCENT.organisation,
          items: [
            { to: "/departement", icon: "ti-layout-grid2", label: "Département", color: "#4f46e5" },
            { to: "/service", icon: "ti-agenda", label: "Services", color: "#4f46e5" },
            { to: "/poste", icon: "ti-id-badge", label: "Poste", color: "#4f46e5" },
            { to: "/categorie", icon: "ti-tag", label: "Categorie", color: "#4f46e5" },
            { to: "/employerSociete", icon: "ti-user", label: "Employer", color: "#4f46e5" },
          ],
        },
        {
          key: "rh",
          label: "Ressources humaines",
          accent: ACCENT.rh,
          items: [
            { to: "/pointage", icon: "ti-timer", label: "Pointage", color: "#0ea5e9" },
            { to: "/conge", icon: "ti-calendar", label: "Congé", color: "#0ea5e9" }, // sky-600
            { to: "/contrat", icon: "ti-clipboard", label: "Contrat", color: "#0ea5e9" }, // green-500
            { to: "/sanction", icon: "ti-flag", label: "Sanction", color: "#0ea5e9" }, // rose-600
          ],
        },
        {
          key: "paie_param",
          label: "Paie — Paramétrage",
          accent: ACCENT.paie_param,
          items: [
            { to: "/parametreGenereaux", icon: "ti-settings", label: "parametre Genereaux", color: "#16a34a" },
            { to: "/rubriquePaie", icon: "ti-list", label: "Rubrique Paie", color: "#16a34a" },
            { to: "/rubriqueCategorie", icon: "ti-bookmark", label: "Rubrique Categorie", color: "#16a34a" },
          ],
        },
        {
          key: "paie_exec",
          label: "Paie — Exécution",
          accent: ACCENT.paie_exec,
          items: [
            { to: "/Paie", icon: "ti-calculator", label: "Paie", color: "#f59e0b" }, // amber-500
            { to: "/moispaie", icon: "ti-calendar", label: "Mois Paie", color: "#f59e0b" },
            { to: "/bulletin", icon: "ti-receipt", label: "Bulletin de paie", color: "#f59e0b" },
          ],
        },
      ];
    }

    if (user.role === 3) {
      return [
        {
          key: "espace",
          label: "Mon espace",
          accent: ACCENT.espace,
          items: [
            { to: "/pointage", icon: "ti-timer", label: "Pointage", color: "#f97316" },
            { to: "/conge", icon: "ti-calendar", label: "Congé", color: "#f97316" },
            { to: "/MonContrat", icon: "ti-clipboard", label: "Contrat", color: "#f97316" },
            { to: "/sanction", icon: "ti-flag", label: "Sanction", color: "#f97316" },
            { to: "/mesbulletin", icon: "ti-receipt", label: "Mes bulletins", color: "#f97316" },
          ],
        },
      ];
    }

    return [];
  }, [user.role]);

  return (
    <nav className="pcoded-navbar">
      {/* Styles additionnels (icône + couleur + espacement) */}
      <style>{`
        .group-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 14px; margin:10px 10px 6px; border-radius:12px;
          background: linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,0));
          cursor:pointer; transition: background .2s ease, transform .12s ease, box-shadow .2s ease;
          border-left: 4px solid transparent;
        }
        .group-header:hover { background: rgba(0,0,0,.06); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.05); }
        .group-left { display:flex; align-items:center; gap:10px; font-weight:600; }
        .group-dot { width:10px; height:10px; border-radius:50%; box-shadow:0 0 0 4px rgba(0,0,0,.04); }
        .chevron { transition: transform .22s ease; }
        .chevron.open { transform: rotate(180deg); }

        .collapsible { overflow:hidden; transition:max-height .28s ease, opacity .18s ease; opacity:1; }
        .collapsible.closed { max-height:0; opacity:0; }

        .pcoded-item li a {
          display:flex; align-items:center; gap:12px;  /* <- plus d'espace icône/texte */
          border-radius:10px;
          padding:8px 12px; margin:2px 8px; transition: background .15s ease, transform .12s ease;
        }
        .pcoded-item li a i { font-size: 1.05rem; opacity: .95; } /* icône un peu plus grande */
        .pcoded-item li a:hover { background: rgba(0,0,0,.04); transform: translateX(2px); }
        .pcoded-item li.active > a { background: rgba(79,70,229,.10); font-weight:600; }
      `}</style>

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
                    e.preventDefault();
                    logout();
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

        {/* on garde TA UL, mêmes groupes repliables, juste nouvelles icônes/couleurs/espacement */}
        <ul className="pcoded-item pcoded-left-item">
          {groups.map(g => {
            const isOpen = !!open[g.key];
            return (
              <li key={g.key} style={{ listStyle: "none", width: "100%" }}>
                <div
                  className="group-header"
                  onClick={() => toggle(g.key)}
                  style={{ borderLeftColor: g.accent }}
                >
                  <div className="group-left">
                    <span className="group-dot" style={{ background: g.accent }} />
                    <span>{g.label}</span>
                  </div>
                  <i className={`ti-angle-down chevron ${isOpen ? "open" : ""}`} style={{ color: g.accent }} />
                </div>

                <ul className={`pcoded-item pcoded-left-item collapsible ${isOpen ? "" : "closed"}`} style={{ maxHeight: isOpen ? "800px" : "0" }}>
                  {g.items.map((it) => (
                    <li key={it.to} className={isActive(it.to) ? "active" : ""}>
                      <Link to={it.to}>
                        <i className={`${it.icon}`} style={{ color: it.color }}></i>
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

      </div>
    </nav>
  );
}

export default Sidebar;
