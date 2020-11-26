import { Editor } from './editor';
import { EncreError, hasDocument, isString, throwError } from './helpers';
export type EncreOptions = {};

export function createEditor(options: EncreOptions = {}) {
  const plugins = [];
  const editor = new Editor();
  const result = {
    use(plugin: any) {
      // TODO use some plugins
      plugins.push(plugin);
      return editor;
    },
    mount(root: string | HTMLElement | Element) {
      if (!hasDocument()) {
        throwError('No Document Provides!');
      }
      let rootElm: HTMLElement | Element | null;
      if (isString(root)) {
        rootElm = document.querySelector(root);
        if (!rootElm) {
          throw new EncreError(`No such element: "${root}"`);
        }
      } else {
        rootElm = root;
      }
      return editor.mountRoot(rootElm);
    },
  };

  return result;
}
