import axios from "axios";
import { ApiUrl, header } from "../../utils/modules";
// import { header } from "../utils/modules";

class AuthServices {
    login(credentials) {
      console.log(credentials);
      // Ajoutez un return ici pour s'assurer que la promesse est bien retournée
      return axios.post(`${ApiUrl}/auth/login`, credentials);
    }
  

//   register(credentials) {
//     return axios.post(`${ApiUrl}auth/register`, credentials);
//   }

  checkToken(token) {
    return axios.get(`${ApiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  }

//   update(credentials, id) {
//     return axios.patch(`${ApiUrl}user/${id}`, credentials, header());
//   }

updatePassword(id, passwordData) {
  return axios.patch(`${ApiUrl}/auth/updateMyPassword/${id}`, passwordData, header());
}


  logout() {
    const token = localStorage.getItem('access_token');
    return axios.post(`${ApiUrl}/auth/logout`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default new AuthServices();