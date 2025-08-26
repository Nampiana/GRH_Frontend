import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class MoisPaieService {
    getAll() {
        return axios.get(ApiUrl + "/moispaie", header());
    }

    create(data) {
        return axios.post(ApiUrl + "/moispaie", data, header());
    }

    update(id, data) {
        return axios.put(ApiUrl + `/moispaie/${id}`, data, header());
    }

    getOne(id) {
        return axios.get(ApiUrl + `/moispaie/${id}`, header());
    }

    delete(id) {
        return axios.delete(ApiUrl + `/moispaie/${id}`, header());
    }
}

export default new MoisPaieService();
