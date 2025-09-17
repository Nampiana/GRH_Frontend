import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

// Hooks et services réutilisés
import useRubriquePaie from "../../hook/rubriquePaie/useRubriquePaie";
import useSociete from "../../hook/societe/societeHook";
import ParametreGenereauxService from "../../services/parametreGenereaux/parametreGenereauxService";

// Icônes et notifications
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faPlus,
  faEdit,
  faTrash,
  faBuilding,
  faTimes,
  faSave,
  faWarning,
  faExternalLinkAlt,
  faCheck,
  faMinus,
  faPlus as faPlusIcon,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RubriquePaie() {
  useTemplateScripts();

  const [user, setUser] = useState({ roles: 1, societe: "" });
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u) setUser({ roles: u.roles, societe: u.societe });
  }, []);

  const {
    rubriques,
    loading,
    errorMsg,
    setErrorMsg,
    createRubrique,
    updateRubrique,
    deleteRubrique,
  } = useRubriquePaie();

  const { societe: societes, fetchSociete } = useSociete();
  useEffect(() => {
    fetchSociete();
  }, [fetchSociete]);

  const [params, setParams] = useState([]);
  useEffect(() => {
    ParametreGenereauxService.getAll()
      .then((res) => setParams(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Erreur de chargement des paramètres :", err);
        toast.error("Échec du chargement des paramètres généraux.");
      });
  }, []);

  const societeOptions = useMemo(() => {
    if (user.roles === 2) {
      const mine = societes.filter((s) => s.id === user.societe);
      if (mine.length === 0 && user.societe) {
        // Fallback si la société de l'utilisateur n'est pas dans la liste
        return [{ id: user.societe, nomSociete: "Mon entreprise" }];
      }
      return mine;
    }
    return societes;
  }, [societes, user]);

  const labelSociete = (id) =>
    (societes.find((s) => s.id === id) || societeOptions.find((s) => s.id === id))?.nomSociete || "N/A";

  const paramsBySociete = (idSociete) =>
    params.filter((p) => p.idSociete === idSociete);
  const findParam = (id) => params.find((p) => p.id === id);

  const [societeFilter, setSocieteFilter] = useState("");
  const rows = useMemo(() => {
    return (rubriques || []).filter((r) => {
      if (user.roles === 2 && r.idSociete !== user.societe) return false;
      if (user.roles === 1 && societeFilter && r.idSociete !== societeFilter)
        return false;
      return true;
    });
  }, [rubriques, user, societeFilter]);

  // --- Gestion des modales et du formulaire ---
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const [code, setCode] = useState("");
  const [nomRubrique, setNomRubrique] = useState("");
  const [typeRubrique, setTypeRubrique] = useState("");
  const [operation, setOperation] = useState(1);
  const [imposable, setImposable] = useState(true);
  const [idSociete, setIdSociete] = useState("");
  const [idParametreGenereaux, setIdParametreGenereaux] = useState("");

  useEffect(() => {
    if (user.roles === 2) setIdSociete(user.societe || "");
  }, [user]);
  useEffect(() => {
    setIdParametreGenereaux("");
  }, [idSociete]);

  const resetForm = () => {
    setSelected(null);
    setCode("");
    setNomRubrique("");
    setTypeRubrique("");
    setOperation(1);
    setImposable(true);
    setIdSociete(user.roles === 2 ? user.societe || "" : "");
    setIdParametreGenereaux("");
    setErrorMsg("");
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };
  const openEdit = (r) => {
    setSelected(r);
    setCode(r.code || "");
    setNomRubrique(r.nomRubrique || "");
    setTypeRubrique(r.typeRubrique || "");
    setOperation(typeof r.operation === "number" ? r.operation : 1);
    setImposable(!!r.imposable);
    setIdSociete(r.idSociete || (user.roles === 2 ? user.societe || "" : ""));
    setIdParametreGenereaux(r.idParametreGenereaux || "");
    setErrorMsg("");
    setShowModal(true);
  };
  const openDelete = (r) => {
    setSelected(r);
    setShowDelete(true);
  };
  const confirmDelete = () => {
    if (!selected) return;
    deleteRubrique(selected.id, () => {
      toast.info("Rubrique supprimée avec succès.");
      setShowDelete(false);
      setSelected(null);
    });
  };

  const formValid = useMemo(() => {
    if (!code.trim() || !nomRubrique.trim() || !idSociete) return false;
    if (idParametreGenereaux) {
      const p = findParam(idParametreGenereaux);
      if (!p || p.idSociete !== idSociete) return false;
    }
    return true;
  }, [code, nomRubrique, idSociete, idParametreGenereaux]);

  const handleSave = () => {
    const payload = {
      code: code.trim().toUpperCase(),
      nomRubrique: nomRubrique.trim(),
      typeRubrique: typeRubrique || null,
      operation: Number(operation),
      imposable: !!imposable,
      idSociete,
      idParametreGenereaux: idParametreGenereaux || null,
    };

    if (selected) {
      updateRubrique(selected.id, payload, () => {
        toast.success("Rubrique modifiée avec succès !");
        setShowModal(false);
        resetForm();
      });
    } else {
      createRubrique(payload, () => {
        toast.success("Nouvelle rubrique créée !");
        setShowModal(false);
        resetForm();
      });
    }
  };

  // --- Fonctions d'affichage des labels ---
  const isSB = (r) => (r.code || "").toUpperCase() === "SB";

  const getOperationLabel = (op) =>
    op === 1 ? (
      <span className="badge bg-success me-2">+</span>
    ) : (
      <span className="badge bg-danger me-2">-</span>
    );
  const getImposableLabel = (imp) =>
    imp ? (
      <span className="badge bg-success">Oui</span>
    ) : (
      <span className="badge bg-secondary">Non</span>
    );
  const getModeLabel = (param) =>
    param ? (
      <span className="badge bg-primary">Paramètre</span>
    ) : (
      <span className="badge bg-info">Manuel</span>
    );

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content px-4">
              <div className="page-wrapper pt-4">
                <div className="page-body">
                  <h4 className="mb-4 text-primary fw-bold">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Rubriques de Paie
                  </h4>
                  <ToastContainer position="top-right" autoClose={2000} />

                  <div className="card shadow-sm border-0 rounded-3 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Liste des rubriques
                      </h5>
                      <button className="btn btn-primary btn-sm" onClick={openCreate}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Nouvelle rubrique
                      </button>
                    </div>
                    <hr className="mb-4" />

                    {user.roles === 1 && (
                      <div className="mb-4">
                        <label className="form-label text-muted">Filtrer par Société :</label>
                        <select className="form-control" value={societeFilter} onChange={(e) => setSocieteFilter(e.target.value)}>
                          <option value="">Toutes les sociétés</option>
                          {societeOptions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nomSociete}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

                    {loading ? (
                      <div className="text-center text-muted py-5">
                        <p>Chargement en cours...</p>
                      </div>
                    ) : rows.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <p>Aucune rubrique enregistrée.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Code & Nom</th>
                              <th>Type</th>
                              <th>Opération</th>
                              <th>Imposable</th>
                              <th>Mode</th>
                              <th>Paramètre</th>
                              <th>Société</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r, i) => {
                              const param = r.idParametreGenereaux ? findParam(r.idParametreGenereaux) : null;
                              return (
                                <tr key={r.id}>
                                  <td>{i + 1}</td>
                                  <td>
                                    <strong>{r.code}</strong>
                                    <br />
                                    <small className="text-muted">{r.nomRubrique}</small>
                                  </td>
                                  <td>{r.typeRubrique || "—"}</td>
                                  <td>
                                    {getOperationLabel(r.operation)}
                                  </td>
                                  <td>
                                    {getImposableLabel(r.imposable)}
                                  </td>
                                  <td>
                                    {getModeLabel(param)}
                                  </td>
                                  <td>
                                    {param ? `${param.nomParametre} (${param.pourcentage}%)` : "—"}
                                  </td>
                                  <td>
                                    <FontAwesomeIcon icon={faBuilding} className="text-secondary me-2" />
                                    {labelSociete(r.idSociete)}
                                  </td>
                                  <td className="text-end">
                                    <button
                                      className="btn btn-warning btn-sm me-2"
                                      onClick={() => openEdit(r)}
                                      title="Modifier"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => openDelete(r)}
                                      title="Supprimer"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Création / Edition */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow rounded-3">
              <div className={`modal-header ${selected ? "bg-warning" : "bg-primary"} text-white p-3 rounded-top-3`}>
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={selected ? faEdit : faPlus} className="me-2" />
                  {selected ? "Modifier la rubrique" : "Créer une rubrique"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label text-muted">Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: SB, CNAPS, HS"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label text-muted">Nom de la rubrique</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Salaire de base"
                      value={nomRubrique}
                      onChange={(e) => setNomRubrique(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted">Type</label>
                    <select className="form-control" value={typeRubrique} onChange={(e) => setTypeRubrique(e.target.value)}>
                      <option value="">—</option>
                      <option value="I">I (Imposable)</option>
                      <option value="C">C (Cotisation)</option>
                      <option value="N">N (Non imposable)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted">Opération</label>
                    <select className="form-control" value={operation} onChange={(e) => setOperation(Number(e.target.value))}>
                      <option value={1}>+ (Crédit)</option>
                      <option value={0}>- (Débit)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted">Imposable</label>
                    <select className="form-control" value={imposable ? "1" : "0"} onChange={(e) => setImposable(e.target.value === "1")}>
                      <option value="1">Oui</option>
                      <option value="0">Non</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Société</label>
                    <select className="form-control" value={idSociete} onChange={(e) => setIdSociete(e.target.value)} disabled={user.roles === 2}>
                      <option value="">Sélectionner une société</option>
                      {societeOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nomSociete}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Paramètre généraux</label>
                    <select
                      className="form-control"
                      value={idParametreGenereaux}
                      onChange={(e) => setIdParametreGenereaux(e.target.value)}
                      disabled={!idSociete}
                    >
                      <option value="">— Aucun (manuel) —</option>
                      {paramsBySociete(idSociete).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nomParametre} — {p.pourcentage}%
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(code || "").toUpperCase() === "SB" && (
                  <div className="alert alert-info mt-3 py-2">
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="me-2" />
                    La **valeur** de SB provient du **contrat (Salaire de base)**, elle n'est pas saisie ici.
                  </div>
                )}

                {!idParametreGenereaux && (code || "").toUpperCase() !== "SB" && (
                  <div className="alert alert-info mt-3 py-2">
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="me-2" />
                    Cette rubrique aura une **valeur saisie manuellement** (PRIME, HS, AVANCE…).
                  </div>
                )}
              </div>
              <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!formValid}>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {selected ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDelete && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow rounded-3">
              <div className="modal-header bg-danger text-white p-3 rounded-top-3">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faWarning} className="me-2" /> Confirmer la suppression
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="fs-5">
                  Êtes-vous sûr de vouloir supprimer la rubrique : <br />
                  <strong className="text-danger">{selected?.code} — {selected?.nomRubrique}</strong> ?
                </p>
                <small className="text-muted">Cette action est irréversible.</small>
              </div>
              <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-center">
                <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>
                  <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  <FontAwesomeIcon icon={faTrash} className="me-2" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RubriquePaie;