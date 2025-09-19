import React from 'react';

const ModalForm = ({ show, handleClose, formData, handleInputChange, handleCreateOrUpdate, selectedEmployer, user, societes, services, postes, categories, formatAriary }) => {
  if (!show) return null;

  const title = selectedEmployer ? "Modifier Employé" : "Créer Employé";
  const buttonText = selectedEmployer ? "Enregistrer les modifications" : "Créer l'employé";
  const isRhUser = user.roles === 2;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-3 shadow">
          <div className="modal-header bg-primary text-white border-0 rounded-top-3">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="row g-3">
              {["nom", "prenom", "adresse", "email", "telephone"].map(field => (
                <div className="col-md-6" key={field}>
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="text"
                    className="form-control"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
              {!selectedEmployer && (
                <div className="col-md-6">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              )}
                <div className="col-md-6">
                  <label className="form-label">Rôle</label>
                  <select className="form-select" name="role" value={formData.role} onChange={handleInputChange}>
                    <option value={2}>RH</option>
                    <option value={3}>Employé</option>
                  </select>
                </div>
              <div className="col-md-6">
                <label className="form-label">Société</label>
                <select className="form-select" name="idSociete" value={formData.idSociete} onChange={handleInputChange}>
                  <option value="">Sélectionner une société</option>
                  {(isRhUser ? societes.filter(s => s.id === user.societe) : societes).map(s => (
                    <option key={s.id} value={s.id}>{s.nomSociete}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Service</label>
                <select className="form-select" name="idService" value={formData.idService} onChange={handleInputChange}>
                  <option value="">Sélectionner un service</option>
                  {(isRhUser ? services.filter(s => s.idSociete === user.societe) : services).map(s => (
                    <option key={s.id} value={s.id}>{s.nomService}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Poste</label>
                <select className="form-select" name="idPoste" value={formData.idPoste} onChange={handleInputChange}>
                  <option value="">Sélectionner un poste</option>
                  {(isRhUser ? postes.filter(p => p.idSociete === user.societe) : postes).map(p => (
                    <option key={p.id} value={p.id}>{p.nomPoste}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Catégorie</label>
                <select className="form-select" name="idCategorie" value={formData.idCategorie} onChange={handleInputChange}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nomCategorie}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Salaire de base (Ariary)</label>
                <input
                  type="number"
                  className="form-control"
                  name="salaireBase"
                  min="0"
                  step="1"
                  placeholder="Ex: 450000"
                  value={formData.salaireBase}
                  onChange={handleInputChange}
                />
                <small className="text-muted">{formData.salaireBase !== "" ? `Aperçu : ${formatAriary(formData.salaireBase)}` : ""}</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Date de débauche</label>
                <input
                  type="date"
                  className="form-control"
                  name="dateDebauche"
                  value={formData.dateDebauche}
                  onChange={handleInputChange}
                />
                <small className="text-muted">Laisser vide si l'employé est actif.</small>
              </div>
            </div>
          </div>
          <div className="modal-footer justify-content-end p-3 border-top-0">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Annuler</button>
            <button type="button" className="btn btn-primary" onClick={handleCreateOrUpdate}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;