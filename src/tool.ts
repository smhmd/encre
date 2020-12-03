import { EditorCursor } from './cursor';
import {
  AbstractDom,
  render,
  $,
  createDom as h,
  isAbstractDom,
  AbstractProps,
  AbstractDomChildrenOrAbstractDom,
  mergeProps,
} from './dom';
import { isUndefined } from './helpers';
export const enum EditorRoles {
  CONTAINER = 'container',
  EDITOR = 'editor',
  EDITOR_BLOCK = 'block',
}
export type IEditorTool = {
  readonly $cursor: EditorCursor;
  readonly $elements: EditorElements;
  activateClass: string;
  exec: (...args: any) => any;
  isActivated: () => boolean;
  bind: () => any;
  bindDOMFunction: () => Element | null;
};

export interface ToolConstructor {
  new (
    cursor: EditorCursor,
    elements: EditorElements,
    bindDOMFunction: () => Element | null,
    activateClass: string
  ): IEditorTool;
}

export const defaultElementsClasses = {
  editor: 'encre-editor',
  block: 'encre-block',
  inline: 'encre-inline',
  focus: 'focused',
};
export type ElementsOptions = Partial<typeof defaultElementsClasses>;

export class EditorElements {
  classes: typeof defaultElementsClasses;
  constructor(options: ElementsOptions = {}) {
    this.classes = Object.assign({}, defaultElementsClasses, options);
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

  createTemplateBlock(children: AbstractDomChildrenOrAbstractDom = []) {
    return h(
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
  }
  createParagraph(children: AbstractDomChildrenOrAbstractDom = []) {
    return this.createTemplateBlock(
      h(
        'p',
        {
          contenteditable: true,
        },
        children
      )
    );
  }
}

export function createTemplateInline(
  tag: string,
  props: AbstractProps = {},
  children: AbstractDomChildrenOrAbstractDom = []
) {
  return h(tag, props, children);
}
class ToolTemplate implements IEditorTool {
  readonly $cursor: EditorCursor;
  readonly $elements: EditorElements;
  activateClass: string;
  bindDOMFunction: () => Element | null;
  constructor(
    cursor: EditorCursor,
    elements: EditorElements,
    bindDOMFunction: () => Element | null,
    activateClass = ''
  ) {
    this.$cursor = cursor;
    this.$elements = elements;
    this.bindDOMFunction = bindDOMFunction;
    this.activateClass = activateClass;
  }
  bind() {
    let boundDom: Element | null;
    if (this.bindDOMFunction && (boundDom = this.bindDOMFunction.call(null))) {
      const self = this;
      boundDom.addEventListener('click', self.exec.bind(self), false);
      this.$cursor.registerOnRangeCallbacks(() => {
        if (!boundDom) return;
        if (self.isActivated()) {
          boundDom.classList.add(self.activateClass);
        } else {
          boundDom.classList.contains(self.activateClass) &&
            boundDom.classList.remove(self.activateClass);
        }
      });
    }
  }
  exec() {}
  isActivated() {
    return false;
  }
}

export function createInlineTool(
  commandName: string,
  styleStr: string
): ToolConstructor {
  return class InlineTool extends ToolTemplate implements IEditorTool {
    constructor(
      cursor: EditorCursor,
      elements: EditorElements,
      bindDOMFunction: () => Element | null,
      activateClass = ''
    ) {
      super(cursor, elements, bindDOMFunction, activateClass);
    }
    exec() {
      let range: Range | undefined;
      if (!(range = this.$cursor.range)) {
        return;
      }
      let newRange: Range | null | undefined;
      if (this.$cursor.collapsed) {
        const container = render(
          h(
            'span',
            {
              style: styleStr,
            },
            '\u00A0'
          )
        );
        range.insertNode(container);
        newRange = $.setCursor(container, container.textContent?.length || 0);
      } else {
        $.execCommand('styleWithCSS');
        $.execCommand(commandName, styleStr);
      }

      // set cursor
      this.$cursor.saveRange(newRange);
      // save cursored element
      this.$cursor.saveCursoredElm();
    }

    isActivated() {
      return $.checkCommandState(commandName);
    }
  };
}

export const BoldTool = createInlineTool('bold', 'font-weight: bold;');
export const ItalicTool = createInlineTool('italic', 'font-style: italic;');
export const UnderlineTool = createInlineTool('underline', 'text-decoration: underline;');
export const StrikeThroughTool = createInlineTool('strikeThrough', 'text-decoration: line-through;');
