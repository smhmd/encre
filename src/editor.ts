import { EditorCursor } from './cursor';
import { AbstractDom, render, $, createDom as h } from './dom';
import { EditorEvent } from './events';
import {
  BindDOMType,
  defaultElementsClasses,
  EditorElements,
  ElementsOptions,
  IEditorTool,
  ToolConstructor,
} from './tool';

type ToolObject = {
  tool: ToolConstructor;
  bindDOMFunction: () => BindDOMType;
  activateClass: string;
};
export type ToolArray = ToolObject[];

const defaultOptions = {
  autofocus: true,
  readonly: false,
  classes: defaultElementsClasses,
};

export type EditorOptions = { [prop: string]: any } & {
  autofocus?: boolean;
  readonly?: boolean;
  classes?: ElementsOptions;
};

export class Editor {
  elm?: HTMLElement;
  opts: EditorOptions;
  readonly $event: EditorEvent;
  readonly $cursor: EditorCursor;
  readonly $elements: EditorElements;
  readonly editor: AbstractDom;
  tools: IEditorTool[] = [];
  constructor(options: EditorOptions = {}) {
    this.opts = Object.assign({}, defaultOptions, options);
    this.$elements = new EditorElements(options.classes);
    this.$cursor = new EditorCursor(this);
    this.$event = new EditorEvent(this);
    this.editor = this._createEditor();
  }

  get focusClassName() {
    return this.$elements.classes.focus;
  }

  mount(rootElm: Element) {
    const elm = render(this.editor);
    this.elm = $.traverseAndFind(
      elm as HTMLElement,
      (el) => el.getAttribute('role') === 'editor'
    ) as HTMLElement;
    rootElm.innerHTML = '';
    rootElm.append(elm);
    if (!this.opts.readonly) {
      this.opts.autofocus && this.$cursor.initRange(rootElm);
      this.tools.forEach((t) => {
        t.bind();
      });
    }
    return this;
  }

  private _createEditor() {
    let props = {};
    const self = this;
    if (!this.opts.readonly) {
      props = {
        onMousedown: () => self.$event.onMousedown(),
        onMouseup: () => self.$event.onMouseup(),
        onKeydown: (e: KeyboardEvent) => self.$event.onKeydown(e),
        onKeyup: (e: KeyboardEvent) => self.$event.onKeyup(e),
        onInput: () => self.$event.onInput(),
        onCompositionstart: (e: CompositionEvent) =>
          self.$event.onCompositionstart(e),
        onCompositionend: () => self.$event.onCompositionend(),
      };
    }
    // TODO
    return this.$elements.createEditorElement(props, [
      this.$elements.createTemplateBlock(
        this.$elements.createParagraph('Please Type Something !!')
      ),
    ]);
  }

  getJson() {
    let editor: Element | null;
    if (
      !this.elm ||
      !(editor = this.elm.firstElementChild) ||
      !(editor.getAttribute('role') === 'editor')
    ) {
      return;
    }
    for (let i = 0; i < editor.children.length; i++) {
      const child = editor.children[i];
      // TODO
    }
  }

  register(tools: ToolArray) {
    let tool: IEditorTool;
    const self = this;
    for (let i = 0; i < tools.length; i++) {
      tool = new tools[i].tool(
        self,
        tools[i].bindDOMFunction,
        tools[i].activateClass
      );
      this.tools.push(tool);
    }
  }
}
