import React, { useState, useEffect } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useDepartement from "../../hook/departement/departementHook";
import SocieteServices from "../../services/societe/societeService";
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

    const [societes, setSocietes] = useState([]);
    const [nomDepartement, setNomDepartement] = useState("");
    const [idSociete, setIdSociete] = useState("");
    const [selectedDepartement, setSelectedDepartement] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSocieteFilter, setSelectedSocieteFilter] = useState("");


    const [user, setUser] = useState({ roles: 1, societe: "" });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setUser({ roles: userData.roles, societe: userData.societe });
        }
    }, []);

    useEffect(() => {
        fetchDepartements();
        SocieteServices.getAll()
            .then(res => {
                console.log("Societe response:", res.data);
                setSocietes(res.data.content);
            })
            .catch(err => console.error(err));
    }, []);


    const handleCreateOrUpdate = () => {
        const payload = { nomDepartement, idSociete };

        if (selectedDepartement) {
            updateDepartement(selectedDepartement.id, payload, () => {
                setShowModal(false);
                resetForm();
            });
        } else {
            createDepartement(payload, () => {
                setShowModal(false);
                resetForm();
            });
        }
    };

    const handleEditClick = (departement) => {
        setSelectedDepartement(departement);
        setNomDepartement(departement.nomDepartement);
        setIdSociete(departement.idSociete || "");
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

    const resetForm = () => {
        setNomDepartement("");
        setIdSociete("");
        setSelectedDepartement(null);
    };

    const closeModal = () => {
        resetForm();
        setShowModal(false);
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
                                                {user.roles === 1 && (
                                                    <div className="mb-3">
                                                        <label>Filtrer par Société :</label>
                                                        <select
                                                            className="form-control"
                                                            value={selectedSocieteFilter}
                                                            onChange={(e) => setSelectedSocieteFilter(e.target.value)}
                                                        >
                                                            <option value="">Toutes les sociétés</option>
                                                            {societes.map(s => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.nomSociete}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {departements.length === 0 ? (
                                                    <p className="text-center text-muted">Aucun département enregistré.</p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Nom du Département</th>
                                                                    <th>Société</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departements
                                                                    .filter(d => {
                                                                        if (user.roles === 2 && d.idSociete !== user.societe) return false;
                                                                        if (user.roles === 1 && selectedSocieteFilter && d.idSociete !== selectedSocieteFilter) return false;
                                                                        return true;
                                                                    })

                                                                    .map((d, index) => (
                                                                        <tr key={d.id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{d.nomDepartement}</td>
                                                                            <td>{societes.find(s => s.id === d.idSociete)?.nomSociete || "N/A"}</td>
                                                                            <td>
                                                                                <button className="btn btn-warning btn-sm me-3" onClick={() => handleEditClick(d)}>
                                                                                    <i className="icofont icofont-edit"></i> Modifier
                                                                                </button>
                                                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(d)}>
                                                                                    <i className="icofont icofont-trash"></i> Supprimer
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }
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
                                    className="form-control mb-2"
                                    placeholder="Nom du département"
                                    value={nomDepartement}
                                    onChange={(e) => setNomDepartement(e.target.value)}
                                />
                                <label>Société</label>
                                <select
                                    className="form-control"
                                    value={idSociete}
                                    onChange={(e) => setIdSociete(e.target.value)}
                                >
                                    <option value="">Sélectionner une société</option>
                                    {societes
                                        .filter(s => user.roles === 2 ? s.id === user.societe : true)
                                        .map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.nomSociete}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeModal}>
                                    Annuler
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateOrUpdate}
                                    disabled={nomDepartement.trim() === "" || idSociete === ""}
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
