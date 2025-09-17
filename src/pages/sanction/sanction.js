// src/pages/sanction/GestionSanction.js
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useSanction from "../../hook/sanction/useSanction";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faExclamationTriangle, faFileAlt, faCircleInfo, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function GestionSanction() {
  useTemplateScripts();

  const { sanctions, loading, createSanction, updateSanction, deleteSanction } = useSanction();

  const [user, setUser] = useState(null);
  const [idemployerSociete, setIdemployerSociete] = useState("");

  const [employers, setEmployers] = useState([]);
  const [individus, setIndividus] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);

  const initialForm = {
    idEmployer: "",
    typeSanction: "",
    motif: "",
    dateSanction: ""
  };
  const [form, setForm] = useState(initialForm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sanctionToDelete, setSanctionToDelete] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);

      EmployerSocieteService.getByUtilisateur(userData.idUtilisateur)
        .then((res) => {
          if (res.data) {
            setIdemployerSociete(res.data.id);
          }
        })
        .catch((err) => console.error(err));

      EmployerSocieteService.getAll().then((res) => setEmployers(res.data || []));
      IndividuService.getAll().then((res) => setIndividus(res.data || []));
    }
  }, []);

  const isRH = user?.roles === 2;
  const isEmploye = user?.roles === 3;

  const getNomCompletByEmployerSocieteId = (idEmployerSociete) => {
    const emp = employers.find((e) => e.id === idEmployerSociete);
    if (!emp) return "Employé inconnu";
    const individu = individus.find((i) => i.id === emp.idIndividue);
    if (!individu) return "Inconnu";
    return `${individu.nom} ${individu.prenom}`;
  };

  const visibleSanctions = isEmploye && idemployerSociete
    ? (sanctions || []).filter((s) => s.idEmployer === idemployerSociete)
    : (sanctions || []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const idEmployerFinal = isEmploye ? idemployerSociete : form.idEmployer;

    const payload = {
      ...form,
      idEmployer: idEmployerFinal,
      dateSanction: form.dateSanction ? new Date(form.dateSanction) : null
    };

    if (editMode) {
      updateSanction(editId, payload, () => {
        toast.success("✏️ Sanction modifiée avec succès !");
        resetFormAndState();
      });
    } else {
      createSanction(payload, () => {
        toast.success("✅ Sanction ajoutée avec succès !");
        resetFormAndState();
      });
    }
  };

  const resetFormAndState = () => {
    setForm(initialForm);
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (sanction) => {
    setForm({
      idEmployer: sanction.idEmployer || "",
      typeSanction: sanction.typeSanction || "",
      motif: sanction.motif || "",
      dateSanction: sanction.dateSanction ? sanction.dateSanction.split("T")[0] : ""
    });
    setEditMode(true);
    setEditId(sanction.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openDeleteModal = (sanction) => {
    setSanctionToDelete(sanction);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (sanctionToDelete) {
      deleteSanction(sanctionToDelete.id, () => {
        toast.info("🗑️ Sanction supprimée !");
        setShowDeleteModal(false);
      });
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

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
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Gestion des Sanctions
                  </h4>

                  <ToastContainer position="top-right" autoClose={2000} />

                  {/* Formulaire visible uniquement pour RH */}
                  {isRH && (
                    <div ref={formRef} className="card shadow-sm border-0 rounded-3 p-4 bg-light mb-4">
                      <h5 className="mb-3 text-primary">
                        <FontAwesomeIcon icon={editMode ? faEdit : faPlus} className="me-2" /> {editMode ? "Modifier une sanction" : "Ajouter une sanction"}
                      </h5>
                      <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label text-muted">Employé</label>
                          <select
                            className="form-control"
                            required
                            value={form.idEmployer}
                            onChange={(e) => setForm({ ...form, idEmployer: e.target.value })}
                          >
                            <option value="">-- Choisir un employé --</option>
                            {employers.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {getNomCompletByEmployerSocieteId(emp.id)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label text-muted">Type de sanction</label>
                          <select
                            className="form-control"
                            required
                            value={form.typeSanction}
                            onChange={(e) => setForm({ ...form, typeSanction: e.target.value })}
                          >
                            <option value="">-- Choisir type --</option>
                            <option value="1">Positive</option>
                            <option value="2">Négative</option>
                          </select>
                        </div>

                        <div className="col-md-12">
                          <label className="form-label text-muted">Motif</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            required
                            value={form.motif}
                            onChange={(e) => setForm({ ...form, motif: e.target.value })}
                            placeholder="Ex: Bon rendement / Retard répété / Manquement au règlement..."
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label text-muted">Date de la sanction</label>
                          <input
                            type="date"
                            className="form-control"
                            required
                            value={form.dateSanction}
                            onChange={(e) => setForm({ ...form, dateSanction: e.target.value })}
                          />
                        </div>

                        <div className="col-12 text-end">
                          <button type="submit" className="btn btn-primary">
                            <FontAwesomeIcon icon={faCircleCheck} className="me-2" /> Enregistrer
                          </button>
                          {editMode && (
                            <button type="button" className="btn btn-outline-secondary ms-2" onClick={resetFormAndState}>
                              Annuler
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Liste des sanctions */}
                  <div className="card shadow-sm border-0 rounded-3 p-4">
                    <h5 className="mb-4">
                      <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Liste des Sanctions
                    </h5>

                    {loading ? (
                      <div className="text-center text-muted py-5">
                        <p>Chargement...</p>
                      </div>
                    ) : visibleSanctions.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <p>Aucune sanction disponible.</p>
                      </div>
                    ) : (
                      <div className="row">
                        {visibleSanctions.map((s) => (
                          <div className="col-md-6 mb-4" key={s.id}>
                            <div className="card h-100 border-0 shadow-sm rounded-3">
                              <div className="card-body">
                                <h6 className="card-title text-primary fw-bold">
                                  {getNomCompletByEmployerSocieteId(s.idEmployer)}
                                </h6>
                                <hr className="mt-2 mb-3" />

                                <p className="mb-2">
                                  <strong><FontAwesomeIcon icon={faCircleInfo} className="me-2" />Type:</strong>{" "}
                                  <span className={`badge ${s.typeSanction === "1" ? "bg-success" : "bg-danger"} rounded-pill`}>
                                    {s.typeSanction === "1" ? "Positive" : "Négative"}
                                  </span>
                                </p>

                                <p className="mb-2">
                                  <strong><FontAwesomeIcon icon={faFileAlt} className="me-2" />Date:</strong> {formatDate(s.dateSanction)}
                                </p>

                                <p className="mb-4">
                                  <strong><FontAwesomeIcon icon={faFileAlt} className="me-2" />Motif:</strong> {s.motif}
                                </p>

                                {/* Actions visibles uniquement pour RH */}
                                {isRH && (
                                  <div className="d-flex justify-content-end">
                                    <button
                                      onClick={() => openDeleteModal(s)}
                                      className="btn btn-sm btn-outline-danger me-2"
                                      title="Supprimer"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(s)}
                                      className="btn btn-sm btn-outline-warning"
                                      title="Modifier"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow rounded-3">
              <div className="modal-header bg-danger text-white p-3 rounded-top-3">
                <h5 className="modal-title">Confirmation de suppression</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-danger me-3" />
                  <p className="mb-0">Êtes-vous sûr de vouloir supprimer cette sanction ? Cette action est irréversible.</p>
                </div>
              </div>
              <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-end">
                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionSanction;