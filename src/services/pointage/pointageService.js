import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class PointageServices {
  getAll() {
    return axios.get(ApiUrl + "/pointage", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/pointage", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/pointage/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/pointage/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/pointage/${id}`, header());
  }
}

export default new PointageServices();
