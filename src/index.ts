import { Editor, EditorOptions, ToolArray } from './editor';
import { EncreError, hasDocument, isString, throwError } from './helpers';
import './theme/styles.less';
import { ToolConstructor } from './tool';
export {
  BoldTool,
  ItalicTool,
  UnderlineTool,
  StrikeThroughTool,
  Heading1Tool,
  ParagraphTool,
  OrderedList,
  UnorderedList
} from './tool';
export function createEditor(options: EditorOptions = {}) {
  const tools: ToolArray = [];
  const editor = new Editor(options);
  const result = {
    use(
      tool: ToolConstructor,
      bindDOMFunction: () => Element | null = () => null,
      activateClass: string = ''
    ) {
      tools.push({
        tool,
        bindDOMFunction,
        activateClass,
      });
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
