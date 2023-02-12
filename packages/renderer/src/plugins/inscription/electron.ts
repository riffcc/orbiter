import electronConstellation from '../constellation/electron';
import {registerPlugins} from './common';

// Types
import type {App} from 'vue';

export function inscrireExtentions(app: App) {
  app.use(electronConstellation);
  registerPlugins(app);
}
