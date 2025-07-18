import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import { useNavigate } from "react-router-dom";
import useConge from "../../hook/conge/useConge";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";

function CreateConge() {
    useTemplateScripts();
    const navigate = useNavigate();
    const { createConge, conge, fetchConge } = useConge();

    const [successMessage, setSuccessMessage] = useState("");
    const [user, setUser] = useState(null);
    const [idemployerSociete, setIdemployerSociete] = useState("");
    const [employers, setEmployers] = useState([]);

    const [formData, setFormData] = useState({
        dateDebut: "",
        dateFin: "",
        motif: "",
        statut: 1,
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setUser(userData);
            EmployerSocieteService.getByUtilisateur(userData.idUtilisateur)
                .then((res) => {
                    if (res.data) {
                        setIdemployerSociete(res.data.id);
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            idEmployerSociete: idemployerSociete,
        };

        createConge(payload, () => {
            setSuccessMessage("✅ Congé enregistré avec succès !");
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
        .sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));


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

                                        {/* Formulaire visible uniquement si user.roles === 3 */}
                                        {user?.roles === 3 && (
                                            <div className="card shadow p-4 border-0 mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h4>
                                                        <i className="icofont icofont-calendar"></i> Créer un Congé
                                                    </h4>
                                                    {successMessage && (
                                                        <span className="badge badge-success p-2">{successMessage}</span>
                                                    )}
                                                </div>

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
                                                            <label>Motif</label>
                                                            <textarea
                                                                className="form-control"
                                                                name="motif"
                                                                value={formData.motif}
                                                                onChange={handleChange}
                                                                required
                                                            ></textarea>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 text-end">
                                                        <button type="submit" className="btn btn-primary btn-lg">
                                                            <i className="icofont icofont-save"></i> Enregistrer Congé
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
                                                <div className="table-responsive">
                                                    <table className="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>Date Début</th>
                                                                <th>Date Fin</th>
                                                                <th>Motif</th>
                                                                <th>Statut</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {historiqueConge.map((c) => (
                                                                <tr key={c.id}>
                                                                    <td>{new Date(c.dateDebut).toLocaleDateString()}</td>
                                                                    <td>{new Date(c.dateFin).toLocaleDateString()}</td>
                                                                    <td>{c.motif}</td>
                                                                    <td>
                                                                        {c.statut === 1 ? (
                                                                            <span className="badge bg-warning">En attente</span>
                                                                        ) : c.statut === 2 ? (
                                                                            <span className="badge bg-success">Validé</span>
                                                                        ) : (
                                                                            <span className="badge bg-danger">Rejeté</span>
                                                                        )}
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
                                <div id="styleSelector"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateConge;
