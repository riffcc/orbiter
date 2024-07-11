import type {AxiosRequestConfig, AxiosResponse} from 'axios';
import {ipcRenderer} from 'electron';

export const requêteHttp = async (
  url: string,
  config: AxiosRequestConfig,
): Promise<AxiosResponse['data']> => {
  return ipcRenderer.invoke('requêteHttp', {url, config});
};
