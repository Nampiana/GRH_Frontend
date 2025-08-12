// src/services/contrat/contratService.js
import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class ContratService {
  getAll() {
    return axios.get(ApiUrl + "/contrat", header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/contrat/${id}`, header());
  }

  create(data) {
    return axios.post(ApiUrl + "/contrat", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/contrat/${id}`, data, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/contrat/${id}`, header());
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(ApiUrl + "/contrat/upload", formData, {
      headers: {
        ...header().headers,
        "Content-Type": "multipart/form-data"
      }
    });
  }

  updateWithFile(id, data, file) {
  const formData = new FormData();
  formData.append("contrat", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }
  return axios.put(ApiUrl + `/contrat/update-with-file/${id}`, formData, {
    headers: {
      ...header().headers,
      "Content-Type": "multipart/form-data"
    }
  });
}

}

export default new ContratService();
