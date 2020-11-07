import { App, Component } from 'vue';
import { hyphenate } from '@lagabu/tool';
import * as components from './components';

export function install(Vue: App) {
  let component: Component;
  for (let key in components) {
    if (Object.prototype.hasOwnProperty.call(components, key)) {
      component = (components as any)[key];
      Vue.component(component.name || hyphenate(key), component);
    }
  }
}
