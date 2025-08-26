import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class RubriqueCategorieService {
    getAll() {
        return axios.get(ApiUrl + "/rubrique-categorie", header());
    }

    create(data) {
        return axios.post(ApiUrl + "/rubrique-categorie", data, header());
    }

    update(id, data) {
        return axios.put(ApiUrl + `/rubrique-categorie/${id}`, data, header());
    }

    getOne(id) {
        return axios.get(ApiUrl + `/rubrique-categorie/${id}`, header());
    }

    delete(id) {
        return axios.delete(ApiUrl + `/rubrique-categorie/${id}`, header());
    }
}

export default new RubriqueCategorieService();
