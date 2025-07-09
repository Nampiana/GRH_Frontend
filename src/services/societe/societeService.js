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

  getAllPaginated(page = 0, size = 6) {
    return axios.get(`${ApiUrl}/societe?page=${page}&size=${size}`, header());
  }

  search(keyword, page = 0, size = 6) {
    return axios.get(`${ApiUrl}/societe/search`, {
      params: { keyword, page, size },
      ...header()
    });
  }




}


export default new SocieteServices();
