import type {App} from 'vue';

import * as constl from '@constl/ipa';
import {RIFFCC_PROTOCOL} from '/@/utils';

export default {
  install: (app: App) => {
    const client = constl.mandataire.générerMandataireProc({protocoles: [RIFFCC_PROTOCOL]});
    app.config.globalProperties.$constl = client;
    app.provide('constl', client);
  },
};
