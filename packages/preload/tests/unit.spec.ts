import {expect, test, vi} from 'vitest';

import type {messageDeServeur, messageInitServeur} from '@constl/mandataire-electron-principal';
import type {IpcRendererEvent} from 'electron';

import {attente} from '@constl/utils-tests';
import EventEmitter from 'events';
import {v4 as uuidv4} from 'uuid';

import type {mandataire} from '@constl/ipa';
import {
  envoyerMessageÀConstellation,
  envoyerMessageÀServeurConstellation,
  plateforme,
  surLinux,
  surMac,
  surWindows,
  écouterMessagesDeConstellation,
  écouterMessagesDeServeurConstellation,
} from '../src';

test('plateforme', async () => {
  expect(plateforme).toBe(process.platform);

  const plateformes: Partial<Record<NodeJS.Platform, boolean>> = {
    darwin: surMac,
    linux: surLinux,
    win32: surWindows,
  };

  expect(plateformes[process.platform]).toBe(true);

  for (const p of Object.keys(plateformes).filter(p => p !== process.platform)) {
    expect(plateformes[p]).toBe(false);
  }
});

vi.mock('electron', () => {
  const événements = new EventEmitter();

  const ipcRenderer: Pick<Electron.IpcRenderer, 'on' | 'once' | 'send'> = {
    on(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) {
      if (channel === 'deClient') {
        événements.on(
          channel,
          (x: [IpcRendererEvent, mandataire.messages.MessageDeTravailleur[]]) => listener(...x),
        );
      } else if (channel === 'deServeur') {
        événements.on(channel, (x: [IpcRendererEvent, messageDeServeur[]]) => listener(...x));
      }
      return this;
    },
    once(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) {
      if (channel === 'clientPrêt') {
        // @ts-expect-error on saute l'événement
        listener({});
      }
      événements.once(channel, listener);
      return this;
    },
    send(channel: string, ...args: unknown[]) {
      if (channel === 'pourClient') {
        événements.emit('deClient', [{}, args[0]]);
      } else if (channel === 'pourServeur') {
        événements.emit('deServeur', [{}, args[0]]);
      }
      return this;
    },
  };

  return {ipcRenderer};
});

test('messages ipa constellation', async () => {
  const résultat = new attente.AttendreRésultat<mandataire.messages.MessageDeTravailleur>();

  écouterMessagesDeConstellation(message => résultat.mettreÀJour(message));

  const message: mandataire.messages.MessagePourTravailleur = {
    type: 'action',
    id: uuidv4(),
    fonction: ['on', 'test', 'une', 'fonction'],
    args: {qui: 'nexiste', pas: 'vraiment'},
  };
  await envoyerMessageÀConstellation(message);

  const val = await résultat.attendreExiste();
  expect(val).to.deep.equal(message);
});

test('messages serveur constellation', async () => {
  const résultat = new attente.AttendreRésultat<messageDeServeur>();

  écouterMessagesDeServeurConstellation(message => résultat.mettreÀJour(message));

  const message: messageInitServeur = {
    type: 'init',
    port: 1234,
  };
  envoyerMessageÀServeurConstellation(message);

  const val = await résultat.attendreExiste();
  expect(val).to.deep.equal(message);
});
