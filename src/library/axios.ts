import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({ baseURL: process.env.API_BASE_URL });

const axios = {
  setToken(token?: string) {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  },
  get<T>(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.get<T>(url, config);
  },
  post<T>(url: string, data: any, config?: AxiosRequestConfig) {
    return axiosInstance.post<T>(url, data, config);
  },
  put<T>(url: string, data: any, config?: AxiosRequestConfig) {
    return axiosInstance.put<T>(url, data, config);
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.delete<T>(url, config);
  }
};

export default axios;
