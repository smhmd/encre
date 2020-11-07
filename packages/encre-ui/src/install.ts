import { App } from 'vue';
import Line from './components/Line';
export function install(Vue: App) {
  Vue.component(Line.name, Line);
}
