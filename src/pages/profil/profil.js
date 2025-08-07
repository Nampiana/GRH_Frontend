import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import ServiceIndividu from "../../services/individu/individuService";

function Profil() {
    useTemplateScripts();

    const [user, setUser] = useState(null);
    const [profil, setProfil] = useState({});
    const [message, setMessage] = useState("");

    const clearMessage = () => {
        setTimeout(() => setMessage(""), 2000);
    };


    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setUser(userData);
            ServiceIndividu.getOne(userData.idIndividu)
                .then(res => setProfil(res.data))
                .catch(err => console.error(err));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfil(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        ServiceIndividu.update(profil.id, profil)
            .then(() => {
                setMessage("✅ Profil mis à jour avec succès.");
                clearMessage();
            })
            .catch(() => {
                setMessage("❌ Une erreur est survenue.");
                clearMessage();
            });
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
                                        <div className="card shadow-lg p-4 rounded-4 border-0">
                                            <h4 className="mb-4 text-primary">
                                                <i className="icofont-user"></i> Mon Profil
                                            </h4>

                                            {message && (
                                                <div className="alert alert-info">{message}</div>
                                            )}

                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label>Nom</label>
                                                    <input
                                                        type="text"
                                                        name="nom"
                                                        value={profil.nom || ""}
                                                        onChange={handleChange}
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label>Prénom</label>
                                                    <input
                                                        type="text"
                                                        name="prenom"
                                                        value={profil.prenom || ""}
                                                        onChange={handleChange}
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label>Adresse</label>
                                                    <input
                                                        type="text"
                                                        name="adresse"
                                                        value={profil.adresse || ""}
                                                        onChange={handleChange}
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label>Téléphone</label>
                                                    <input
                                                        type="text"
                                                        name="telephone"
                                                        value={profil.telephone || ""}
                                                        onChange={handleChange}
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label>Téléphone</label>
                                                    <input
                                                        type="text"
                                                        name="email"
                                                        value={profil.email || ""}
                                                        onChange={handleChange}
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label>Date de naissance</label>
                                                    <input
                                                        type="date"
                                                        name="dateNaissance"
                                                        value={profil.dateNaissance?.split("T")[0] || ""}
                                                        onChange={handleChange}
                                                        className="form-control"
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end mt-4">
                                                <button className="btn btn-primary" onClick={handleSubmit}>
                                                    💾 Enregistrer les modifications
                                                </button>
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
        </div>
    );
}

export default Profil;
