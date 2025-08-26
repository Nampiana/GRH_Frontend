// ✅ Service prêt à coller
import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class ParametreGenereauxService {
    getAll() {
        return axios.get(ApiUrl + "/parametre-genereaux", header());
    }

    create(data) {
        return axios.post(ApiUrl + "/parametre-genereaux", data, header());
    }

    update(id, data) {
        return axios.put(ApiUrl + `/parametre-genereaux/${id}`, data, header());
    }

    getOne(id) {
        return axios.get(ApiUrl + `/parametre-genereaux/${id}`, header());
    }

    delete(id) {
        return axios.delete(ApiUrl + `/parametre-genereaux/${id}`, header());
    }
}

export default new ParametreGenereauxService();
