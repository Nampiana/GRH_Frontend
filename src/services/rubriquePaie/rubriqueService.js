// ✅ Service RubriquePaie
import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class RubriqueService {
    getAll() {
        return axios.get(ApiUrl + "/rubrique", header());
    }

    create(data) {
        return axios.post(ApiUrl + "/rubrique", data, header());
    }

    update(id, data) {
        return axios.put(ApiUrl + `/rubrique/${id}`, data, header());
    }

    getOne(id) {
        return axios.get(ApiUrl + `/rubrique/${id}`, header());
    }

    delete(id) {
        return axios.delete(ApiUrl + `/rubrique/${id}`, header());
    }
}

export default new RubriqueService();
