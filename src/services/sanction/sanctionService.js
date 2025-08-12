import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class SanctionServices {
  getAll() {
    return axios.get(ApiUrl + "/sanction", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/sanction", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/sanction/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/sanction/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/sanction/${id}`, header());
  }
}


export default new SanctionServices();
