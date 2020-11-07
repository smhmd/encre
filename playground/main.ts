import { createApp } from 'vue';
import { install } from '/@lagabu/encre-ui/src/index';
import App from './App.vue';
createApp(App).use(install).mount('#app');
