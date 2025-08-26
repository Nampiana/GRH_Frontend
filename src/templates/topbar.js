import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useTemplateScripts from "../utils/useTemplateScripts";

import SanctionService from "../services/sanction/sanctionService";
import EmployerSocieteService from "../services/employerSociete/employerSocieteService";
import { ApiUrl } from "../utils/modules"; // ex: http://localhost:8080/api

const SANCTION_PAGE = "/sanction"; // ou "/sanctions" selon ta route

function Topbar() {
  useTemplateScripts();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- Notifications Sanctions ---
  const [user, setUser] = useState(null);
  const [myEmployerSocieteId, setMyEmployerSocieteId] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mySanctions, setMySanctions] = useState([]); // toutes mes sanctions
  const [unreadCount, setUnreadCount] = useState(0);
  const sseRef = useRef(null);

  // ✅ Clé de "vu" liée à l'EMPLOYER (stable au montage)
  const LAST_SEEN_KEY = myEmployerSocieteId ? `sanction_last_seen_emp_${myEmployerSocieteId}` : null;

  // plein écran
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  // Charger user + resolve idEmployerSociete
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;
    setUser(u);

    EmployerSocieteService.getByUtilisateur(u.idUtilisateur)
      .then((res) => {
        if (res?.data?.id) setMyEmployerSocieteId(res.data.id);
      })
      .catch(console.error);
  }, []);

  // ✅ Marquer toutes les sanctions comme vues (enregistré jusqu'à la plus récente)
  const markAllAsSeen = () => {
    if (!LAST_SEEN_KEY) return;
    const newest = mySanctions?.[0]?.dateSanction;
    const latestIso = newest ? new Date(newest).toISOString() : new Date().toISOString();
    localStorage.setItem(LAST_SEEN_KEY, latestIso);
    setUnreadCount(0);
  };

  // Fallback polling (30s)
  useEffect(() => {
    if (!myEmployerSocieteId || !LAST_SEEN_KEY) return;

    let isMounted = true;

    const fetchMine = () => {
      SanctionService.getAll()
        .then((res) => {
          const all = res.data || [];
          const mine = all
            .filter((s) => s.idEmployer === myEmployerSocieteId)
            .sort((a, b) => new Date(b.dateSanction) - new Date(a.dateSanction));

          if (isMounted) setMySanctions(mine);

          const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
          const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;

          const unread = mine.filter((s) => {
            const t = s.dateSanction ? new Date(s.dateSanction).getTime() : 0;
            return t > lastSeenTime;
          }).length;

          if (isMounted) setUnreadCount(unread);
        })
        .catch(console.error);
    };

    fetchMine();
    const id = setInterval(fetchMine, 30000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [myEmployerSocieteId, LAST_SEEN_KEY]);

  // SSE temps réel
  useEffect(() => {
    if (!myEmployerSocieteId) return;

    if (sseRef.current) {
      try { sseRef.current.close(); } catch (_) {}
      sseRef.current = null;
    }

    const es = new EventSource(`${ApiUrl}/sanction/stream/${myEmployerSocieteId}`, { withCredentials: true });
    sseRef.current = es;

    es.addEventListener("connected", () => {});

    es.addEventListener("sanction", (e) => {
      try {
        const data = JSON.parse(e.data);

        setMySanctions((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          if (data?.id && list.some((x) => x.id === data.id)) return list;
          return [data, ...list].sort((a, b) => new Date(b.dateSanction) - new Date(a.dateSanction));
        });

        const onSanctionPage = location.pathname.startsWith(SANCTION_PAGE);
        if (!notifOpen && !onSanctionPage) {
          setUnreadCount((c) => c + 1);
        } else if (onSanctionPage) {
          markAllAsSeen();
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    });

    es.onerror = () => {
      // auto-retry
    };

    return () => {
      try { es.close(); } catch (_) {}
      sseRef.current = null;
    };
  }, [myEmployerSocieteId, notifOpen, location.pathname]);

  // Marquer vu dès qu'on se trouve sur la page sanctions
  useEffect(() => {
    if (!LAST_SEEN_KEY) return;
    if (location.pathname.startsWith(SANCTION_PAGE) && mySanctions.length >= 0) {
      // >=0 pour marquer vu même si liste vide (évite badge résiduel)
      markAllAsSeen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, mySanctions.length, LAST_SEEN_KEY]);

  // open/close dropdown
  const toggleNotif = (e) => {
    e.preventDefault();
    const next = !notifOpen;
    setNotifOpen(next);
    if (!notifOpen) markAllAsSeen(); // ouvrir => vu
  };

  // format helpers
  const formatDate = (d) => (d ? new Date(d).toLocaleString("fr-FR") : "");

  // rendu d'une ligne notification sanction
  const renderSanctionNotif = (s, idx) => {
    const typeLabel = s.typeSanction === "1" ? "Sanction positive" : "Sanction négative";
    return (
      <li
        key={s.id || idx}
        onClick={() => { markAllAsSeen(); navigate(SANCTION_PAGE); }}
        style={{ cursor: "pointer" }}
      >
        <div className="media">
          <img className="d-flex align-self-center img-radius" src="assets/images/avatar-4.jpg" alt="avatar" />
          <div className="media-body">
            <h5 className="notification-user">{typeLabel}</h5>
            <p className="notification-msg">
              {s.motif?.length > 80 ? s.motif.slice(0, 80) + "…" : s.motif || "—"}
            </p>
            <span className="notification-time">{formatDate(s.dateSanction)}</span>
          </div>
        </div>
      </li>
    );
  };

  return (
    <>
      <nav className="navbar header-navbar pcoded-header">
        <div className="navbar-wrapper">
          <div className="navbar-logo">
            <a className="mobile-menu" id="mobile-collapse"><i className="ti-menu"></i></a>
            <a className="mobile-search morphsearch-search" href="#"><i className="ti-search"></i></a>
            <Link to="/societe"><img className="img-fluid" src="assets/images/logo.png" alt="Theme-Logo" /></Link>
            <a className="mobile-options"><i className="ti-more"></i></a>
          </div>

          <div className="navbar-container container-fluid">
            <ul className="nav-left">
              <li>
                <div className="sidebar_toggle"><a href="javascript:void(0)"><i className="ti-menu"></i></a></div>
              </li>
              <li><a onClick={toggleFullScreen}><i className="ti-fullscreen"></i></a></li>
            </ul>

            <ul className="nav-right">
              {/* ===== Notification Sanctions (employé uniquement) ===== */}
              {user?.roles === 3 && (
                <li className={`header-notification ${notifOpen ? "open" : ""}`}>
                  <a href="#!" onClick={toggleNotif}>
                    <i className="ti-bell"></i>
                    {unreadCount > 0 && <span className="badge bg-c-pink">{unreadCount}</span>}
                  </a>
                  {notifOpen && (
                    <ul className="show-notification" style={{ maxHeight: 360, overflowY: "auto" }}>
                      <li>
                        <h6>Notifications</h6>
                        {unreadCount > 0 && <label className="label label-danger">Nouveau</label>}
                      </li>

                      {mySanctions.length === 0 ? (
                        <li><div className="media"><div className="media-body">
                          <p className="notification-msg">Aucune sanction.</p>
                        </div></div></li>
                      ) : (
                        <>
                          {mySanctions.slice(0, 5).map(renderSanctionNotif)}
                          {mySanctions.length > 5 && (
                            <li onClick={() => { markAllAsSeen(); navigate(SANCTION_PAGE); }} style={{ cursor: "pointer" }}>
                              <div className="media"><div className="media-body">
                                <h6 className="notification-user">Voir toutes les sanctions</h6>
                              </div></div>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  )}
                </li>
              )}

              {/* ===== Profil / Logout ===== */}
              <li className="user-profile header-notification">
                <a href="#!">
                  <img src="assets/images/avatar-4.jpg" className="img-radius" alt="User-Profile-Image" />
                  <span>{user?.nom ? `${user.nom} ${user.prenom || ""}` : "John Doe"}</span>
                  <i className="ti-angle-down"></i>
                </a>
                <ul className="show-notification profile-notification">
                  <li><a href="/parametre"><i className="ti-settings"></i> Settings</a></li>
                  <li><a href="/profil"><i className="ti-user"></i> Profile</a></li>
                  <li>
                    <a href="#"
                       onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}
                       style={{ cursor: "pointer" }}>
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
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title"><i className="icofont icofont-warning-alt mr-2"></i>Confirmer la déconnexion</h5>
                <button type="button" className="close text-white" onClick={() => setShowLogoutModal(false)} style={{ opacity: 1 }}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body text-center" style={{ maxHeight: "60vh", overflowY: "auto", padding: "20px" }}>
                <p className="lead mb-0">Êtes-vous sûr de vouloir vous déconnecter ?</p>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowLogoutModal(false)}>
                  <i className="icofont icofont-close-circled"></i> Annuler
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => { logout(); }}>
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
