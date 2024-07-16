import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios';
import {ipcMain, type IpcMainInvokeEvent} from 'electron';

const requêteHttp = async (
  _événement: IpcMainInvokeEvent,
  args: {url: string; config?: AxiosRequestConfig},
): Promise<AxiosResponse['data']> => {
  return (await axios.get(args.url, args.config)).data;
};

export const connecterHttp = () => {
  ipcMain.handle('requêteHttp', requêteHttp);
};
