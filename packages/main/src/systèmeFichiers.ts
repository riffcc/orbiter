import {dialog, ipcMain, type IpcMainInvokeEvent} from 'electron';

const choisirDossier = async (_événement: IpcMainInvokeEvent): Promise<string | undefined> => {
  return (
    await dialog.showOpenDialog({
      properties: ['openDirectory', 'promptToCreate'],
    })
  ).filePaths[0];
};

export const connecterSystèmeFichiers = () => {
  ipcMain.handle('choisirDossier', choisirDossier);
};
