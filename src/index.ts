import { createEditor } from './editor';
import { EncreError, isString } from './helpers';
import { ExtractPluginConstructor, PluginConstructor } from './plugins/plugin';
import { Editor, EditorOptions, PluginItem } from './config';
/**
 * @public - create encre context
 */
export function createEncre() {
  const plugins: PluginItem[] = [];
  const instance = {
    use<T extends PluginConstructor>(
      plugin: T,
      ...args: ExtractPluginConstructor<T>
    ) {
      plugins.push([plugin, args || []]);
      return instance;
    },
    mount(root: string | Node, opts: EditorOptions = {}): Editor {
      const rootElm = isString(root) ? document.querySelector(root) : root;
      if (!rootElm) throw new EncreError(`No Such Element "${root}"`);
      const editor = createEditor(rootElm, opts, plugins);

      return editor;
    },
  };

  return instance;
}

export * from './plugins';
