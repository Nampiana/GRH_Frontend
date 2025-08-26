import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class SanctionService {
  getAll() {
    return axios.get(ApiUrl + "/sanction", header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/sanction/${id}`, header());
  }

  create(data) {
    return axios.post(ApiUrl + "/sanction", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/sanction/${id}`, data, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/sanction/${id}`, header());
  }
}

export default new SanctionService();
