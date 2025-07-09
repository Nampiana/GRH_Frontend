import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class ServiceServices {
  getAll() {
    return axios.get(ApiUrl + "/service", header());
  }

  create(data) {
    return axios.post(ApiUrl + "/service", data, header());
  }

  update(id, data) {
    return axios.put(ApiUrl + `/service/${id}`, data, header());
  }

  getOne(id) {
    return axios.get(ApiUrl + `/service/${id}`, header());
  }

  delete(id) {
    return axios.delete(ApiUrl + `/service/${id}`, header());
  }
}


export default new ServiceServices();
