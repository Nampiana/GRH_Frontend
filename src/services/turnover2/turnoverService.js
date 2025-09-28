// src/services/turnover/turnoverService.js
import axios from "axios";
import { ApiUrl, header } from "../../utils/modules"; // comme vos autres services

function toCamel(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  return Object.keys(obj).reduce((acc, k) => {
    const ck = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    acc[ck] = toCamel(obj[k]);
    return acc;
  }, {});
}

class TurnoverService {
  async predict({ idSociete, threshold = 0.6 } = {}) {
    const params = new URLSearchParams();
    if (idSociete) params.append("idSociete", idSociete);
    if (threshold !== undefined) params.append("threshold", threshold);

    const url = `${ApiUrl}/turnoverss/predict?${params.toString()}`;
    const res = await axios.get(url, header());
    // Normalise en camelCase pour le hook/UI
    const data = toCamel(res?.data || {});
    // Garantit la présence des tableaux
    return {
      data: {
        rowsAtRisk: Array.isArray(data.rowsAtRisk) ? data.rowsAtRisk : (data.rows_at_risk || []),
        allRows: Array.isArray(data.allRows) ? data.allRows : (data.all_rows || []),
        threshold: typeof data.threshold === "number" ? data.threshold : threshold
      }
    };
  }
}

export default new TurnoverService();
