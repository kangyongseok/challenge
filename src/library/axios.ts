import axios from 'axios';

const axiosInstance = axios.create({ baseURL: process.env.API_BASE_URL });

const Axios = {
  getInstance() {
    return axiosInstance;
  },
  setToken(token?: string) {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }
};

export default Axios;
