import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class EmployerSocieteService {
  getAll() {
    return axios.get(ApiUrl + "/employer-societe", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/employer-societe", data, header());
  }

  updateComplete(id, data) {
    return axios.put(ApiUrl + `/employer-societe/update-complete/${id}`, data, header());
  }

  deleteComplete(id) {
    return axios.delete(ApiUrl + `/employer-societe/delete-complete/${id}`, header());
  }

  getByUtilisateur(idUtilisateur) {
    return axios.get(ApiUrl + `/employer-societe/by-utilisateur/${idUtilisateur}`, header());
  }
}

export default new EmployerSocieteService();
