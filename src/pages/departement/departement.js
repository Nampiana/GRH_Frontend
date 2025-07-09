import React, { useState, useEffect } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useDepartement from "../../hook/departement/departementHook";
import useTemplateScripts from "../../utils/useTemplateScripts";

function Departement() {
    useTemplateScripts();
    const {
        departements,
        fetchDepartements,
        createDepartement,
        updateDepartement,
        deleteDepartement,
    } = useDepartement();

    const [nomDepartement, setNomDepartement] = useState("");
    const [selectedDepartement, setSelectedDepartement] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchDepartements();
    }, []);

    const handleCreateOrUpdate = () => {
        if (selectedDepartement) {
            updateDepartement(selectedDepartement.id, { nomDepartement }, () => {
                setShowModal(false);
                setSelectedDepartement(null);
                setNomDepartement("");
            });
        } else {
            createDepartement({ nomDepartement }, () => {
                setShowModal(false);
                setNomDepartement("");
            });
        }
    };

    const handleEditClick = (departement) => {
        setSelectedDepartement(departement);
        setNomDepartement(departement.nomDepartement);
        setShowModal(true);
    };

    const handleDeleteClick = (departement) => {
        setSelectedDepartement(departement);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        deleteDepartement(selectedDepartement.id, () => {
            setShowDeleteModal(false);
            setSelectedDepartement(null);
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setNomDepartement("");
        setSelectedDepartement(null);
    };

    return (
        <div id="pcoded" className="pcoded">
            <div className="pcoded-container navbar-wrapper">
                <Topbar />
                <div className="pcoded-main-container">
                    <div className="pcoded-wrapper">
                        <Sidebar />
                        <div className="pcoded-content">
                            <div className="pcoded-inner-content">
                                <div className="main-body">
                                    <div className="page-wrapper">
                                        <div className="page-body">
                                            <div className="card p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5>Liste des Départements</h5>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setShowModal(true)}
                                                    >
                                                        <i className="icofont icofont-plus"></i> Créer Département
                                                    </button>
                                                </div>

                                                {departements.length === 0 ? (
                                                    <p className="text-center text-muted">Aucun département enregistré.</p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Nom du Département</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departements.map((d, index) => (
                                                                    <tr key={d.id}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{d.nomDepartement}</td>
                                                                        <td>
                                                                            <button
                                                                                className="btn btn-warning btn-sm me-3"
                                                                                onClick={() => handleEditClick(d)}
                                                                            >
                                                                                <i className="icofont icofont-edit"></i> Modifier
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-danger btn-sm"
                                                                                onClick={() => handleDeleteClick(d)}
                                                                            >
                                                                                <i className="icofont icofont-trash"></i> Supprimer
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
                                <div id="styleSelector"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de création/modification */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    {selectedDepartement ? "Modifier Département" : "Créer Département"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <label>Nom du Département</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nom du département"
                                    value={nomDepartement}
                                    onChange={(e) => setNomDepartement(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeModal}>
                                    Annuler
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateOrUpdate}
                                    disabled={nomDepartement.trim() === ""}
                                >
                                    {selectedDepartement ? "Enregistrer les modifications" : "Créer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="icofont icofont-warning-alt"></i> Confirmer la suppression
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                <p className="fs-5">
                                    Voulez-vous vraiment supprimer le département :
                                    <br />
                                    <strong>{selectedDepartement?.nomDepartement}</strong> ?
                                </p>
                            </div>
                            <div className="modal-footer justify-content-center">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </button>
                                <button className="btn btn-danger" onClick={confirmDelete}>
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

export default Departement;
