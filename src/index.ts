import { EncreEditor, EditorOptions } from './editor';
import { EncreError, hasDocument, isString, throwError } from './helpers';
import './theme/styles.less';
export function createEditor(options: EditorOptions = {}) {
  const plugins = [];
  const editor = new EncreEditor(options);
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
      return editor.mount(rootElm);
    },
  };

  return result;
}
