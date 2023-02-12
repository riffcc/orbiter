import constellationNavigateur from '../constellation/browser';
import {registerPlugins} from './common';

// Types
import type {App} from 'vue';

export function inscrireExtentions(appli: App) {
  appli.use(constellationNavigateur);
  registerPlugins(appli);
}
