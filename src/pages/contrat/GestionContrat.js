import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import useContrat from "../../hook/contrat/useContrat";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faDownload, faFileAlt, faSyncAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function GestionContrat() {
    useTemplateScripts();

    const { contrats, loading, fetchContrats, createContrat, deleteContrat, updateContrat } = useContrat();
    const [form, setForm] = useState({});
    const [file, setFile] = useState(null);
    const [employers, setEmployers] = useState([]);
    const [individus, setIndividus] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedContrat, setSelectedContrat] = useState(null);

    const initialForm = {
        idEmployerSociete: "",
        typeContrat: "",
        dateDebut: "",
        dateFin: "",
        salairedebase: "",
        statu: "en cours",
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchContrats();
            const employersRes = await EmployerSocieteService.getAll();
            setEmployers(employersRes.data);
            const individusRes = await IndividuService.getAll();
            setIndividus(individusRes.data);
        };
        fetchData();
    }, [fetchContrats]);

    const getNomComplet = (idEmployerSociete) => {
        const emp = employers.find((e) => e.id === idEmployerSociete);
        if (!emp) return "Employé inconnu";
        const individu = individus.find((i) => i.id === emp.idIndividue);
        if (!individu) return "Inconnu";
        return `${individu.nom} ${individu.prenom}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const resetForm = () => {
        setForm(initialForm);
        setFile(null);
        setSelectedContrat(null);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (contrat) => {
        setSelectedContrat(contrat);
        setForm({
            idEmployerSociete: contrat.idEmployerSociete,
            typeContrat: contrat.typeContrat,
            dateDebut: contrat.dateDebut ? format(new Date(contrat.dateDebut), "yyyy-MM-dd") : "",
            dateFin: contrat.dateFin ? format(new Date(contrat.dateFin), "yyyy-MM-dd") : "",
            salairedebase: contrat.salairedebase,
            statu: contrat.statu,
            fichierContrat: contrat.fichierContrat,
        });
        setFile(null);
        setShowModal(true);
    };

    const openDelete = (contrat) => {
        setSelectedContrat(contrat);
        setShowDeleteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedContrat) {
                await updateContrat(selectedContrat.id, form, file);
                toast.success("✅ Contrat mis à jour avec succès !");
            } else {
                await createContrat(form, file);
                toast.success("👍 Contrat ajouté avec succès !");
            }
            setShowModal(false);
            resetForm();
            fetchContrats();
        } catch (error) {
            toast.error("❌ Une erreur est survenue lors de la sauvegarde.");
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        if (!selectedContrat) return;
        try {
            await deleteContrat(selectedContrat.id);
            toast.info("🗑️ Contrat supprimé.");
            setShowDeleteModal(false);
            fetchContrats();
        } catch (error) {
            toast.error("❌ Une erreur est survenue lors de la suppression.");
            console.error(error);
        }
    };

    const getStatuBadgeClass = (statu) => {
        switch (statu) {
            case "en cours":
                return "badge bg-success";
            case "terminé":
                return "badge bg-danger";
            default:
                return "badge bg-secondary";
        }
    };
    
    // Fonction pour le tri des contrats (facultatif)
    const sortedContrats = useMemo(() => {
        return [...contrats].sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));
    }, [contrats]);

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
                                    <div className="row">
                                        <div className="col-12">
                                            <h4 className="mb-4 text-primary fw-bold">
                                                <i className="icofont-file-alt"></i> Gestion des Contrats
                                            </h4>
                                            <ToastContainer position="top-right" autoClose={2000} />

                                            {/* Liste des contrats */}
                                            <div className="card shadow-sm p-4 rounded-3 border-0 mt-4 mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5 className="card-title text-primary mb-0">
                                                        <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Liste des Contrats
                                                    </h5>
                                                    <button className="btn btn-primary d-flex align-items-center" onClick={openCreate}>
                                                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Ajouter un contrat
                                                    </button>
                                                </div>

                                                {loading ? (
                                                    <p className="text-center text-muted py-5">
                                                        <FontAwesomeIcon icon={faSyncAlt} spin size="2x" className="mb-2" />
                                                        <br />
                                                        Chargement en cours...
                                                    </p>
                                                ) : contrats.length === 0 ? (
                                                    <div className="text-center text-muted py-5">
                                                        <p className="fs-5">Aucun contrat disponible.</p>
                                                        <p>Cliquez sur "Ajouter un contrat" pour commencer.</p>
                                                    </div>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover align-middle">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>Employé</th>
                                                                    <th>Type</th>
                                                                    <th>Période</th>
                                                                    <th>Salaire</th>
                                                                    <th>Statut</th>
                                                                    <th className="text-end">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {sortedContrats.map((c) => (
                                                                    <tr key={c.id}>
                                                                        <td><strong className="text-dark">{getNomComplet(c.idEmployerSociete)}</strong></td>
                                                                        <td>{c.typeContrat}</td>
                                                                        <td>
                                                                            {format(new Date(c.dateDebut), "dd MMM yyyy", { locale: fr })} {" ➡ "}
                                                                            {c.dateFin
                                                                                ? format(new Date(c.dateFin), "dd MMM yyyy", { locale: fr })
                                                                                : <span className="text-danger">Non défini</span>}
                                                                        </td>
                                                                        <td>{parseInt(c.salairedebase).toLocaleString("fr-FR")} Ar</td>
                                                                        <td>
                                                                            <span className={getStatuBadgeClass(c.statu)}>
                                                                                {c.statu === "en cours" ? "En cours" : "Terminé"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-end">
                                                                            <a
                                                                                href={`http://localhost:8081/uploads/contrat/${c.fichierContrat}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="btn btn-sm btn-outline-info me-2"
                                                                                title="Télécharger"
                                                                            >
                                                                                <FontAwesomeIcon icon={faDownload} />
                                                                            </a>
                                                                            <button
                                                                                onClick={() => openEdit(c)}
                                                                                className="btn btn-sm btn-outline-warning me-2"
                                                                                title="Modifier"
                                                                            >
                                                                                <FontAwesomeIcon icon={faEdit} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openDelete(c)}
                                                                                className="btn btn-sm btn-outline-danger"
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
                </div>
            </div>

            {/* Modal Création / Édition */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content border-0 shadow rounded-3">
                            <div className="modal-header bg-primary text-white p-3 rounded-top-3">
                                <h5 className="modal-title">{selectedContrat ? "Modifier un contrat" : "Ajouter un nouveau contrat"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted">Employé</label>
                                            <select
                                                className="form-select"
                                                name="idEmployerSociete"
                                                required
                                                value={form.idEmployerSociete || ""}
                                                onChange={handleInputChange}
                                                disabled={!!selectedContrat}
                                            >
                                                <option value="">-- Choisir un employé --</option>
                                                {employers.map((emp) => {
                                                    const individu = individus.find((i) => i.id === emp.idIndividue);
                                                    return (
                                                        <option key={emp.id} value={emp.id}>
                                                            {individu ? `${individu.nom} ${individu.prenom}` : "Inconnu"}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label text-muted">Type de contrat</label>
                                            <select
                                                className="form-select"
                                                name="typeContrat"
                                                required
                                                value={form.typeContrat || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setForm({
                                                        ...form,
                                                        typeContrat: value,
                                                        dateFin: value === "CDI" ? "" : form.dateFin,
                                                    });
                                                }}
                                            >
                                                <option value="">-- Choisir un type --</option>
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="STAGE">Stage</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label text-muted">Date de début</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="dateDebut"
                                                required
                                                value={form.dateDebut || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label text-muted">Date de fin</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="dateFin"
                                                value={form.dateFin || ""}
                                                disabled={form.typeContrat === "CDI"}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label text-muted">Salaire de base (Ar)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="salairedebase"
                                                required
                                                value={form.salairedebase || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label text-muted">Statut</label>
                                            <select
                                                className="form-select"
                                                name="statu"
                                                required
                                                value={form.statu || ""}
                                                onChange={handleInputChange}
                                            >
                                                <option value="en cours">En cours</option>
                                                <option value="terminé">Terminé</option>
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label text-muted">Fichier du contrat</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="fichierContrat"
                                                onChange={handleFileChange}
                                            />
                                            {selectedContrat && form.fichierContrat && (
                                                <small className="text-info mt-1 d-block">
                                                    Laissez vide pour conserver le fichier actuel.
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer p-3 rounded-bottom-3 d-flex justify-content-end">
                                    <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowModal(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className={`btn ${selectedContrat ? 'btn-warning text-white' : 'btn-success'}`}>
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        {selectedContrat ? "Modifier le contrat" : "Ajouter le contrat"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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
                                    <p className="mb-0">Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.</p>
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

export default GestionContrat;