import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import useContrat from "../../hook/contrat/useContrat";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const MonContrat = () => {
    useTemplateScripts();
    const { contrats } = useContrat();
    const [monContrat, setMonContrat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchContrat = async () => {
            setLoading(true);
            try {
                const userData = JSON.parse(localStorage.getItem("user"));
                if (userData?.idIndividu) {
                    const res = await EmployerSocieteService.getByIndividu(userData.idIndividu);
                    const empId = res.data.id;
                    const contrat = contrats.find(c => c.idEmployerSociete === empId);
                    setMonContrat(contrat);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération du contrat :", err);
                setMonContrat(null); // S'assurer que le contrat est null en cas d'erreur
            } finally {
                setLoading(false);
            }
        };

        if (contrats.length > 0) {
            fetchContrat();
        }
    }, [contrats]);

    const fileUrl = monContrat?.fichierContrat
        ? `http://localhost:8081/uploads/contrat/${monContrat.fichierContrat}`
        : "";

    const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

    const downloadDirect = async () => {
        if (!fileUrl) {
            alert("Aucun fichier à télécharger.");
            return;
        }
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Téléchargement échoué.");
            const blob = await response.blob();
            const filename = monContrat?.fichierContrat || "contrat.pdf";
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erreur de téléchargement :", err);
            alert("Impossible de télécharger le fichier. Veuillez réessayer.");
        }
    };

    const renderContratContent = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            );
        }

        if (!monContrat) {
            return (
                <div className="alert alert-info text-center" role="alert">
                    <i className="icofont-info-circle fs-5 me-2"></i> Aucun contrat n'est associé à votre compte pour le moment.
                </div>
            );
        }

        return (
            <div className="card shadow-lg p-4 border-0 rounded-4 bg-white">
                <h2 className="text-primary text-center mb-4">
                    <i className="icofont-file-document me-2"></i> Mon Contrat de Travail
                </h2>
                <div className="row g-4 justify-content-center mb-5">
                    <ContratInfoCard
                        icon="icofont-id-card"
                        label="Type de contrat"
                        value={monContrat.typeContrat}
                    />
                    <ContratInfoCard
                        icon="icofont-calendar"
                        label="Période"
                        value={`${formatDate(monContrat.dateDebut)} au ${formatDate(monContrat.dateFin)}`}
                    />
                    <ContratInfoCard
                        icon="icofont-coins"
                        label="Salaire de base"
                        value={`${monContrat.salairedebase.toLocaleString("fr-FR")} Ar`}
                    />
                    <ContratInfoCard
                        icon="icofont-check-circled"
                        label="Statut"
                        value={monContrat.statu}
                        badgeClass={monContrat.statu === 'en cours' ? 'bg-success' : 'bg-secondary'}
                    />
                </div>

                {fileUrl && (
                    <div className="text-center">
                        <h4 className="text-secondary mb-3">
                            <i className="icofont-paper-clip me-2"></i> Fichier du contrat
                        </h4>
                        {isPdf ? (
                            <iframe
                                src={fileUrl}
                                title="Aperçu du contrat PDF"
                                style={{ width: "100%", height: "500px", borderRadius: "12px", border: "1px solid #ddd" }}
                                loading="lazy"
                            ></iframe>
                        ) : (
                            <>
                                <img
                                    src={fileUrl}
                                    alt="Aperçu du contrat"
                                    onClick={() => setModalVisible(true)}
                                    style={{ maxWidth: "100%", maxHeight: "500px", cursor: "zoom-in", borderRadius: "12px", border: "1px solid #ddd" }}
                                    className="img-fluid shadow"
                                />
                                <p className="text-muted mt-2">Cliquez sur l'image pour l'agrandir.</p>
                            </>
                        )}
                        <button type="button" onClick={downloadDirect} className="btn btn-primary btn-lg mt-4">
                            <i className="icofont-download me-2"></i> Télécharger le contrat
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div id="pcoded" className="pcoded">
            <div className="pcoded-container navbar-wrapper">
                <Topbar />
                <div className="pcoded-main-container">
                    <div className="pcoded-wrapper">
                        <Sidebar />
                        <div className="pcoded-content">
                            <div className="page-wrapper">
                                <div className="page-body p-4">
                                    {renderContratContent()}
                                </div>
                            </div>
                            <div id="styleSelector"></div>
                        </div>
                    </div>
                </div>
            </div>

            {modalVisible && !isPdf && (
                <Modal fileUrl={fileUrl} closeModal={() => setModalVisible(false)} />
            )}
        </div>
    );
};

// Composant pour les cartes d'information
const ContratInfoCard = ({ icon, label, value, badgeClass }) => (
    <div className="col-md-6 col-lg-5">
        <div className="border rounded-4 p-4 shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
            <div className="d-flex align-items-center mb-2">
                <i className={`${icon} text-muted fs-4 me-3`}></i>
                <h6 className="text-muted mb-0">{label}</h6>
            </div>
            {badgeClass ? (
                <span className={`badge fs-6 px-3 py-2 mt-2 ${badgeClass}`}>
                    {value}
                </span>
            ) : (
                <h4 className="fw-semibold text-dark mt-2 mb-0">{value}</h4>
            )}
        </div>
    </div>
);

// Composant pour la modale
const Modal = ({ fileUrl, closeModal }) => (
    <div
        className="modal-overlay d-flex justify-content-center align-items-center"
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 9999,
        }}
        onClick={closeModal}
    >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={fileUrl} alt="Contrat agrandi" className="img-fluid" style={{ maxHeight: "90vh", borderRadius: "10px" }} />
        </div>
        <button
            className="btn-close btn-close-white"
            style={{ position: "absolute", top: "20px", right: "20px" }}
            onClick={closeModal}
        ></button>
    </div>
);

export default MonContrat;