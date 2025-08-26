import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class PaieService {
    calculer(idEmployer, moisPaieId) {
        return axios.get(`${ApiUrl}/paie/calculer`, {
            ...header(),
            params: { idEmployer, moisPaieId }
        });
    }
    enregistrer(payload) {
        return axios.post(`${ApiUrl}/paie/enregistrer`, payload, header());
    }
}
export default new PaieService();