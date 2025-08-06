import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ExportPointage = ({ pointage }) => {

  // 📄 Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(pointage);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pointage");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "pointage.xlsx");
  };

  // 🧾 Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des pointages", 14, 10);

    const columns = [
      { header: "Employé", dataKey: "nom" },
      { header: "Arrivée", dataKey: "dateArriver" },
      { header: "Départ", dataKey: "dateDepart" },
    ];

    const rows = pointage.map(p => ({
      nom: p.nomComplet || p.nom || "N/A", // adapte selon ta structure
      dateArriver: new Date(p.dateArriver).toLocaleString(),
      dateDepart: p.dateDepart ? new Date(p.dateDepart).toLocaleString() : "—"
    }));

    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: rows.map(row => Object.values(row)),
      startY: 20
    });

    doc.save("pointage.pdf");
  };

  return (
    <div className="mb-3 d-flex gap-2">
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
