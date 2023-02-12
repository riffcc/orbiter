import {envoyerMessageÀConstellation, écouterMessagesDeConstellation} from '#preload';
import type {App} from 'vue';
import {générerMandataireÉlectronPrincipal} from '@constl/mandataire-electron-rendu';

export default {
  install: (app: App) => {
    const constl = générerMandataireÉlectronPrincipal({
      envoyerMessageÀConstellation,
      écouterMessagesDeConstellation,
    });
    app.config.globalProperties.$constl = constl;
    app.provide('constl', constl);
  },
};
