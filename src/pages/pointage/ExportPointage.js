import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ important !

const ExportPointage = ({ pointage, employers, individus, postes, services }) => {
  // Récupérer les détails de l’employé
  const getEmployerDetails = (idEmployerSociete) => {
    const employer = employers.find(e => e.id === idEmployerSociete);
    if (!employer) return {};

    const individu = individus.find(i => i.id === employer.idIndividue);
    const poste = postes.find(p => p.id === employer.idPoste);
    const service = services.find(s => s.id === employer.idService);

    return {
      nom: individu?.nom || "",
      prenom: individu?.prenom || "",
      poste: poste?.nomPoste || "",
      service: service?.nomService || "",
    };
  };

  // 📥 Export Excel
  const exportExcel = () => {
    const exportData = pointage.map((p) => {
      const details = getEmployerDetails(p.idEmployerSociete);
      return {
        Employé: `${details.nom} ${details.prenom}`,
        Poste: details.poste,
        Service: details.service,
        Arrivée: new Date(p.dateArriver).toLocaleString("fr-FR"),
        Départ: p.dateDepart ? new Date(p.dateDepart).toLocaleString("fr-FR") : "—",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pointage");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "pointage.xlsx");
  };

  // 🧾 Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Liste des pointages", 14, 10);

    const rows = pointage.map(p => {
      const details = getEmployerDetails(p.idEmployerSociete);
      return [
        `${details.nom} ${details.prenom}`,
        details.poste,
        details.service,
        new Date(p.dateArriver).toLocaleString("fr-FR"),
        p.dateDepart ? new Date(p.dateDepart).toLocaleString("fr-FR") : "—"
      ];
    });

    autoTable(doc, {
      head: [["Employé", "Poste", "Service", "Arrivée", "Départ"]],
      body: rows,
      startY: 20,
    });

    doc.save("pointage.pdf");
  };

 return (
  <div className="d-flex justify-content-between mt-4 px-3">
    <button className="btn btn-success" onClick={exportExcel}>
      📥 Exporter Excel
    </button>
    <button className="btn btn-danger" onClick={exportPDF}>
      🧾 Exporter PDF
    </button>
  </div>
);
};

export default ExportPointage;
