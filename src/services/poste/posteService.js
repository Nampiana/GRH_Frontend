import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class ServiceServices {
  getAll() {
    return axios.get(ApiUrl + "/poste", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/poste", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/poste/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/poste/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/poste/${id}`, header());
  }
}


export default new ServiceServices();
