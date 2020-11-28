import { Editor, EditorOptions } from './editor';
import { EncreError, hasDocument, isString, throwError } from './helpers';
export { createANode as h } from './node';
export function createEditor(options: EditorOptions = {}) {
  const plugins = [];
  const editor = new Editor(options);
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
