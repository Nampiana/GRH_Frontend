import React from 'react';

const ModalDelete = ({ show, handleClose, confirmDelete, nom, prenom }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-3">
          <div className="modal-header bg-danger text-white border-0 rounded-top-3">
            <h5 className="modal-title">Confirmer la suppression</h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <div className="modal-body text-center p-4">
            <p className="lead mb-4">Voulez-vous vraiment supprimer cet employé ?</p>
            <strong className="d-block mb-3">{nom} {prenom}</strong>
            <p className="text-muted small">Cette action est irréversible.</p>
          </div>
          <div className="modal-footer justify-content-center p-3 border-top-0">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Annuler</button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDelete;