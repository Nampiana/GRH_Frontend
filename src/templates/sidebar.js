import React, { useContext, useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useTemplateScripts from "../utils/useTemplateScripts";

// Importation des icônes Font Awesome pour un design plus moderne
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown, faUser, faBriefcase, faBuilding, faDiagramProject, faUserTie,
    faTag, faUsers, faClock, faCog, faList, faClipboardList, faCalculator,
    faCalendarDays, faFileInvoice, faChartPie, faSignOutAlt, faSearch
} from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';


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

    const [open, setOpen] = useState({
        organisation: true,
        rh: true,
        paie_param: true,
        paie_exec: true,
        espace: true,
        turnover: true,
    });
    const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

    const ACCENT = {
        organisation: "#4f46e5",
        rh: "#0ea5e9",
        paie_param: "#16a34a",
        paie_exec: "#f59e0b",
        espace: "#f97316",
        turnover: "#8b5cf6"
    };

    const isActive = (path) => location.pathname.toLowerCase().startsWith(path.toLowerCase());

    const groups = useMemo(() => {
        if (user.role === 1) {
            return [
                {
                    key: "organisation",
                    label: "Organisation",
                    accent: ACCENT.organisation,
                    icon: faBuilding, // Remplacement de l'icône de groupe
                    items: [
                        { to: "/societe", icon: faBriefcase, label: "Société" },
                        { to: "/departement", icon: faDiagramProject, label: "Département" },
                        { to: "/service", icon: faClipboardList, label: "Services" },
                        { to: "/poste", icon: faUserTie, label: "Poste" },
                        { to: "/categorie", icon: faTag, label: "Catégorie" },
                        { to: "/employerSociete", icon: faUsers, label: "Employés" },
                        { to: "/pointage", icon: faClock, label: "Pointage" },
                    ],
                },
                {
                    key: "paie_param",
                    label: "Paie - Paramétrage",
                    accent: ACCENT.paie_param,
                    icon: faCog,
                    items: [
                        { to: "/parametreGenereaux", icon: faCog, label: "Paramètres Généraux" },
                        { to: "/rubriquePaie", icon: faList, label: "Rubriques Paie" },
                        { to: "/rubriqueCategorie", icon: faFileAlt, label: "Rubriques Catégorie" },
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
                    icon: faBuilding,
                    items: [
                        { to: "/departement", icon: faDiagramProject, label: "Département" },
                        { to: "/service", icon: faClipboardList, label: "Services" },
                        { to: "/poste", icon: faUserTie, label: "Poste" },
                        { to: "/categorie", icon: faTag, label: "Catégorie" },
                        { to: "/employerSociete", icon: faUsers, label: "Employés" },
                    ],
                },
                {
                    key: "rh",
                    label: "Ressources Humaines",
                    accent: ACCENT.rh,
                    icon: faUsers,
                    items: [
                        { to: "/pointage", icon: faClock, label: "Pointage" },
                        { to: "/conge", icon: faCalendarDays, label: "Congé" },
                        { to: "/contrat", icon: faFileAlt, label: "Contrat" },
                        { to: "/sanction", icon: faFileInvoice, label: "Sanction" },
                    ],
                },
                {
                    key: "paie_param",
                    label: "Paie - Paramétrage",
                    accent: ACCENT.paie_param,
                    icon: faCog,
                    items: [
                        { to: "/parametreGenereaux", icon: faCog, label: "Paramètres Généraux" },
                        { to: "/rubriquePaie", icon: faList, label: "Rubriques Paie" },
                        { to: "/rubriqueCategorie", icon: faFileAlt, label: "Rubriques Catégorie" },
                    ],
                },
                {
                    key: "paie_exec",
                    label: "Paie - Exécution",
                    accent: ACCENT.paie_exec,
                    icon: faCalculator,
                    items: [
                        { to: "/Paie", icon: faCalculator, label: "Paie" },
                        { to: "/moispaie", icon: faCalendarDays, label: "Mois Paie" },
                        { to: "/bulletin", icon: faFileInvoice, label: "Bulletin de Paie" },
                    ],
                },
                {
                    key: "turnover",
                    label: "Turnover",
                    accent: ACCENT.turnover,
                    icon: faChartPie,
                    items: [
                        { to: "/turnover", icon: faChartPie, label: "Analyse Turnover" },
                        { to: "/turnover2", icon: faChartPie, label: "Analyse Turnover 2" },
                    ],
                },
            ];
        }

        if (user.role === 3) {
            return [
                {
                    key: "espace",
                    label: "Mon Espace",
                    accent: ACCENT.espace,
                    icon: faUser,
                    items: [
                        { to: "/pointage", icon: faClock, label: "Pointage" },
                        { to: "/conge", icon: faCalendarDays, label: "Congé" },
                        { to: "/MonContrat", icon: faFileAlt, label: "Contrat" },
                        { to: "/sanction", icon: faFileInvoice, label: "Sanction" },
                        { to: "/mesbulletin", icon: faFileInvoice, label: "Mes bulletins" },
                    ],
                },
            ];
        }

        return [];
    }, [user.role]);

    return (
        <nav className="pcoded-navbar">
            <style>{`
                /* Styles de base pour un look épuré */
                .pcoded-navbar {
                    background-color: #f8f9fa;
                    border-right: 1px solid #e2e8f0;
                    box-shadow: 0 0 15px rgba(0,0,0,0.05);
                }

                .pcoded-inner-navbar {
                    padding: 1.5rem 0.5rem;
                }

                /* Header de l'utilisateur */
                .main-menu-header {
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    margin-bottom: 1rem;
                }
                .main-menu-header img {
                    border-radius: 50%;
                    border: 2px solid #6366f1;
                    padding: 2px;
                }
                .user-details span {
                    display: block;
                    font-weight: 600;
                    color: #1a202c;
                }
                .user-details #more-details {
                    font-size: 0.8rem;
                    color: #718096;
                    font-weight: normal;
                }

                /* Groupes de liens */
                .group-container {
                    padding: 0 0.5rem;
                    margin-bottom: 1.5rem;
                }
                .group-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    margin: 0.5rem 0;
                    border-radius: 12px;
                    background-color: #eef2ff; /* Fond plus doux */
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-left: 5px solid transparent;
                }
                .group-header:hover {
                    background-color: #e0e7ff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                }
                .group-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    color: #434190;
                }
                .chevron {
                    transition: transform 0.22s ease;
                    color: #6366f1;
                }
                .chevron.open {
                    transform: rotate(180deg);
                }
                .group-icon {
                    font-size: 1.25rem;
                }

                /* Liens individuels */
                .collapsible {
                    overflow: hidden;
                    transition: max-height 0.3s ease, opacity 0.3s ease;
                    opacity: 1;
                    padding-left: 0.5rem;
                }
                .collapsible.closed {
                    max-height: 0 !important;
                    opacity: 0;
                }
                .pcoded-item li a {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin: 4px 0;
                    transition: background-color 0.2s ease;
                    color: #4a5568;
                }
                .pcoded-item li a:hover {
                    background-color: #edf2f7;
                    color: #1a202c;
                }
                .pcoded-item li.active > a {
                    background-color: rgba(79, 70, 229, 0.1);
                    color: #4f46e5;
                    font-weight: 600;
                }
                .item-icon {
                    width: 20px;
                    text-align: center;
                }
            `}</style>

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
                                {user.role === 1 ? 'Administrateur' : user.role === 2 ? 'Manager RH' : 'Employé'}
                            </span>
                        </div>
                    </div>

                    <div className="main-menu-content">
                        <ul>
                            <li className="more-details">
                                <Link to="#">
                                    <FontAwesomeIcon icon={faUser} /> &nbsp; Voir Profil
                                </Link>
                                <Link to="#">
                                    <FontAwesomeIcon icon={faCog} /> &nbsp; Paramètres
                                </Link>
                                <Link
                                    to="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        logout();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} /> &nbsp; Déconnexion
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pcoded-search">
                    <span className="searchbar-toggle"></span>
                    <div className="pcoded-search-box">
                        <input type="text" placeholder="Rechercher..." />
                        <span className="search-icon">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                    </div>
                </div>

                {groups.map(g => {
                    const isOpen = !!open[g.key];
                    const activeItemInGroup = g.items.some(item => isActive(item.to));

                    return (
                        <div key={g.key} className="group-container">
                            <div
                                className="group-header"
                                onClick={() => toggle(g.key)}
                                style={{
                                    borderLeftColor: g.accent,
                                    backgroundColor: activeItemInGroup ? '#eef2ff' : '#f8f9fa'
                                }}
                            >
                                <div className="group-left" style={{ color: g.accent }}>
                                    <FontAwesomeIcon icon={g.icon} className="group-icon" />
                                    <span>{g.label}</span>
                                </div>
                                <FontAwesomeIcon
                                    icon={faAngleDown}
                                    className={`chevron ${isOpen ? "open" : ""}`}
                                    style={{ color: g.accent }}
                                />
                            </div>

                            <ul className={`pcoded-item collapsible ${isOpen ? "" : "closed"}`}
                                style={{ maxHeight: isOpen ? "800px" : "0" }}>
                                {g.items.map((it) => (
                                    <li key={it.to} className={isActive(it.to) ? "active" : ""}>
                                        <Link to={it.to}>
                                            <FontAwesomeIcon icon={it.icon} className="item-icon" />
                                            <span>{it.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}

export default Sidebar;