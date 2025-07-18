import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class CongeServices {
  getAll() {
    return axios.get(ApiUrl + "/conge", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/conge", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/conge/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/conge/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/conge/${id}`, header());
  }
}


export default new CongeServices();
