import { Cursor } from './cursor';
import { hasDocument, isString, debounce, throwError } from './helpers';
import {
  AbstractNode,
  AbstractNodeChildren,
  createANode as hyper,
  renderANode as render,
  cloneAbstractNode,
  ANodeChildren,
  isANode,
  patchNode,
  TraverseReturn,
  PATCH_FLAG,
} from './node';
import { EditorElement, ElementOptions } from './elements';
export type EditorOptions = {
  placeholder?: string | AbstractNode;
  classes?: ElementOptions;
};
export class Editor {
  editor: AbstractNode;
  cursor: Cursor;
  options: EditorOptions;
  isComposing: boolean = false;
  root: Element | undefined;
  elements: EditorElement;
  inputTimer?: number;
  debouncedPatch: typeof patchNode;
  constructor(options: EditorOptions = {}) {
    this.options = Object.assign({}, options);
    this.elements = new EditorElement(options.classes);
    this.editor = this._createEditor();
    this.cursor = new Cursor(this.editor);
    this.debouncedPatch = debounce(patchNode);
  }

  private patch(...args: Parameters<typeof patchNode>): Promise<void> {
    return new Promise((resolve) => {
      this.debouncedPatch(args[0], args[1], args[2], resolve);
    });
  }

  mountRoot(rootElement: Element) {
    if (!hasDocument()) throwError('No Document Specified');
    rootElement.innerHTML = '';
    rootElement.append(render(this.editor));
    this.root = rootElement;
    return this;
  }

  protected onKeydown(e: KeyboardEvent) {
    if (this.isComposing) return;
    switch (e.key) {
      case 'Backspace': {
        break;
      }
      case 'Enter': {
        e.preventDefault();
        break;
      }
      default: {
        break;
      }
    }
  }
  protected onKeyup() {
    if (this.isComposing) return;
  }

  protected onInput(e: InputEvent) {
    this._onInputUpdate(e);
  }

  protected onCompositionstart() {
    this.isComposing = true;
  }

  protected onCompositionend(e: CompositionEvent) {
    this.isComposing = false;
    this._onInputUpdate(e);
  }

  private async _onInputUpdate(e: InputEvent | CompositionEvent) {
    let cursorNode: TraverseReturn | null,
      currentNode: AbstractNode | undefined,
      parentNode: AbstractNode | undefined;
    if (
      this.isComposing ||
      !(cursorNode = this.cursor.ancestorNode) ||
      !(currentNode = cursorNode.current) ||
      !(parentNode = cursorNode.parent)
    ) {
      return;
    }
    await this.patch(parentNode, currentNode, PATCH_FLAG.TEXT);
    console.log(currentNode);
  }

  private _createEditor() {
    const children: AbstractNodeChildren = [],
      placeholder = this.options.placeholder,
      self = this;
    if (placeholder) {
      if (isString(placeholder)) {
        children.push(this.elements.p(placeholder));
      } else {
        children.push(placeholder);
      }
    } else {
      children.push(this.elements.p('Please type something'));
    }
    return hyper(
      'div',
      {
        class: 'editor',
        onKeydown: self.onKeydown.bind(self),
        onKeyup: self.onKeyup.bind(self),
        onInput: self.onInput.bind(self),
        onCompositionstart: self.onCompositionstart.bind(self),
        onCompositionend: self.onCompositionend.bind(self),
      },
      children
    );
  }

  getJson() {
    return cloneAbstractNode(this.editor).children;
  }

  setJson(jsonOrString: ANodeChildren) {
    let node: AbstractNode;
    if (isString(jsonOrString)) {
      node = hyper(jsonOrString);
    } else {
      if (isANode(jsonOrString)) {
        node = jsonOrString;
      } else {
        node = hyper(jsonOrString);
      }
    }
    if (this.root) {
      this.editor.children = [node];
      this.mountRoot(this.root);
    }
  }
}
