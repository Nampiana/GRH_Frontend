import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class ServiceServices {
  getAll() {
    return axios.get(ApiUrl + "/individu", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/individu", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/individu/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/individu/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/individu/${id}`, header());
  }

  changePassword(id, data) {
    return axios.put(ApiUrl + `/individu/${id}/password`, data, header());
  }

}


export default new ServiceServices();
