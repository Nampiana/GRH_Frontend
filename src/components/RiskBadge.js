export default function RiskBadge({level}){
  const cls = level==="Élevé"?"badge bg-danger":level==="Moyen"?"badge bg-warning text-dark":"badge bg-success";
  return <span className={cls}>{level || "—"}</span>;
}
