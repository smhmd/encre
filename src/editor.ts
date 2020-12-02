import { EncreCursor } from './cursor';
import { AbstractDom, render, $ } from './dom';
import { b, createDefaultEditor, p } from './elements';
import { EncreEvent } from './events';
export type EditorOptions = { [prop: string]: any } & {
  readonly?: boolean;
  autofocus?: boolean;
};

const defaultOptions: EditorOptions = {
  autofocus: true,
  readonly: false,
};

export class EncreEditor {
  editor: AbstractDom;
  elm?: HTMLElement;
  opts: EditorOptions;
  $event: EncreEvent;
  $cursor: EncreCursor;
  constructor(options: EditorOptions = {}) {
    this.opts = Object.assign({}, defaultOptions, options);
    this.$cursor = new EncreCursor(this);
    this.$event = new EncreEvent(this, this.$cursor);
    this.editor = this._createEditor();
  }

  get focusClassName() {
    return 'ee--focused';
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
    }
    return this;
  }

  _createEditor() {
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
    return createDefaultEditor(props, [
      p(['Please Type ', b('Something '), 'Essential'], !this.opts.readonly),
      p(['Please Type ', b('Something '), 'Essential'], !this.opts.readonly),
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
}
