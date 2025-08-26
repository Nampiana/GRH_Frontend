// src/pages/sanction/GestionSanction.js
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";

import useSanction from "../../hook/sanction/useSanction";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";

function GestionSanction() {
  useTemplateScripts();

  // Hooks sanction
  const { sanctions, loading, createSanction, updateSanction, deleteSanction } = useSanction();

  // Données utilisateur & rôles (même logique que votre page Pointage)
  const [user, setUser] = useState(null);
  const [idemployerSociete, setIdemployerSociete] = useState("");

  // Référentiels pour affichage des noms
  const [employers, setEmployers] = useState([]);
  const [individus, setIndividus] = useState([]);

  // UI
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);

  // Form
  const initialForm = {
    idEmployer: "",       // <- côté backend Sanction: idEmployer
    typeSanction: "",     // "1" (positive) | "2" (negative)
    motif: "",
    dateSanction: ""      // yyyy-mm-dd
  };
  const [form, setForm] = useState(initialForm);

  // Charger user + id employerSociete + référentiels
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);

      // Récupère l'idEmployerSociete de l'utilisateur connecté
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

  // Nom complet à partir de employerSociete.id
  const getNomCompletByEmployerSocieteId = (idEmployerSociete) => {
    const emp = employers.find((e) => e.id === idEmployerSociete);
    if (!emp) return "Employé inconnu";
    const individu = individus.find((i) => i.id === emp.idIndividue);
    if (!individu) return "Inconnu";
    return `${individu.nom} ${individu.prenom}`;
  };

  // Liste visible selon rôle (employé = uniquement ses sanctions)
  const visibleSanctions = isEmploye && idemployerSociete
    ? (sanctions || []).filter((s) => s.idEmployer === idemployerSociete)
    : (sanctions || []);

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Si employé, forcer son idEmployer (sécurité côté front, mais à valider au backend aussi)
    const idEmployerFinal = isEmploye ? idemployerSociete : form.idEmployer;

    const payload = {
      ...form,
      idEmployer: idEmployerFinal,
      // Pour Spring, une string "YYYY-MM-DD" est ok si vous mappez en Date; sinon:
      dateSanction: form.dateSanction ? new Date(form.dateSanction) : null
    };

    if (editMode) {
      updateSanction(editId, payload, () => {
        setSuccess("✏️ Sanction modifiée avec succès !");
        setTimeout(() => setSuccess(""), 2000);
        setForm(initialForm);
        setEditMode(false);
        setEditId(null);
      });
    } else {
      createSanction(payload, () => {
        setSuccess("✅ Sanction ajoutée avec succès !");
        setTimeout(() => setSuccess(""), 2000);
        setForm(initialForm);
      });
    }
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

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content">
              <div className="main-body">
                <div className="page-wrapper">
                  <div className="page-body">
                    <h4 className="mb-4 text-primary">
                      <i className="icofont-warning-alt"></i> Gestion des Sanctions
                    </h4>

                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Formulaire visible uniquement pour RH */}
                    {isRH && (
                      <div ref={formRef} className="card shadow-lg border-0 rounded-4 p-4 bg-light mb-4">
                        <h5 className="mb-3 text-primary">
                          {editMode ? "✏️ Modifier une sanction" : "➕ Ajouter une sanction"}
                        </h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                          <div className="col-md-6">
                            <label>Employé</label>
                            <select
                              className="form-control"
                              required
                              value={form.idEmployer}
                              onChange={(e) => setForm({ ...form, idEmployer: e.target.value })}
                            >
                              <option value="">-- Choisir employé --</option>
                              {employers.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {getNomCompletByEmployerSocieteId(emp.id)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-6">
                            <label>Type de sanction</label>
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
                            <label>Motif</label>
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
                            <label>Date de la sanction</label>
                            <input
                              type="date"
                              className="form-control"
                              required
                              value={form.dateSanction}
                              onChange={(e) => setForm({ ...form, dateSanction: e.target.value })}
                            />
                          </div>

                          <div className="col-12 text-end">
                            <button type="submit" className="btn btn-outline-primary">
                              <i className="icofont-save"></i> Enregistrer
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Liste des sanctions (filtrée pour l'employé) */}
                    <div className="card shadow border-0 rounded-4 p-4">
                      <h5 className="mb-4">📋 Liste des Sanctions</h5>

                      {loading ? (
                        <p className="text-muted">Chargement…</p>
                      ) : visibleSanctions.length === 0 ? (
                        <p className="text-muted">Aucune sanction disponible.</p>
                      ) : (
                        <div className="row">
                          {visibleSanctions.map((s) => (
                            <div className="col-md-6 mb-4" key={s.id}>
                              <div className="card h-100 border-0 shadow-sm rounded-4">
                                <div className="card-body">
                                  <h6 className="card-title text-primary">
                                    {getNomCompletByEmployerSocieteId(s.idEmployer)}
                                  </h6>

                                  <p className="mb-1">
                                    <strong>Type:</strong>{" "}
                                    <span className={`badge ${s.typeSanction === "1" ? "bg-success" : "bg-danger"}`}>
                                      {s.typeSanction === "1" ? "Positive" : "Négative"}
                                    </span>
                                  </p>

                                  <p className="mb-1">
                                    <strong>Date:</strong> {formatDate(s.dateSanction)}
                                  </p>

                                  <p className="mb-1">
                                    <strong>Motif:</strong> {s.motif}
                                  </p>

                                  {/* Actions visibles uniquement pour RH */}
                                  {isRH && (
                                    <>
                                      <button
                                        onClick={() => deleteSanction(s.id)}
                                        className="btn btn-sm btn-outline-danger mt-2"
                                      >
                                        <i className="icofont-trash"></i> Supprimer
                                      </button>
                                      <button
                                        onClick={() => handleEdit(s)}
                                        className="btn btn-sm btn-outline-warning mt-2 ms-2"
                                      >
                                        <i className="icofont-edit"></i> Modifier
                                      </button>
                                    </>
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
                <div id="styleSelector"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionSanction;
