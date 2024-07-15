import type {App} from 'vue';

import {mandataire} from '@constl/ipa';
import {RIFFCC_PROTOCOL} from '/@/utils';

export default {
  install: (app: App) => {
    const client = mandataire.ipa.générerMandataireProc({protocoles: [RIFFCC_PROTOCOL]});
    app.config.globalProperties.$constl = client;
    app.provide('constl', client);
  },
};
