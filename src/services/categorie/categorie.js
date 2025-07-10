import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class CategorieServices {
  getAll() {
    return axios.get(ApiUrl + "/categorie", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/categorie", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/categorie/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/categorie/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/categorie/${id}`, header());
  }
}


export default new CategorieServices();
