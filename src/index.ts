import { Editor, EditorOptions, ToolArray } from './editor';
import { EncreError, hasDocument, isString, throwError } from './helpers';
import { IEditorTool, ToolConstructor } from './tool';
export * from './tools';
export type ExtractToolConstructor<T> = T extends new (
  edtior: Editor,
  ...args: infer U
) => IEditorTool
  ? U
  : unknown;

export function createEditor(options: EditorOptions = {}) {
  const tools: ToolArray = [];
  const editor = new Editor(options);
  const result = {
    use<T extends ToolConstructor>(
      tool: T,
      ...args: ExtractToolConstructor<T>
    ) {
      tools.push([tool, ...args]);
      return result;
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

      // regsiter plugin
      editor.register(tools);
      // mount editor to root element
      return editor.mount(rootElm);
    },
  };

  return result;
}
