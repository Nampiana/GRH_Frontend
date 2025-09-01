import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";

class CyclePaieService {
    ouvrir(data) { // { idSociete, periode: "YYYY-MM" }
        return axios.post(ApiUrl + "/cycle-paie/ouvrir", data, header());
    }
    cloturer(moisPaieId) {
        return axios.post(ApiUrl + `/cycle-paie/cloturer/${moisPaieId}`, {}, header());
    }
}

export default new CyclePaieService();
