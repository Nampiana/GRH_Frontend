import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useParametreGenereaux from "../../hook/parametreGenereaux/useParametreGenereaux";
import useSociete from "../../hook/societe/societeHook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCog,
  faBuilding,
  faPercent,
  faWarning,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ParametreGenereaux() {
  useTemplateScripts();

  const [user, setUser] = useState({ roles: 1, societe: "" });
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u) setUser({ roles: u.roles, societe: u.societe });
  }, []);

  const {
    parametres,
    loading,
    createParametre,
    updateParametre,
    deleteParametre,
  } = useParametreGenereaux();

  const { societe: societes, fetchSociete } = useSociete();

  useEffect(() => {
    fetchSociete();
  }, [fetchSociete]);

  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [nomParametre, setNomParametre] = useState("");
  const [idSociete, setIdSociete] = useState("");
  const [pourcentage, setPourcentage] = useState("");

  const [societeFilter, setSocieteFilter] = useState("");

  const societeOptions = useMemo(() => {
    if (user.roles === 2) {
      const mine = societes.filter((s) => s.id === user.societe);
      if (mine.length === 0 && user.societe) {
        return [{ id: user.societe, nomSociete: "Mon entreprise" }];
      }
      return mine;
    }
    return societes;
  }, [societes, user]);

  const labelSociete = (id) =>
    (societes.find((s) => s.id === id) || societeOptions.find((s) => s.id === id))?.nomSociete || "N/A";

  const resetForm = () => {
    setSelected(null);
    setNomParametre("");
    setIdSociete(user.roles === 2 ? user.societe || "" : "");
    setPourcentage("");
  };

  useEffect(() => {
    if (showModal && user.roles === 2) {
      setIdSociete(user.societe || "");
    }
  }, [showModal, user]);

  const handleCreateOrUpdate = () => {
    const payload = {
      nomParametre: nomParametre.trim(),
      idSociete: idSociete,
      pourcentage: pourcentage === "" ? null : Number(pourcentage),
    };

    if (!payload.nomParametre || !payload.idSociete || payload.pourcentage === null || isNaN(payload.pourcentage)) {
      toast.error("Veuillez remplir tous les champs correctement.");
      return;
    }

    if (selected) {
      updateParametre(selected.id, payload, () => {
        toast.success("Paramètre modifié avec succès !");
        setShowModal(false);
        resetForm();
      });
    } else {
      createParametre(payload, () => {
        toast.success("Nouveau paramètre créé !");
        setShowModal(false);
        resetForm();
      });
    }
  };

  const openEdit = (row) => {
    setSelected(row);
    setNomParametre(row.nomParametre || "");
    setIdSociete(row.idSociete || (user.roles === 2 ? user.societe || "" : ""));
    setPourcentage(row.pourcentage ?? "");
    setShowModal(true);
  };

  const openDelete = (row) => {
    setSelected(row);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (!selected) return;
    deleteParametre(selected.id, () => {
      toast.info("Paramètre supprimé.");
      setShowDelete(false);
      setSelected(null);
    });
  };

  const rows = useMemo(() => {
    return (parametres || []).filter((p) => {
      if (user.roles === 2 && p.idSociete !== user.societe) return false;
      if (user.roles === 1 && societeFilter && p.idSociete !== societeFilter)
        return false;
      return true;
    });
  }, [parametres, user, societeFilter]);

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
                    <FontAwesomeIcon icon={faCog} className="me-2" />
                    Paramètres Généraux
                  </h4>
                  <ToastContainer position="top-right" autoClose={2000} />

                  <div className="card shadow-sm border-0 rounded-3 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        <FontAwesomeIcon icon={faCog} className="me-2" /> Liste des paramètres
                      </h5>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          resetForm();
                          setShowModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Nouveau
                      </button>
                    </div>
                    <hr className="mb-4" />

                    {/* Filtre par société (admin) */}
                    {user.roles === 1 && (
                      <div className="mb-4">
                        <label className="form-label text-muted">Filtrer par Société :</label>
                        <select
                          className="form-control"
                          value={societeFilter}
                          onChange={(e) => setSocieteFilter(e.target.value)}
                        >
                          <option value="">Toutes les sociétés</option>
                          {societeOptions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nomSociete}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Table */}
                    {loading ? (
                      <div className="text-center text-muted py-5">
                        <p>Chargement en cours...</p>
                      </div>
                    ) : rows.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <p>Aucun paramètre enregistré.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Nom du paramètre</th>
                              <th>Société</th>
                              <th>Pourcentage</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((p, idx) => (
                              <tr key={p.id}>
                                <td>{idx + 1}</td>
                                <td>
                                  <FontAwesomeIcon icon={faCog} className="text-secondary me-2" />
                                  {p.nomParametre}
                                </td>
                                <td>
                                  <FontAwesomeIcon icon={faBuilding} className="text-secondary me-2" />
                                  {labelSociete(p.idSociete)}
                                </td>
                                <td>
                                  <FontAwesomeIcon icon={faPercent} className="text-secondary me-2" />
                                  {p.pourcentage != null ? `${p.pourcentage} %` : "—"}
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => openEdit(p)}
                                    title="Modifier"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => openDelete(p)}
                                    title="Supprimer"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
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

      {/* Modal création / édition */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow rounded-3">
              <div className={`modal-header ${selected ? "bg-warning" : "bg-primary"} text-white p-3 rounded-top-3`}>
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={selected ? faEdit : faPlus} className="me-2" />
                  {selected ? "Modifier Paramètre" : "Créer Paramètre"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label text-muted">Nom du paramètre</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: CNaPS"
                    value={nomParametre}
                    onChange={(e) => setNomParametre(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted">Société</label>
                  <select
                    className="form-control"
                    value={idSociete}
                    onChange={(e) => setIdSociete(e.target.value)}
                    disabled={user.roles === 2}
                  >
                    <option value="">Sélectionner une société</option>
                    {societeOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nomSociete}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted">Pourcentage (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 1 ou 5"
                    value={pourcentage}
                    onChange={(e) => setPourcentage(e.target.value)}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateOrUpdate}
                  disabled={
                    nomParametre.trim() === "" ||
                    idSociete === "" ||
                    pourcentage === "" ||
                    isNaN(Number(pourcentage))
                  }
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" /> {selected ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
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
                  Êtes-vous sûr de vouloir supprimer le paramètre : <br />
                  <strong className="text-danger">{selected?.nomParametre}</strong> ?
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

export default ParametreGenereaux;