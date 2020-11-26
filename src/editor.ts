import { Cursor } from './cursor';
import { hasDocument, isString, throwError } from './helpers';
import {
  AbstractNode,
  AbstractNodeChildren,
  createANode as hyper,
  renderANode as render,
  cloneAbstractNode,
  ANodeChildren,
  isANode,
  patchNode,
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
  constructor(options: EditorOptions = {}) {
    this.options = Object.assign({}, options);
    this.elements = new EditorElement(options.classes);
    this.editor = this._createEditor();
    this.cursor = new Cursor();
  }

  mountRoot(rootElement: Element) {
    if (!hasDocument()) throwError('No Document Specified');
    rootElement.innerHTML = '';
    rootElement.append(render(this.editor));
    this.root = rootElement;
    return this;
  }

  protected onKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Backspace': {
        console.log(e);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        break;
      }
      default: {
        console.log(Cursor.commonAncestorNode(this.editor));
        break;
      }
    }
  }
  protected onKeyup() {}

  protected onInput(e: InputEvent) {
    // console.log(e.target);
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
        onCompositionstart: () => (this.isComposing = true),
        onCompositionend: () => (this.isComposing = false),
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
