import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class EmployerSocieteService {
  getAll() {
    return axios.get(ApiUrl + "/employer-societe", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/employer-societe", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/employer-societe/${id}`, data, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/employer-societe/${id}`, header());
  }
}

export default new EmployerSocieteService();
