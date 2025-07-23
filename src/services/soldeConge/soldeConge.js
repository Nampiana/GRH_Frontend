import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class SoldeCongeServices {
  getAll() {
    return axios.get(ApiUrl + "/soldeconge", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/soldeconge", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/soldeconge/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/soldeconge/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/soldeconge/${id}`, header());
  }

  getSoldeByEmployerId(idEmployerSociete){
    return axios.get(ApiUrl + `/soldeconge/employe/${idEmployerSociete}`, header());
  }
}


export default new SoldeCongeServices();
