import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class DepartementServices {
  getAll() {
    return axios.get(ApiUrl + "/departement", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/departement", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/departement/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/departement/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/departement/${id}`, header());
  }
}


export default new DepartementServices();
