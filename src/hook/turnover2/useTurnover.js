import { useState } from "react";
import TurnoverService from "../../services/turnover2/turnoverService";

export default function useTurnover() {
  const [riskRows, setRiskRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [threshold, setThreshold] = useState(0.6);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const predict = async ({ idSociete, threshold: th }) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await TurnoverService.predict({ idSociete, threshold: th ?? threshold });
      console.log("data pr ", data)

      // data = { rowsAtRisk, allRows, threshold }
      setRiskRows(Array.isArray(data.rowsAtRisk) ? data.rowsAtRisk : []);
      setAllRows(Array.isArray(data.allRows) ? data.allRows : []);
      if (typeof data.threshold === "number") setThreshold(data.threshold);
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur lors de la prédiction. Vérifie le backend et le service ML.");
      setRiskRows([]);
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  return { riskRows, allRows, threshold, setThreshold, predict, loading, errorMsg };
}
