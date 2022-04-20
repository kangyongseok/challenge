/* eslint @typescript-eslint/no-explicit-any: 'off' */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class Axios {
  private readonly axiosInstance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.axiosInstance = axios.create(config);
  }

  setToken(token?: string) {
    if (token) {
      this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common.Authorization;
    }
  }

  get<D>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<D>(url, config);
  }

  post<D>(url: string, data: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<D>(url, data, config);
  }

  put<D>(url: string, data: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<D>(url, data, config);
  }

  delete<D>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<D>(url, config);
  }
}

export default new Axios({ baseURL: process.env.API_BASE_URL });
