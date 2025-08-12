import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import useContrat from "../../hook/contrat/useContrat";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";

function MonContrat() {
    useTemplateScripts();
    const { contrats } = useContrat();
    const [idemployer, setIdemployer] = useState(null);
    const [monContrat, setMonContrat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData?.idIndividu) {
            setUser(userData);
            EmployerSocieteService.getByIndividu(userData.idIndividu)
                .then(res => {
                    const empId = res.data.id;
                    setIdemployer(empId);
                    const contrat = contrats.find(c => c.idEmployerSociete === empId);
                    setMonContrat(contrat);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [contrats]);

    const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");
    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const fileUrl = monContrat?.fichierContrat
        ? `http://localhost:8080/uploads/contrat/${monContrat.fichierContrat}`
        : "";

    const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

    // à mettre dans MonContrat (au-dessus du return)
    const downloadDirect = async () => {
        if (!fileUrl) return;
        try {
            const response = await fetch(fileUrl, { credentials: "include" });
            if (!response.ok) throw new Error("Téléchargement échoué");

            const blob = await response.blob();
            const filename = monContrat?.fichierContrat || "contrat";

            // Compatibilité IE/Edge Legacy
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, filename);
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename; // force l’enregistrement avec ce nom
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Impossible de télécharger le fichier.");
        }
    };


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


                                        {loading ? (
                                            <div className="text-muted">Chargement en cours...</div>
                                        ) : monContrat ? (
                                            <div className="card shadow-lg p-4 border-0 rounded-4 bg-white">
                                                <h4 className="mb-4 text-primary">
                                                    <i className="icofont-file-document"></i> Mon Contrat
                                                </h4>
                                                <h5 className="mb-4 text-primary text-center"><i className="icofont-contract"></i> Détails du Contrat</h5>

                                                <div className="row g-4 justify-content-center">
                                                    <div className="col-md-5">
                                                        <div className="border rounded-4 p-3 shadow-sm bg-light h-100">
                                                            <h6 className="text-muted"><i className="icofont-id-card"></i> Type de contrat</h6>
                                                            <h5 className="fw-semibold text-dark">{monContrat.typeContrat}</h5>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-5">
                                                        <div className="border rounded-4 p-3 shadow-sm bg-light h-100">
                                                            <h6 className="text-muted"><i className="icofont-calendar"></i> Période</h6>
                                                            <h5 className="fw-semibold text-dark">{formatDate(monContrat.dateDebut)} ➡ {formatDate(monContrat.dateFin)}</h5>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-5">
                                                        <div className="border rounded-4 p-3 shadow-sm bg-light h-100">
                                                            <h6 className="text-muted"><i className="icofont-coins"></i> Salaire de base</h6>
                                                            <h5 className="fw-semibold text-dark">{monContrat.salairedebase} Ar</h5>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-5">
                                                        <div className="border rounded-4 p-3 shadow-sm bg-light h-100">
                                                            <h6 className="text-muted"><i className="icofont-check-circled"></i> Statut</h6>
                                                            <span className={`badge fs-6 px-3 py-2 ${monContrat.statu === 'en cours' ? 'bg-success' : 'bg-secondary'}`}>
                                                                {monContrat.statu}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <h6 className="text-secondary"><i className="icofont-paper-clip"></i> Fichier du contrat</h6>
                                                    {isPdf ? (
                                                        <iframe
                                                            src={fileUrl}
                                                            style={{
                                                                width: "100%",
                                                                height: "500px",
                                                                borderRadius: "12px",
                                                                border: "1px solid #ccc",
                                                                boxShadow: "0 0 8px rgba(0,0,0,0.1)"
                                                            }}
                                                            title="Contrat PDF"
                                                        ></iframe>
                                                    ) : (
                                                        <img
                                                            src={fileUrl}
                                                            alt="Contrat"
                                                            onClick={openModal}
                                                            style={{
                                                                maxWidth: "600px",
                                                                maxHeight: "400px",
                                                                cursor: "zoom-in",
                                                                borderRadius: "12px",
                                                                border: "1px solid #ccc",
                                                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                                                            }}
                                                            className="img-fluid"
                                                        />
                                                    )} 
                                                    {!isPdf && <p className="text-muted mt-2">Cliquez pour agrandir</p>}
                                                    {fileUrl && (
                                                        <div className="mt-3 d-flex justify-content-center gap-2">
                                                            <button type="button" onClick={downloadDirect} className="btn btn-primary">
                                                                <i className="icofont-download"></i> Télécharger le contrat
                                                            </button>
                                                        </div>
                                                    )}
                                                   
                                                </div>
                                            </div>

                                        ) : (
                                            <p className="text-muted">Aucun contrat trouvé pour l'utilisateur connecté.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div id="styleSelector"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Modal image fullscreen */}
            {modalVisible && !isPdf && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(5px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                    }}
                    onClick={closeModal}
                >
                    <img
                        src={fileUrl}
                        alt="Contrat Zoom"
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            borderRadius: "8px",
                            boxShadow: "0 0 20px rgba(255,255,255,0.3)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="btn btn-danger btn-sm"
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            zIndex: 10000
                        }}
                        onClick={closeModal}
                    >
                        ✖
                    </button>
                </div>
            )}
        </div>
    );
}

export default MonContrat;
