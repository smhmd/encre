import { EditorCursor } from './cursor';
import {
  $,
  createDom as h,
  AbstractProps,
  AbstractDomChildrenOrAbstractDom,
  mergeProps,
  _resolveProps,
  AbstractDom,
  render,
} from './dom';
import { Editor } from './editor';
import { EditorEvent } from './events';
import { isString, isUndefined } from './helpers';
export const enum EditorRoles {
  CONTAINER = 'container',
  EDITOR = 'editor',
  EDITOR_BLOCK = 'block',
  EDITOR_ZONE = 'zone',
}
export const enum ToolEnum {
  INLINE = 1,
  BLOCK = 1 << 1,
}
export type BindDOMType = Element | string | null;
export type IEditorTool = {
  readonly $cursor: EditorCursor;
  readonly $elements: EditorElements;
  readonly $event: EditorEvent;
  readonly type: ToolEnum;
  activateClass: string;
  exec: (...args: any) => any;
  isActivated: () => boolean;
  bind: () => any;
  bindDOMFunction: () => BindDOMType;
  onEnter: (...args: any[]) => boolean;
};

export interface ToolConstructor {
  new (editor: Editor, ...args: any[]): IEditorTool;
}

export const defaultElementsClasses = {
  editor: 'encre-editor',
  block: 'encre-block',
  inline: 'encre-inline',
  focus: 'focused',
  paragraph: 'encre-paragraph',
};
export type ElementsOptions = Partial<typeof defaultElementsClasses>;

export class EditorElements {
  classes: typeof defaultElementsClasses;
  readonly editable: boolean;
  constructor(editor: Editor, options: ElementsOptions = {}) {
    this.classes = Object.assign({}, defaultElementsClasses, options);
    this.editable = !editor.opts.readonly;
  }

  createEditorElement(
    props: AbstractProps = {},
    children: AbstractDomChildrenOrAbstractDom = []
  ) {
    return h(
      'div',
      {
        class: `${this.classes.editor}__container`,
      },
      [
        h(
          'div',
          mergeProps(
            {
              class: `${this.classes.editor}`,
              role: EditorRoles.EDITOR,
              spellcheck: false,
              tabindex: -1,
            },
            props
          ),
          children
        ),
      ]
    );
  }
  createTemplateBlock(children: Node): HTMLElement;
  createTemplateBlock(children?: AbstractDomChildrenOrAbstractDom): AbstractDom;
  createTemplateBlock(...args: any) {
    let children: any;
    if (isUndefined(args[0]) || args[0] instanceof Node) {
      children = [];
    } else {
      children = args[0];
    }

    const obj = h(
      'div',
      {
        class: `${this.classes.block}`,
        role: EditorRoles.EDITOR_BLOCK,
      },
      [
        h(
          'div',
          {
            class: `${this.classes.block}__content`,
          },
          children
        ),
      ]
    );
    if (args[0] instanceof Node) {
      const renderedElm = render(obj) as Element;
      const lastElm = $.getLastRightElement(renderedElm);
      lastElm.append(args[0]);
      return renderedElm;
    }

    return obj;
  }
  createParagraph(children: AbstractDomChildrenOrAbstractDom = []) {
    const editableProps = this.editable
      ? {
          contenteditable: 'true',
        }
      : {};
    return h(
      'p',
      mergeProps(
        {
          class: this.classes.paragraph,
          role: EditorRoles.EDITOR_ZONE,
        },
        editableProps
      ),
      children
    );
  }
}

export class ToolTemplate implements IEditorTool {
  readonly $cursor: EditorCursor;
  readonly $elements: EditorElements;
  readonly $event: EditorEvent;
  readonly type = ToolEnum.BLOCK;
  activateClass: string;
  bindDOMFunction: () => BindDOMType;
  constructor(
    editor: Editor,
    bindDOMFunction: () => BindDOMType,
    activateClass = ''
  ) {
    this.$cursor = editor.$cursor;
    this.$elements = editor.$elements;
    this.$event = editor.$event;
    this.bindDOMFunction = bindDOMFunction;
    this.activateClass = activateClass;
  }
  bind() {
    let boundDom: BindDOMType;
    if (this.bindDOMFunction && (boundDom = this.bindDOMFunction.call(null))) {
      if (isString(boundDom)) {
        boundDom = $.seletor(boundDom);
      }
      if (!boundDom) return;
      const self = this;
      boundDom.addEventListener('click', self.exec.bind(self), false);
      this.$cursor.registerOnRangeCallbacks(() => {
        if (!boundDom || isString(boundDom)) return;
        if (self.isActivated()) {
          boundDom.classList.add(self.activateClass);
        } else {
          boundDom.classList.contains(self.activateClass) &&
            boundDom.classList.remove(self.activateClass);
        }
      });
    }
  }
  exec(...args: any) {}
  onEnter() {
    return false;
  }
  isActivated() {
    return false;
  }
}
