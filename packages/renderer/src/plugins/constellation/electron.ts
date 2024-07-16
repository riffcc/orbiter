import {envoyerMessageÀConstellation, écouterMessagesDeConstellation} from '#preload';
import {générerMandataireÉlectronPrincipal} from '@constl/mandataire-electron-rendu';
import type {App} from 'vue';

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
