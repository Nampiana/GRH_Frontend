import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class PaieMoisService {
    getByEmployerAndMois(idEmployer, moisPaieId) {
        return axios.get(`${ApiUrl}/paieMois`, {
            ...header(),
            params: { idEmployer, moisPaieId }
        });
    }
    upsert(data) { return axios.post(`${ApiUrl}/paieMois/upsert`, data, header()); }
    // tu peux garder tes CRUD si tu en as déjà
}
export default new PaieMoisService();