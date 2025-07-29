import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class CongeServices {
  getAll() {
    return axios.get(ApiUrl + "/conge", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/conge", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/conge/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/conge/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/conge/${id}`, header());
  }

  uploadJustificatif(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    return axios.post(`${ApiUrl}/conge/upload-justification`, formData, {
      headers: {
        ...header().headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }
}


export default new CongeServices();
