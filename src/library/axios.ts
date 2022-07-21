import qs from 'qs';
import axios from 'axios';

import LocalStorage from '@library/localStorage';

import { ACCESS_TOKEN } from '@constants/localStorage';

const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'comma' })
});

const accessToken = LocalStorage.get<string>(ACCESS_TOKEN);

if (accessToken) axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

const Axios = {
  getInstance() {
    return axiosInstance;
  },
  getAccessToken() {
    return axiosInstance.defaults.headers.common.Authorization;
  },
  setAccessToken(token: string) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  clearAccessToken() {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

export default Axios;
