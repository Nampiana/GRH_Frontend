import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import useContrat from "../../hook/contrat/useContrat";
import contratService from "../../services/contrat/contratService";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import IndividuService from "../../services/individu/individuService";

function GestionContrat() {
    useTemplateScripts();
    const { contrats, fetchContrats, createContrat, deleteContrat } = useContrat();
    const [form, setForm] = useState({});
    const [file, setFile] = useState(null);
    const [employers, setEmployers] = useState([]);
    const [individus, setIndividus] = useState([]);
    const [success, setSuccess] = useState("");

    const fileInputRef = useRef(null);

    const initialForm = {
        idEmployerSociete: "",
        typeContrat: "",
        dateDebut: "",
        dateFin: "",
        salairedebase: "",
        statu: "en cours"
    };


    useEffect(() => {
        fetchContrats();
        EmployerSocieteService.getAll().then((res) => setEmployers(res.data));
        IndividuService.getAll().then((res) => setIndividus(res.data));
    }, []);

    const getNomComplet = (idEmployerSociete) => {
        const emp = employers.find(e => e.id === idEmployerSociete);
        if (!emp) return "Employé inconnu";
        const individu = individus.find(i => i.id === emp.idIndividue);
        if (!individu) return "Inconnu";
        return `${individu.nom} ${individu.prenom}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let filename = "";
        if (file) {
            const res = await contratService.uploadFile(file);
            filename = res.data;
        }

        await createContrat({ ...form, fichierContrat: filename }, () => {
            setSuccess("✅ Contrat ajouté avec succès !");
            setTimeout(() => setSuccess(""), 2000);
            setForm(initialForm);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        });
    };


    const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

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
                                        <h4 className="mb-4 text-primary"><i className="icofont-file-alt"></i> Gestion des Contrats</h4>

                                        {success && (
                                            <div className="alert alert-success">{success}</div>
                                        )}

                                        <div className="card shadow-lg border-0 rounded-4 p-4 bg-light mb-4">
                                            <h5 className="mb-3 text-primary">➕ Ajouter un contrat</h5>
                                            <form onSubmit={handleSubmit} className="row g-3">
                                                <div className="col-md-6">
                                                    <label>Employé</label>
                                                    <select
                                                        className="form-control"
                                                        required
                                                        value={form.idEmployerSociete}
                                                        onChange={e => setForm({ ...form, idEmployerSociete: e.target.value })}
                                                    >
                                                        <option value="">-- Choisir employé --</option>
                                                        {employers.map(emp => {
                                                            const individu = individus.find(i => i.id === emp.idIndividue);
                                                            return (
                                                                <option key={emp.id} value={emp.id}>
                                                                    {individu ? `${individu.nom} ${individu.prenom}` : "Inconnu"}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label>Type de contrat</label>
                                                    <select
                                                        className="form-control"
                                                        required
                                                        value={form.typeContrat}
                                                        onChange={e => {
                                                            const value = e.target.value;
                                                            setForm({ ...form, typeContrat: value, dateFin: value === 'CDI' ? "" : form.dateFin });
                                                        }}
                                                    >
                                                        <option value="">-- Choisir type --</option>
                                                        <option value="CDI">CDI</option>
                                                        <option value="CDD">CDD</option>
                                                        <option value="STAGE">Stage</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label>Date début</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={form.dateDebut}
                                                        onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label>Date fin</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={form.dateFin}
                                                        disabled={form.typeContrat === 'CDI'}
                                                        onChange={e => setForm({ ...form, dateFin: e.target.value })}
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label>Salaire de base</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={form.salairedebase}
                                                        onChange={e => setForm({ ...form, salairedebase: e.target.value })}
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label>Statut</label>
                                                    <select
                                                        className="form-control"
                                                        value={form.statu}
                                                        onChange={e => setForm({ ...form, statu: e.target.value })}
                                                    >
                                                        <option value="">-- Choisir statut--</option>
                                                        <option value="en cours">En cours</option>
                                                        <option value="terminé">Terminé</option>
                                                    </select>
                                                </div>

                                                <div className="col-12">
                                                    <label>Fichier du contrat</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        ref={fileInputRef}
                                                        onChange={e => setFile(e.target.files[0])}
                                                    />
                                                </div>

                                                <div className="col-12 text-end">
                                                    <button type="submit" className="btn btn-outline-primary">
                                                        <i className="icofont-save"></i> Enregistrer
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="card shadow border-0 rounded-4 p-4">
                                            <h5 className="mb-4">📋 Liste des Contrats</h5>
                                            {contrats.length === 0 ? (
                                                <p className="text-muted">Aucun contrat disponible.</p>
                                            ) : (
                                                <div className="row">
                                                    {contrats.map(c => (
                                                        <div className="col-md-6 mb-4" key={c.id}>
                                                            <div className="card h-100 border-0 shadow-sm rounded-4">
                                                                <div className="card-body">
                                                                    <h6 className="card-title text-primary">{getNomComplet(c.idEmployerSociete)}</h6>
                                                                    <p className="mb-1"><strong>Type:</strong> {c.typeContrat}</p>
                                                                   <p className="mb-1"><strong>Période:</strong> {formatDate(c.dateDebut)} ➡ {c.dateFin ? formatDate(c.dateFin) : 'Non défini'}</p>
                                                                    <p className="mb-1"><strong>Salaire:</strong> {c.salairedebase} Ar</p>
                                                                    <p className="mb-1">
                                                                        <strong>Statut:</strong>{" "}
                                                                        <span className={`badge ${c.statu === 'en cours' ? 'bg-success' : 'bg-secondary'}`}>
                                                                            {c.statu}
                                                                        </span>
                                                                    </p>
                                                                    <a
                                                                        href={`http://localhost:8080/uploads/contrat/${c.fichierContrat}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="btn btn-sm btn-outline-dark mt-2"
                                                                    >
                                                                        Voir le contrat
                                                                    </a>
                                                                    <button
                                                                        onClick={() => deleteContrat(c.id)}
                                                                        className="btn btn-sm btn-outline-danger mt-2 ms-2"
                                                                    >
                                                                        <i className="icofont-trash"></i> Supprimer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
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

export default GestionContrat;
