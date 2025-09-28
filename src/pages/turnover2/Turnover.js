import React, { useEffect, useState } from "react";
import { Card, Button, Table, Form, Badge, ProgressBar, Alert, Spinner } from "react-bootstrap";
import useTurnover from "../../hook/turnover2/useTurnover";
import SocieteServices from "../../services/societe/societeService";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";

function RiskBadge({ score = 0 }) {
  let variant = "success";
  if (score >= 0.7) variant = "danger";
  else if (score >= 0.5) variant = "warning";
  return <Badge bg={variant}>{(score * 100).toFixed(0)}%</Badge>;
}

export default function Turnover() {
  const [societes, setSocietes] = useState([]);
  const [selectedSociete, setSelectedSociete] = useState("");
  const { riskRows, allRows, threshold, setThreshold, predict, loading, errorMsg } = useTurnover();

  // Charger les sociétés
  useEffect(() => {
    SocieteServices.getAll()
      .then(r => {
        const data = r?.data;
        const arr = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
        setSocietes(arr);
      })
      .catch(console.error);
  }, []);

  const handlePredict = () => {
    // IMPORTANT: envoyer "threshold" et non "th"
    predict({ idSociete: selectedSociete, threshold });
  };

  const total = Array.isArray(allRows) ? allRows.length : 0;
  const alerts = Array.isArray(riskRows) ? riskRows.length : 0;
  const ratio = total ? Math.min(100, (alerts / total) * 100) : 0;

  return (
    <div id="pcoded" className="pcoded">
      <div className="pcoded-container navbar-wrapper">
        <Topbar />
        <div className="pcoded-main-container">
          <div className="pcoded-wrapper">
            <Sidebar />
            <div className="pcoded-content">
              <div className="pcoded-inner-content">
                <div className="main-body">
                  <div className="page-wrapper">
                    <div className="page-body">
                      <Card className="p-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h4 className="fw-bold text-primary">Prédiction du Turnover</h4>
                          <div className="d-flex flex-wrap gap-3 align-items-center">
                            <Form.Select
                              value={selectedSociete}
                              onChange={(e) => setSelectedSociete(e.target.value)}
                              style={{ minWidth: 220 }}
                              disabled={loading}
                            >
                              <option value="">Toutes les sociétés</option>
                              {societes.map(s => (
                                <option value={s.id || s._id} key={s.id || s._id}>
                                  {s.nomSociete}
                                </option>
                              ))}
                            </Form.Select>

                            <div style={{ width: 260 }}>
                              <div className="d-flex align-items-center gap-2">
                                <small>Seuil</small>
                                <Badge bg="secondary">{Math.round(threshold * 100)}%</Badge>
                              </div>
                              <Form.Range
                                min={0}
                                max={100}
                                value={Math.round(threshold * 100)}
                                onChange={(e) => setThreshold(Number(e.target.value) / 100)}
                                disabled={loading}
                              />
                            </div>

                            <Button onClick={handlePredict} disabled={loading}>
                              {loading ? (<><Spinner size="sm" className="me-2" /> Prédiction...</>) : "Prédire"}
                            </Button>
                          </div>
                        </div>

                        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

                        <div className="mb-2">
                          <small className="text-muted">
                            {alerts} employé(s) à risque (score ≥ {(threshold * 100).toFixed(0)}%) sur {total} analysé(s)
                          </small>
                          <ProgressBar now={ratio} />
                        </div>

                        <div className="table-responsive mt-3">
                          <Table hover className="table-striped align-middle">
                            <thead>
                              <tr>
                                <th>Employé</th>
                                <th>Score</th>
                                <th>Absences (6m)</th>
                                <th>Retards (6m)</th>
                                <th>Sanctions (12m)</th>
                                <th>Ancienneté (mois)</th>
                                <th>Raisons</th>
                              </tr>
                            </thead>
                            <tbody>
                              {alerts > 0 ? (
                                riskRows.map((r, i) => (
                                  <tr key={(r.employeeId || "emp") + "_" + i}>
                                    <td>{r.employeeName || `#${r.employeeId?.slice?.(-6) || r.employeeId}`}</td>
                                    <td><RiskBadge score={r.score ?? 0} /></td>
                                    <td>
                                      {r.nbAbsences6m ?? r.nb_absences_6m ?? 0}
                                      {" "}
                                      ({(r.joursAbsences6m ?? r.jours_absences_6m ?? 0).toFixed?.(0) ?? 0} j)
                                    </td>
                                    <td>
                                      {r.nbRetards6m ?? r.nb_retards_6m ?? 0}
                                      {" "}
                                      (moy {(r.moyRetardMinutes3m ?? r.moy_retard_minutes_3m ?? 0).toFixed(1)} min)
                                    </td>
                                    <td>
                                      {(r.nbSanctions12m ?? r.nb_sanctions_12m ?? 0)}
                                      {((r.nbSanctionsGraves12m ?? r.nb_sanctions_graves_12m) > 0) &&
                                        <Badge bg="danger" className="ms-1">grave</Badge>}
                                    </td>
                                    <td>{r.ancienneteMois ?? r.anciennete_mois ?? 0}</td>
                                    <td>
                                      {Array.isArray(r.reasons) && r.reasons.length > 0
                                        ? r.reasons.map((x, idx) => (
                                            <Badge key={idx} bg="light" text="dark" className="me-1">{x}</Badge>
                                          ))
                                        : <span className="text-muted">—</span>}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="text-center text-muted py-4">
                                    Aucune donnée à afficher. Lance une prédiction ou insère des données.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>

                        <details className="mt-3">
                          <summary className="text-muted">Voir toutes les prédictions</summary>
                          <div className="table-responsive mt-2">
                            <Table hover size="sm" className="align-middle">
                              <thead>
                                <tr>
                                  <th>Employé</th>
                                  <th>Score</th>
                                  <th>Abs(6m)</th>
                                  <th>Ret(6m)</th>
                                  <th>San(12m)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(allRows || []).map((r, i) => (
                                  <tr key={"all_" + (r.employeeId || i)}>
                                    <td>{r.employeeName || `#${r.employeeId?.slice?.(-6) || r.employeeId}`}</td>
                                    <td>{((r.score ?? 0) * 100).toFixed(0)}%</td>
                                    <td>{r.nbAbsences6m ?? r.nb_absences_6m ?? 0}</td>
                                    <td>{r.nbRetards6m ?? r.nb_retards_6m ?? 0}</td>
                                    <td>{r.nbSanctions12m ?? r.nb_sanctions_12m ?? 0}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </details>

                      </Card>
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
