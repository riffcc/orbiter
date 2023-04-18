import {createApp} from 'vue';
import App from './App.vue';
import {inscrireExtentions} from './plugins/inscription/electron.js';

const app = createApp(App);

inscrireExtentions(app);

app.mount('#app');

// Aspirational design: https://github.com/orgs/riffcc/projects/1/views/1?pane=issue&itemId=17693411
