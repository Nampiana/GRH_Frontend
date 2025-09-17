import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import useTemplateScripts from "../../utils/useTemplateScripts";
import usePaie from "../../hook/paie/usePaie";

import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";
import MoisPaieService from "../../services/moispaie/moisPaieService";
import PaieMoisService from "../../services/paieMois/paieMoisService";
import IndividuServices from "../../services/individu/individuService";
import CategorieServices from "../../services/categorie/categorie";
import useRubriquePaie from "../../hook/rubriquePaie/useRubriquePaie";

function PaieEmployer() {
  useTemplateScripts();
  const { bulletin, loading, calculer, enregistrer, setBulletin } = usePaie();

  const [employers, setEmployers] = useState([]);
  const [mois, setMois] = useState([]);
  const [idEmployer, setIdEmployer] = useState("");
  const [moisPaieId, setMoisPaieId] = useState("");

  const [individusById, setIndividusById] = useState({});
  const [categoriesById, setCategoriesById] = useState({});
  const [saisies, setSaisies] = useState([]);

  // Récupérer toutes les rubriques de paie (pour les boutons dynamiques)
  const { rubriques: allRubriques } = useRubriquePaie();

  const toArray = (data) => (Array.isArray(data) ? data : data?.content || []);

  useEffect(() => {
    EmployerSocieteService.getAll()
      .then((r) => setEmployers(toArray(r.data)))
      .catch(console.error);
    MoisPaieService.getAll()
      .then((r) => setMois(toArray(r.data)))
      .catch(console.error);

    IndividuServices.getAll()
      .then((res) => {
        const arr = toArray(res.data);
        const map = {};
        arr.forEach((x) => {
          if (x?.id) map[x.id] = x;
        });
        setIndividusById(map);
      })
      .catch(console.error);

    CategorieServices.getAll()
      .then((res) => {
        const arr = toArray(res.data);
        const map = {};
        arr.forEach((x) => {
          if (x?.id) map[x.id] = x;
        });
        setCategoriesById(map);
      })
      .catch(console.error);
  }, []);

  const employersSorted = useMemo(() => {
    const withNames = employers.map((e) => {
      const ind = individusById[e.idIndividue] || {};
      return { ...e, _nom: ind.nom || "", _prenom: ind.prenom || "" };
    });
    return withNames.sort((a, b) => {
      const an = `${a._nom} ${a._prenom}`.trim().toLowerCase();
      const bn = `${b._nom} ${b._prenom}`.trim().toLowerCase();
      return an.localeCompare(bn);
    });
  }, [employers, individusById]);

  // Ajout d'une ligne manuelle (SB exclu)
  const addLigne = (code, libelle, operation) => {
    if ((code || "").toUpperCase() === "SB") return; // sécurité
    setSaisies((prev) => [...prev, { code, libelle, operation, montant: 0 }]);
  };

  // Mettre à jour le montant d'une ligne
  const updateMontant = (idx, val) => {
    const copy = [...saisies];
    copy[idx].montant = Number(val || 0);
    setSaisies(copy);
  };

  // Retirer une ligne
  const removeLigne = (idx) => {
    setSaisies((prev) => prev.filter((_, i) => i !== idx));
  };

  // Filtrer les mois par société de l'employé sélectionné
  const moisFiltres = useMemo(() => {
    if (!idEmployer) return mois;
    const emp = employers.find((e) => e.id === idEmployer);
    if (!emp) return mois;
    return mois.filter((m) => !m.idSociete || m.idSociete === emp.idSociete);
  }, [mois, idEmployer, employers]);

  const selectedMois = useMemo(
    () => mois.find((m) => m.id === moisPaieId),
    [mois, moisPaieId]
  );
  const isClosed = selectedMois?.statut === "CLOSED";

  // Employé sélectionné (pour connaître sa société / statut / SB)
  const selectedEmployer = useMemo(
    () => employers.find((e) => e.id === idEmployer),
    [employers, idEmployer]
  );
  const isTerminated = !!selectedEmployer?.dateDebauche;

  // Rubriques MANUELLES (sans idParametreGenereaux), même société, et SB exclu
  const rubriquesManuelles = useMemo(() => {
    if (!allRubriques || allRubriques.length === 0) return [];
    const idSoc = selectedEmployer?.idSociete;
    return (allRubriques || [])
      .filter((r) => !r.idParametreGenereaux)
      .filter((r) => (r.code || "").toUpperCase() !== "SB") // ⛔ exclure SB
      .filter((r) => !idSoc || r.idSociete === idSoc)
      .map((r) => ({
        id: r.id,
        code: r.code,
        libelle: r.nomRubrique,
        operation: typeof r.operation === "number" ? r.operation : 1,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [allRubriques, selectedEmployer]);

  // Savoir si une rubrique est déjà ajoutée dans les saisies
  const isInSaisies = (code) => saisies.some((s) => s.code === code);

  const handleCalculer = () => {
    if (!idEmployer || !moisPaieId || isClosed || isTerminated) return;

    const bodyUpsert = {
      idEmployer,
      moisPaieId,
      lignes: saisies.map((s) => ({
        code: s.code,
        montant: s.montant,
        note: s.libelle,
      })),
    };

    PaieMoisService.upsert(bodyUpsert)
      .then(() => calculer(idEmployer, moisPaieId))
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Erreur lors de l'upsert/calcul";
        alert(msg);
      });
  };

  const handleEnregistrer = () => {
    if (!bulletin || isClosed) return;
    enregistrer(
      { idEmployer, moisPaieId, lignes: bulletin.lignes },
      () => alert("Bulletin enregistré !")
    );
  };

  const renderEmployerOptionLabel = (e) => {
    const ind = individusById[e.idIndividue];
    const cat = categoriesById[e.idCategorie];
    const nomPrenom = ind
      ? `${ind.nom || ""} ${ind.prenom || ""}`.trim()
      : e.idIndividue;
    const catLabel = cat ? cat.nomCategorie : "N/A";
    return `${nomPrenom} — ${catLabel}`;
  };

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
                      {/* Section de sélection de l'employé et du mois */}
                      <div className="card">
                        <div className="card-header">
                          <h5>
                            <i className="feather icon-dollar-sign me-2"></i>
                            Calcul de paie par employé
                          </h5>
                        </div>
                        <div className="card-block p-4">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Employé</label>
                              <select
                                className="form-control"
                                value={idEmployer}
                                onChange={(e) => {
                                  setIdEmployer(e.target.value);
                                  setBulletin(null);
                                }}
                              >
                                <option value="">
                                  -- Sélectionner un employé --
                                </option>
                                {Array.isArray(employersSorted) &&
                                  employersSorted.map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {renderEmployerOptionLabel(e)}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Mois de paie</label>
                              <select
                                className="form-control"
                                value={moisPaieId}
                                onChange={(e) => {
                                  setMoisPaieId(e.target.value);
                                  setBulletin(null);
                                }}
                              >
                                <option value="">-- Sélectionner un mois --</option>
                                {Array.isArray(moisFiltres) &&
                                  moisFiltres.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {(m.periode || "").slice(0, 7)}{" "}
                                      {m.statut === "CLOSED" ? " (Clôturé)" : ""}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {selectedEmployer && (
                            <div className="alert alert-info border mt-3 p-3">
                              <h6 className="alert-heading m-0">
                                Détails de l'employé
                              </h6>
                              <hr className="my-2" />
                              <div>
                                <strong>Salaire de base (contrat) :</strong>{" "}
                                <span className="text-primary fw-bold">
                                  {Number(
                                    selectedEmployer.salaireBase || 0
                                  ).toLocaleString("fr-FR")}
                                  <span className="ms-1">MGA</span>
                                </span>
                              </div>
                              <small className="text-muted">
                                Embauché le{" "}
                                {new Date(
                                  selectedEmployer.dateEmbauche
                                ).toLocaleDateString("fr-FR")}
                                {selectedEmployer.dateDebauche &&
                                  ` · Débauché le ${new Date(
                                    selectedEmployer.dateDebauche
                                  ).toLocaleDateString("fr-FR")}`}
                              </small>
                              {isTerminated && (
                                <div className="text-danger mt-2">
                                  <i className="feather icon-alert-triangle me-1"></i>
                                  Employé débauché - le calcul de paie est
                                  désactivé.
                                </div>
                              )}
                            </div>
                          )}
                          {isClosed && (
                            <div className="alert alert-warning mt-3">
                              <i className="feather icon-lock me-1"></i>
                              Ce mois est <b>clôturé</b>. Le calcul et
                              l'enregistrement sont désactivés pour ce bulletin.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section des saisies manuelles */}
                      <div className="card mt-3">
                        <div className="card-header">
                          <h5>
                            <i className="feather icon-edit-3 me-2"></i>
                            Saisies manuelles
                          </h5>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {rubriquesManuelles.length === 0 ? (
                              <span className="text-muted">
                                Aucune rubrique manuelle disponible pour cette
                                société.
                              </span>
                            ) : (
                              rubriquesManuelles.map((r) => (
                                <button
                                  key={r.id}
                                  className={`btn btn-sm ${r.operation === 1
                                    ? "btn-outline-primary"
                                    : "btn-outline-danger"
                                    }`}
                                  onClick={() =>
                                    addLigne(r.code, r.libelle, r.operation)
                                  }
                                  disabled={
                                    isClosed || isTerminated || isInSaisies(r.code)
                                  }
                                  title={r.libelle}
                                >
                                  {r.operation === 1 ? (
                                    <i className="feather icon-plus me-1"></i>
                                  ) : (
                                    <i className="feather icon-minus me-1"></i>
                                  )}
                                  {r.code}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="card-block p-4">
                          {saisies.length === 0 ? (
                            <div className="text-muted text-center py-4">
                              <i className="feather icon-info me-1"></i>
                              Aucune ligne. Utilisez les boutons ci-dessus pour en ajouter.
                            </div>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-hover table-sm">
                                <thead>
                                  <tr>
                                    <th>Code</th>
                                    <th>Libellé</th>
                                    <th>Opération</th>
                                    <th>Montant</th>
                                    <th className="text-center">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {saisies.map((l, idx) => (
                                    <tr key={idx}>
                                      <td>
                                        <strong>{l.code}</strong>
                                      </td>
                                      <td>{l.libelle}</td>
                                      <td>
                                        <span
                                          className={`badge ${l.operation === 1
                                            ? "bg-success"
                                            : "bg-danger"
                                            }`}
                                        >
                                          {l.operation === 1 ? "+" : "-"}
                                        </span>
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={l.montant}
                                          onChange={(e) =>
                                            updateMontant(idx, e.target.value)
                                          }
                                          disabled={isClosed || isTerminated}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <button
                                          type="button"
                                          className="btn btn-danger btn-sm"
                                          onClick={() => removeLigne(idx)}
                                          disabled={isClosed || isTerminated}
                                          title="Retirer cette ligne"
                                        >
                                          <i className="feather icon-trash-2 me-1"></i>
                                          Supprimer
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="d-flex justify-content-end mt-3">
                            <button
                              className="btn btn-primary"
                              disabled={
                                !idEmployer || !moisPaieId || isClosed || isTerminated
                              }
                              onClick={handleCalculer}
                            >
                              {loading ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                  ></span>
                                  Calcul en cours...
                                </>
                              ) : (
                                <>
                                  <i className="feather icon-refresh-cw me-2"></i>
                                  Calculer
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Section du résultat du bulletin */}
                      {bulletin && (
                        <div className="card mt-3">
                          <div className="card-header">
                            <h5>
                              <i className="feather icon-file-text me-2"></i>
                              Bulletin de paie
                            </h5>
                          </div>
                          <div className="card-block p-4">
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th>Code</th>
                                    <th>Libellé</th>
                                    <th>Op</th>
                                    <th>Taux %</th>
                                    <th>Montant (MGA)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bulletin.lignes.map((l, i) => (
                                    <tr key={i}>
                                      <td>
                                        <strong>{l.code}</strong>
                                      </td>
                                      <td>{l.libelle}</td>
                                      <td>
                                        <span
                                          className={`badge ${l.operation === 1
                                            ? "bg-success"
                                            : "bg-danger"
                                            }`}
                                        >
                                          {l.operation === 1 ? "+" : "-"}
                                        </span>
                                      </td>
                                      <td>{l.taux ? `${l.taux}%` : "-"}</td>
                                      <td>
                                        {Number(l.montant).toLocaleString("fr-FR")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="table-success">
                                    <th colSpan="4" className="text-end">
                                      Net à payer
                                    </th>
                                    <th>
                                      {Number(bulletin.netAPayer).toLocaleString(
                                        "fr-FR"
                                      )}
                                    </th>
                                  </tr>
                                  <tr className="table-primary">
                                    <th colSpan="4" className="text-end">
                                      Brut
                                    </th>
                                    <th>
                                      {Number(bulletin.brut).toLocaleString("fr-FR")}
                                    </th>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-3">
                              <button
                                className="btn btn-success"
                                onClick={handleEnregistrer}
                                disabled={isClosed}
                              >
                                <i className="feather icon-save me-2"></i>
                                Enregistrer
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => setBulletin(null)}
                              >
                                <i className="feather icon-x me-2"></i>
                                Réinitialiser
                              </button>
                            </div>
                          </div>
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

export default PaieEmployer;
