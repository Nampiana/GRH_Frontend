import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import { useNavigate } from "react-router-dom";
import useConge from "../../hook/conge/useConge";
import useSoldeConge from "../../hook/soldeConge/useSoldeConge";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";
import UtilisateurService from "../../services/utilisateur/utilisateurService";
import PosteService from "../../services/poste/posteService";
import ServiceService from "../../services/services/service";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../style/Style.css"; // Assurez-vous que ce fichier existe

function CreateConge() {
    useTemplateScripts();
    const navigate = useNavigate();
    const { createConge, conge, fetchConge, updateConge, uploadJustificatif } = useConge();
    const { soldeConge, fetchSoldeConge, updateSoldeConge } = useSoldeConge();

    const [user, setUser] = useState(null);
    const [idemployerSociete, setIdemployerSociete] = useState("");
    const [employers, setEmployers] = useState([]);
    const [individus, setIndividus] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [postes, setPostes] = useState([]);
    const [services, setServices] = useState([]);
    const [commentairesTemp, setCommentairesTemp] = useState({});
    const [file, setFile] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [justificatifUrl, setJustificatifUrl] = useState("");

    const openModal = (filename) => {
        setJustificatifUrl(`http://localhost:8081/uploads/justificationConge/${filename}`);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setJustificatifUrl("");
    };

    function formatDate(date) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(date).toLocaleDateString('fr-FR', options);
    }

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 1:
                return <span className="badge bg-warning text-dark"><i className="icofont-hourglass"></i> En attente</span>;
            case 2:
                return <span className="badge bg-success"><i className="icofont-check-circled"></i> Validé</span>;
            case 3:
                return <span className="badge bg-danger"><i className="icofont-close-circled"></i> Rejeté</span>;
            default:
                return null;
        }
    };

    const handleValidation = (congeId, newStatut) => {
        const selectedConge = conge.find(c => c.id === congeId);
        if (!selectedConge) {
            toast.error("Congé non trouvé.");
            return;
        }

        let duree = selectedConge.duree;
        if (!duree || duree <= 0) {
            const dateDebut = new Date(selectedConge.dateDebut);
            const dateFin = new Date(selectedConge.dateFin);
            const diffTime = dateFin.getTime() - dateDebut.getTime();
            duree = dateDebut.toDateString() === dateFin.toDateString() ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        const updatedConge = {
            ...selectedConge,
            statut: newStatut,
            duree: duree,
            commentaire: commentairesTemp[congeId] ?? "",
        };

        updateConge(congeId, updatedConge, () => {
            if (newStatut === 2) {
                const solde = soldeConge.find(s => s.idEmployerSociete === selectedConge.idEmployerSociete);
                if (solde) {
                    const nouveauSolde = Math.max(solde.solde - duree, 0);
                    updateSoldeConge(solde.id, { ...solde, solde: nouveauSolde }, () => {
                        fetchSoldeConge();
                    });
                }
                toast.success(`✅ Congé validé avec succès !`);
            } else {
                toast.info(`❌ Congé refusé avec succès.`);
            }
        });
    };

    useEffect(() => {
        IndividuService.getAll().then(res => setIndividus(res.data));
        UtilisateurService.getAll().then(res => setUtilisateurs(res.data));
        PosteService.getAll().then(res => setPostes(res.data));
        ServiceService.getAll().then(res => setServices(res.data));

        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setUser(userData);
            EmployerSocieteService.getByUtilisateur(userData.idUtilisateur)
                .then((res) => {
                    if (res.data) {
                        setIdemployerSociete(res.data.id);
                        fetchSoldeConge();
                        fetchConge();
                    }
                })
                .catch((err) => console.error(err));

            EmployerSocieteService.getAll()
                .then((res) => setEmployers(res.data))
                .catch((err) => console.error(err));
        }
    }, []);

    const getEmployerDetails = (idEmployerSociete) => {
        const employer = employers.find(e => e.id === idEmployerSociete);
        if (!employer) return {};
        const individu = individus.find(i => i.id === employer.idIndividue);
        const utilisateur = utilisateurs.find(u => u.id === employer.idUtilisateur);
        const poste = postes.find(p => p.id === employer.idPoste);
        const service = services.find(s => s.id === employer.idService);
        const solde = soldeConge.find(s => s.idEmployerSociete === idEmployerSociete)?.solde ?? 'Non défini';

        return {
            nom: individu?.nom || "",
            prenom: individu?.prenom || "",
            poste: poste?.nomPoste || "",
            service: service?.nomService || "",
            solde
        };
    };

    const [formData, setFormData] = useState({
        dateDebut: "",
        dateFin: "",
        motif: "",
        statut: 1,
        duree: "",
        dateCreation: new Date(),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "duree" ? (value ? parseFloat(value) : 0) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Envoi de la demande en cours...");

        try {
            const filename = file ? await uploadJustificatif(file) : "";
            const payload = {
                ...formData,
                idEmployerSociete: idemployerSociete,
                duree: formData.duree ? parseFloat(formData.duree) : 0,
                filename: filename,
            };

            await createConge(payload);
            toast.update(toastId, {
                render: "✅ Demande de congé enregistrée avec succès !",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });
            setFormData({
                dateDebut: "",
                dateFin: "",
                motif: "",
                statut: 1,
                duree: 0,
            });
            setFile(null);
            setTimeout(() => navigate("/conge"), 2000);
        } catch (error) {
            toast.update(toastId, {
                render: "❌ Erreur lors de l'enregistrement de la demande.",
                type: "error",
                isLoading: false,
                autoClose: 2000
            });
        }
    };

    const historiqueConge = conge
        .filter(c => {
            if (!user) return false;
            if (user.roles === 3) {
                return c.idEmployerSociete === idemployerSociete;
            } else if (user.roles === 2) {
                const employer = employers.find(e => e.id === c.idEmployerSociete);
                return employer?.idSociete === user.societe;
            }
            return false;
        })
        .sort((a, b) => new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0));

    return (
        <>
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
                                            {/* Section Solde de congés (rôle 3) */}
                                            {user?.roles === 3 && (
                                                <div className="card-solde rounded-4 shadow-sm mb-4 p-3 text-white">
                                                    <div className="text-center">
                                                        <h6 className="mb-0">Solde de congés restants</h6>
                                                        <h4 className="fw-bold mb-0">
                                                            {soldeConge
                                                                .filter(s => s.idEmployerSociete === idemployerSociete)
                                                                .map(s => s.solde)[0] ?? 'N/A'} jours
                                                        </h4>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Formulaire de demande (rôle 3) */}
                                            {user?.roles === 3 && (
                                                <div className="card rounded-4 shadow-lg border-0 p-4 mb-4 bg-white">
                                                    <h4 className="mb-4 fw-bold text-primary">
                                                        <i className="icofont-paper-plane me-2"></i> Demander un Congé
                                                    </h4>
                                                    <form onSubmit={handleSubmit}>
                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-bold">Date de début</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    name="dateDebut"
                                                                    value={formData.dateDebut}
                                                                    onChange={handleChange}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-bold">Date de fin</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    name="dateFin"
                                                                    value={formData.dateFin}
                                                                    onChange={handleChange}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-md-12">
                                                                <label className="form-label fw-bold">Durée (en jours)</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    name="duree"
                                                                    value={formData.duree ?? ""}
                                                                    onChange={handleChange}
                                                                    placeholder="ex: 1 pour une journée, 0.5 pour demi-journée"
                                                                />
                                                            </div>
                                                            <div className="col-md-12">
                                                                <label className="form-label fw-bold">Motif</label>
                                                                <textarea
                                                                    className="form-control"
                                                                    name="motif"
                                                                    value={formData.motif}
                                                                    onChange={handleChange}
                                                                    required
                                                                ></textarea>
                                                            </div>
                                                            <div className="col-md-12">
                                                                <label className="form-label fw-bold">Pièce justificative (optionnel)</label>
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    accept="image/*,application/pdf"
                                                                    onChange={(e) => setFile(e.target.files[0])}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 text-end">
                                                            <button type="submit" className="btn btn-primary btn-lg px-4">
                                                                <i className="icofont-save me-2"></i> Envoyer la demande
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}

                                            {/* Historique des congés */}
                                            <div className="card rounded-4 shadow p-4 border-0">
                                                <h4 className="mb-4 fw-bold text-secondary">
                                                    <i className="icofont-history me-2"></i> Historique des Congés
                                                </h4>
                                                {historiqueConge.length === 0 ? (
                                                    <div className="text-center p-5">
                                                        <i className="icofont-inbox fs-1 text-muted"></i>
                                                        <p className="text-muted mt-3">Aucune demande de congé n'a encore été soumise.</p>
                                                    </div>
                                                ) : (
                                                    <div className="row g-4">
                                                        {historiqueConge.map((c) => {
                                                            const details = getEmployerDetails(c.idEmployerSociete);
                                                            return (
                                                                <div className="col-md-6" key={c.id}>
                                                                    <div className="card h-100 border-0 shadow-sm card-hover rounded-4">
                                                                        <div className="card-body">
                                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                                <div>
                                                                                    <h5 className="card-title fw-bold text-dark">
                                                                                        {details.nom} {details.prenom}
                                                                                    </h5>
                                                                                    <p className="card-subtitle text-muted mb-2">
                                                                                        {details.poste} - {details.service}
                                                                                    </p>
                                                                                </div>
                                                                                {getStatusBadge(c.statut)}
                                                                            </div>
                                                                            <p className="mb-1 text-muted"><i className="icofont-clock-time me-2"></i> {formatDate(c.dateDebut)} au {formatDate(c.dateFin)}</p>
                                                                            <p className="mb-1 text-muted"><i className="icofont-sand-clock me-2"></i> Durée: <strong>{c.duree || "calcul en cours"} jours</strong></p>
                                                                            <p className="mb-1 text-muted"><i className="icofont-ui-calendar me-2"></i> Solde restant: <strong>{details.solde} jours</strong></p>
                                                                            <p className="mb-2 text-muted"><i className="icofont-comment me-2"></i> Motif: <strong>{c.motif}</strong></p>

                                                                            {c.filename && (
                                                                                <p className="mb-1">
                                                                                    <strong>Justificatif :</strong>{" "}
                                                                                    <a
                                                                                        href="#"
                                                                                        onClick={(e) => { e.preventDefault(); openModal(c.filename); }}
                                                                                        className="text-primary text-decoration-underline"
                                                                                    >
                                                                                        <i className="icofont-file-pdf me-1"></i> Voir le fichier
                                                                                    </a>
                                                                                </p>
                                                                            )}

                                                                            {c.commentaire?.trim() && (
                                                                                <p className="mb-2 text-muted"><i className="icofont-info-circle me-2"></i> Commentaire RH: <strong>{c.commentaire}</strong></p>
                                                                            )}

                                                                            {user?.roles === 2 && c.statut === 1 && (
                                                                                <div className="mt-3 pt-3 border-top">
                                                                                    <label className="form-label fw-bold">Commentaire RH</label>
                                                                                    <textarea
                                                                                        className="form-control mb-2"
                                                                                        placeholder="Ajouter un commentaire..."
                                                                                        value={commentairesTemp[c.id] || ""}
                                                                                        onChange={(e) => setCommentairesTemp(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                                                    />
                                                                                    <div className="d-flex gap-2">
                                                                                        <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleValidation(c.id, 2)}>
                                                                                            <i className="icofont-check-alt me-1"></i> Valider
                                                                                        </button>
                                                                                        <button className="btn btn-danger btn-sm flex-grow-1" onClick={() => handleValidation(c.id, 3)}>
                                                                                            <i className="icofont-close-line me-1"></i> Refuser
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
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
            {/* Modale */}
            {modalVisible && (
                <div className="modal-overlay d-flex justify-content-center align-items-center"
                    style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1050
                    }}
                    onClick={closeModal}
                >
                    <div className="modal-content-custom bg-white rounded-3 shadow-lg p-4"
                        style={{ maxWidth: "80%", maxHeight: "90vh", overflow: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={closeModal} className="btn-close float-end" aria-label="Close"></button>
                        <h5 className="modal-title mb-3">Justificatif</h5>
                        {justificatifUrl.endsWith(".pdf") ? (
                            <iframe
                                src={justificatifUrl}
                                width="100%"
                                height="600px"
                                title="Justificatif PDF"
                                className="rounded"
                            ></iframe>
                        ) : (
                            <img
                                src={justificatifUrl}
                                alt="Justificatif"
                                className="img-fluid rounded"
                                style={{ maxHeight: "70vh" }}
                            />
                        )}
                    </div>
                </div>
            )}
            <ToastContainer />
        </>
    );
}

export default CreateConge;