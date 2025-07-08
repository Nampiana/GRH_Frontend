import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class SocieteServices {
  getAll() {
    return axios.get(ApiUrl + "/societe", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/societe", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/societe/${id}`, data, header());
  }

 getOne(id) {
    return axios.get(ApiUrl + `/societe/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/societe/${id}`, header());
  }

  uploadLogo(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(ApiUrl + "/societe/upload-logo", formData, header("image"));
}


}


export default new SocieteServices();
