import {ipcRenderer} from 'electron';

export const choisirDossier = async (): Promise<string | undefined> => {
  return ipcRenderer.invoke('choisirDossier');
};
