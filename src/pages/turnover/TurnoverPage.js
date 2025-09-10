import React, { useEffect, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTurnover from "../../hook/turnover/useTurnover";
import RiskBadge from "../../components/RiskBadge";

export default function TurnoverPage(){
  const {items,loading,fetchTop,refresh} = useTurnover();
  const [idSociete,setIdSociete] = useState("");

  useEffect(()=>{ if(idSociete) fetchTop(idSociete,20); },[idSociete]);

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar/>
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar/>
            <div className="pcoded-content">
              <div className="pcoded-inner-content">
                <div className="main-body">
                  <div className="page-wrapper">
                    <div className="page-body">
                      <div className="card p-3">
                        <div className="d-flex gap-2 align-items-center mb-3">
                          <input className="form-control w-auto" placeholder="ID Société" value={idSociete} onChange={e=>setIdSociete(e.target.value)} />
                          <button className="btn btn-primary btn-sm" disabled={!idSociete||loading} onClick={()=>refresh(idSociete)}>
                            {loading?"Calcul...":"Rafraîchir les scores"}
                          </button>
                        </div>
                        <table className="table table-sm">
                          <thead><tr><th>Employé</th><th>Score</th><th>Niveau</th><th>Calculé le</th></tr></thead>
                          <tbody>
                            {items.map(r=>(
                              <tr key={r.idEmployerSociete}>
                                <td>{r.idEmployerSociete}</td>
                                <td>{(r.riskScore ?? 0).toFixed(2)}</td>
                                <td><RiskBadge level={r.riskLevel}/></td>
                                <td>{new Date(r.computedAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
