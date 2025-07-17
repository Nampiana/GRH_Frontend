import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class UtilisateurServices {
  getAll() {
    return axios.get(ApiUrl + "/utilisateur", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/utilisateur", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/utilisateur/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/utilisateur/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/utilisateur/${id}`, header());
  }
}


export default new UtilisateurServices();
