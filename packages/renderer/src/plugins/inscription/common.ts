/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import {loadFonts} from '../webfontloader';
import vuetify from '../vuetify';

import orbiter from '../orbiter';

// Types
import type {App} from 'vue';

export function registerPlugins(app: App) {
  loadFonts();
  app.use(vuetify);
  app.use(orbiter);
}
