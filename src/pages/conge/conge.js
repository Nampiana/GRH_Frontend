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
import 'react-toastify/dist/ReactToastify.css';
import "../../style/Style.css";

function CreateConge() {
    useTemplateScripts();
    const navigate = useNavigate();
    const { createConge, conge, fetchConge, updateConge, uploadJustificatif } = useConge();
    const { soldeConge, fetchSoldeConge, updateSoldeConge } = useSoldeConge();


    const [successMessage, setSuccessMessage] = useState("");
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
        setJustificatifUrl(`http://localhost:8080/uploads/justificationConge/${filename}`);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setJustificatifUrl("");
    };

    function formatDate(date) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(date).toLocaleDateString('fr-FR', options);  // Format français : 10/12/2025
    }

    const handleValidation = (congeId, newStatut) => {
        const selectedConge = conge.find(c => c.id === congeId);
        if (!selectedConge) return;

        // 1. On utilise la durée existante si elle est > 0
        let duree = selectedConge.duree;

        console.log("duration", duree);


        // 2. Si elle est nulle ou absente, on la calcule automatiquement
        if (!duree || duree <= 0) {
            const dateDebut = new Date(selectedConge.dateDebut);
            const dateFin = new Date(selectedConge.dateFin);
            const diffTime = dateFin.getTime() - dateDebut.getTime();

            // Même jour = 1 jour par défaut
            duree = dateDebut.toDateString() === dateFin.toDateString()
                ? 1
                : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        // 3. Construire la version mise à jour du congé
        const updatedConge = {
            ...selectedConge,
            statut: newStatut,
            duree: duree, // injecter explicitement la durée retenue
            commentaire: commentairesTemp[congeId] ?? "",
        };

        console.log("commentaire", updatedConge);


        // 4. Mettre à jour le congé
        updateConge(congeId, updatedConge, () => {
            if (newStatut === 2) {
                const solde = soldeConge.find(s => s.idEmployerSociete === selectedConge.idEmployerSociete);
                if (solde) {
                    console.log("valeur final duree", duree);
                    console.log("valeur du solde", solde.solde);
                    const nouveauSolde = Math.max(solde.solde - duree, 0);
                    updateSoldeConge(solde.id, { ...solde, solde: nouveauSolde }, () => {
                        fetchSoldeConge();
                    });
                }
            }

            setSuccessMessage(`✅ Congé ${newStatut === 2 ? 'validé' : 'refusé'} avec succès`);
            setTimeout(() => setSuccessMessage(""), 1500);
        });
    };




    useEffect(() => {
        IndividuService.getAll().then(res => setIndividus(res.data));
        UtilisateurService.getAll().then(res => setUtilisateurs(res.data));
        PosteService.getAll().then(res => setPostes(res.data));
        ServiceService.getAll().then(res => setServices(res.data));
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
            telephone: individu?.telephone || "",
            role: utilisateur?.roles,
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

    useEffect(() => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "duree" ? (value ? parseFloat(value) : 0) : value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const filename = file ? await uploadJustificatif(file) : "";

        const payload = {
            ...formData,
            idEmployerSociete: idemployerSociete,
            duree: formData.duree ? parseFloat(formData.duree) : 0,
            filename: filename, // <-- ✅ ici on inclut le nom du fichier uploadé
        };

        createConge(payload, () => {
            setSuccessMessage("✅ Congé enregistré avec succès !");
            setFormData({
                dateDebut: "",
                dateFin: "",
                motif: "",
                statut: 1,
                duree: 0,
            });
            setFile(null);
            setTimeout(() => {
                setSuccessMessage("");
                navigate("/conge");
            }, 1500);
        });
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
                                            {user?.roles === 3 && (
                                                <div className="card text-white mb-3 shadow-sm" style={{ backgroundColor: "#303549" }}>
                                                    <div className="card-body text-center p-3">
                                                        <h6 className="mb-1">Solde de congés</h6>
                                                        <h5 className="mb-0">
                                                            {soldeConge
                                                                .filter(s => s.idEmployerSociete === idemployerSociete)
                                                                .map(s => s.solde)[0] ?? 'Non défini'} jours
                                                        </h5>
                                                    </div>
                                                </div>

                                            )}


                                            {/* Formulaire visible uniquement si user.roles === 3 */}
                                            {user?.roles === 3 && (
                                                <div className="card shadow-lg border-0 p-4 bg-light rounded-4 mb-4">
                                                    <h4 className="mb-4 text-primary">
                                                        <i className="icofont-calendar"></i> Demander un Congé
                                                    </h4>
                                                    {successMessage && (
                                                        <span className="badge badge-success p-2">{successMessage}</span>
                                                    )}

                                                    <form onSubmit={handleSubmit}>
                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <label>Date Début</label>
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
                                                                <label>Date Fin</label>
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
                                                                <label>Durée (laisser vide pour auto)</label>
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
                                                                <label>Motif</label>
                                                                <textarea
                                                                    className="form-control"
                                                                    name="motif"
                                                                    value={formData.motif}
                                                                    onChange={handleChange}
                                                                    required
                                                                ></textarea>
                                                            </div>
                                                            <div className="col-md-12">
                                                                <label>Pièce justificative (image ou PDF)</label>
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    accept="image/*,application/pdf"
                                                                    onChange={(e) => setFile(e.target.files[0])}
                                                                />
                                                            </div>

                                                        </div>

                                                        <div className="mt-4 text-end">
                                                            <button type="submit" className="btn btn-outline-primary btn-lg px-4">
                                                                <i className="icofont-save"></i> Enregistrer
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}

                                            <div className="card shadow p-4 border-0">
                                                <h5>Historique des Congés</h5>
                                                {historiqueConge.length === 0 ? (
                                                    <p className="text-muted">Aucun congé enregistré.</p>
                                                ) : (
                                                    <div className="row">
                                                        {historiqueConge.map((c) => {
                                                            const details = getEmployerDetails(c.idEmployerSociete);
                                                            return (
                                                                <div className="col-md-6 mb-4" key={c.id}>
                                                                    <div className="card border-0 shadow-sm h-100 rounded-4">
                                                                        <div className="card-body">
                                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                <h5 className="card-title">{details.nom} {details.prenom}</h5>
                                                                                <span className={`badge rounded-pill 
                                                                                    ${c.statut === 1 ? "bg-warning text-dark" :
                                                                                        c.statut === 2 ? "bg-success" : "bg-danger"}`}>
                                                                                    {c.statut === 1 ? "En attente" : c.statut === 2 ? "Validé" : "Rejeté"}
                                                                                </span>
                                                                            </div>
                                                                            <p className="mb-1 text-muted"><i className="icofont-user-alt-5"></i> {details.poste} - {details.service}</p>
                                                                            <p className="mb-1"><strong>Motif:</strong> {c.motif}</p>
                                                                            <p className="mb-1"><strong>Période:</strong> {formatDate(c.dateDebut)} ➡ {formatDate(c.dateFin)}</p>
                                                                            <p className="mb-1"><strong>Durée:</strong> {c.duree} jour(s)</p>
                                                                            <p className="mb-1"><strong>Solde restant:</strong> {details.solde} jours</p>
                                                                            <p className="mb-1"><strong>Commentaire RH:</strong> {c.commentaire?.trim() ? c.commentaire : "Aucun commentaire"}</p>
                                                                            <p className="mb-1"><strong>Date d'envoi:</strong> {formatDate(c.dateCreation)}</p>
                                                                            {c.filename && (
                                                                                <p className="mb-1">
                                                                                    <strong>Justificatif :</strong>{" "}
                                                                                    <span
                                                                                        onClick={() => openModal(c.filename)}
                                                                                        className="text-decoration-underline text-primary"
                                                                                        style={{ cursor: "pointer" }}
                                                                                    >
                                                                                        Voir le fichier
                                                                                    </span>
                                                                                </p>
                                                                            )}
                                                                            {user?.roles === 2 && c.statut === 1 && (
                                                                                <div className="mt-3">
                                                                                    <label>Commentaire RH :</label>
                                                                                    <textarea
                                                                                        className="form-control mb-2"
                                                                                        placeholder="Écrire un commentaire"
                                                                                        value={commentairesTemp[c.id] || ""}
                                                                                        onChange={(e) => setCommentairesTemp(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                                                    />
                                                                                    <div className="d-flex gap-2">
                                                                                        <button className="btn btn-outline-success btn-sm" onClick={() => handleValidation(c.id, 2)}>
                                                                                            <i className="icofont-check-circled"></i> Valider
                                                                                        </button>
                                                                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleValidation(c.id, 3)}>
                                                                                            <i className="icofont-close-circled"></i> Refuser
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
            {modalVisible && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(5px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            maxWidth: "90%",
                            maxHeight: "90%",
                            overflow: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="btn btn-sm btn-danger float-end"
                        >
                            Fermer
                        </button>
                        <h5 className="mb-3">Justificatif</h5>
                        {justificatifUrl.endsWith(".pdf") ? (
                            <iframe
                                src={justificatifUrl}
                                width="100%"
                                height="600px"
                                title="Justificatif PDF"
                            ></iframe>
                        ) : (
                            <img
                                src={justificatifUrl}
                                alt="Justificatif"
                                style={{ maxWidth: "100%", maxHeight: "600px" }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default CreateConge;
