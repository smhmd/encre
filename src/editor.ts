import { EditorCursor } from './cursor';
import {
  AbstractDom,
  render,
  $,
  createDom as h,
  serialize,
  isAbstractBlock,
  _resolveProps,
} from './dom';
import { EditorEvent } from './events';
import { isString } from './helpers';
import {
  defaultElementsClasses,
  EditorElements,
  EditorRoles,
  ElementsOptions,
  IEditorTool,
  ToolConstructor,
} from './tool';

type ToolObject = [tool: ToolConstructor, ...args: any[]];
export type ToolArray = ToolObject[];

const defaultOptions = {
  placeholder: 'Please input something!!',
  autofocus: true,
  readonly: false,
  classes: defaultElementsClasses,
};

export type EditorOptions = { [prop: string]: any } & {
  autofocus?: boolean;
  readonly?: boolean;
  placeholder?: string;
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
    this.$elements = new EditorElements(this, options.classes);
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
    const paragraph = this.$elements.createParagraph(this.opts.placeholder);
    return this.$elements.createEditorElement(props, [
      this.$elements.createTemplateBlock(paragraph),
    ]);
  }

  onRangeSaved(cb?: ($cursor: EditorCursor) => any) {
    this.$cursor.registerOnRangeCallbacks(cb);
  }

  getJson() {
    let editor: HTMLElement | undefined | null;
    if (
      !(editor = this.elm) ||
      !(editor.getAttribute('role') === EditorRoles.EDITOR)
    ) {
      return;
    }
    return serialize(editor);
  }

  setJson(nodes: AbstractDom[]) {
    let editor: HTMLElement | undefined | null;
    if (
      !(editor = this.elm) ||
      !(editor.getAttribute('role') === EditorRoles.EDITOR)
    ) {
      return;
    }
    const result = [];
    let n: AbstractDom, tempElm: HTMLElement;
    for (let i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (
        !n._is_abstract ||
        !isString(n.children) ||
        !isAbstractBlock(n.type)
      ) {
        continue;
      }
      tempElm = $.createElement(n.tag);
      n.props.role = EditorRoles.EDITOR_ZONE;
      _resolveProps(n.props, tempElm);
      if (!this.opts.readonly) {
        tempElm.setAttribute('contenteditable', 'true');
      } else {
        tempElm.removeAttribute('contenteditable');
      }
      tempElm.innerHTML = n.children;
      result.push(this.$elements.createTemplateBlock(tempElm));
    }
    if (result.length === 0) {
      result.push(
        render(
          this.$elements.createTemplateBlock(this.$elements.createParagraph())
        )
      );
    }
    editor.innerHTML = '';
    editor.append(...result);
    return this;
  }

  register(tools: ToolArray) {
    let tool: IEditorTool;
    let currentToolObj: ToolObject;
    const self = this;
    for (let i = 0; i < tools.length; i++) {
      currentToolObj = tools[i];
      tool = new currentToolObj[0](self, ...currentToolObj.slice(1));
      this.tools.push(tool);
    }
  }
}
