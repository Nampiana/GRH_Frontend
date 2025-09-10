import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class TurnoverService {
  refresh(idSociete){ return axios.post(`${ApiUrl}/turnover/refresh/${idSociete}`, {}, header()); }
  top(idSociete, n=20){ return axios.get(`${ApiUrl}/turnover/top/${idSociete}?n=${n}`, header()); }
}
export default new TurnoverService();
