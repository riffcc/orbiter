import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios';
import {type IpcMainInvokeEvent, ipcMain} from 'electron';

const requêteHttp = async (
  _événement: IpcMainInvokeEvent,
  args: {url: string; config?: AxiosRequestConfig},
): Promise<AxiosResponse['data']> => {
  return (await axios.get(args.url, args.config)).data;
};

export const connecterHttp = () => {
  ipcMain.handle('requêteHttp', requêteHttp);
};
