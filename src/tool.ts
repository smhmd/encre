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
import { Editor } from './editor';
import { EditorEvent } from './events';
import { isUndefined } from './helpers';
export const enum EditorRoles {
  CONTAINER = 'container',
  EDITOR = 'editor',
  EDITOR_BLOCK = 'block',
}
export const enum ToolEnum {
  INLINE = 1,
  BLOCK = 1 << 1,
}
export type IEditorTool = {
  readonly $cursor: EditorCursor;
  readonly $elements: EditorElements;
  readonly $event: EditorEvent;
  readonly type: ToolEnum;
  activateClass: string;
  exec: (...args: any) => any;
  isActivated: () => boolean;
  bind: () => any;
  bindDOMFunction: () => Element | null;
  onEnter: (...args: any[]) => boolean;
};

export interface ToolConstructor {
  new (
    editor: Editor,
    bindDOMFunction: () => Element | null,
    activateClass: string
  ): IEditorTool;
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
    return h(
      'p',
      {
        class: this.classes.paragraph,
        contenteditable: true,
      },
      children
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
  readonly $event: EditorEvent;
  readonly type = ToolEnum.BLOCK;
  activateClass: string;
  bindDOMFunction: () => Element | null;
  constructor(
    editor: Editor,
    bindDOMFunction: () => Element | null,
    activateClass = ''
  ) {
    this.$cursor = editor.$cursor;
    this.$elements = editor.$elements;
    this.$event = editor.$event;
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
  onEnter() {
    return false;
  }
  isActivated() {
    return false;
  }
}
type DOMFuncType = (
  ctx: ToolTemplate
) => AbstractDom | HTMLElement | Element | null | undefined;
type EnterFuncType = (
  ctx: ToolTemplate,
  cloneContents?: DocumentFragment,
  newRange?: Range
) => boolean;
let blockUID = 1;

/**
 * get first find editable element in cursored element
 * @param contentElm
 */
function getFirstEditableElement(contentElm: Element | null) {
  if (!contentElm) return;
  let child: HTMLElement | null, contenteditableElm: HTMLElement | undefined;
  // get editable element
  for (let i = 0; i < contentElm.children.length; i++) {
    child = contentElm.children.item(i) as HTMLElement;
    if (child && child.getAttribute('contenteditable') === 'true') {
      contenteditableElm = child;
      break;
    }
  }
  return contenteditableElm;
}

export function createBlockTool(
  makeDOMFunc: DOMFuncType = () => null,
  onEnterFunc: EnterFuncType = () => false
): ToolConstructor {
  return class BlockTool extends ToolTemplate implements IEditorTool {
    makeDOMFunc: DOMFuncType;
    onEnterFunc: EnterFuncType;
    blockUID: number;
    constructor(
      editor: Editor,
      bindDOMFunction: () => Element | null,
      activateClass = ''
    ) {
      super(editor, bindDOMFunction, activateClass);
      this.makeDOMFunc = makeDOMFunc;
      this.onEnterFunc = onEnterFunc;
      this.blockUID = blockUID++;
    }
    exec() {
      let cursoredElm: Element | null | undefined,
        makedDom: ReturnType<DOMFuncType>;
      const self = this;
      if (
        !(cursoredElm = this.$cursor.cursoredElm) ||
        !(makedDom = this.makeDOMFunc.call(null, self))
      ) {
        return;
      }
      const contentElm: Element | null = cursoredElm.lastElementChild;
      const contenteditableElm = getFirstEditableElement(contentElm);
      if (!contenteditableElm || !contentElm) return;
      const data = contentElm.textContent || '';
      let lastElm: Element | null = null;
      if (isAbstractDom(makedDom)) {
        // render abstract node
        makedDom = render(makedDom) as Element;
      }
      makedDom.setAttribute('contenteditable', 'true');
      // append data text to last right child
      lastElm = $.getLastRightElement(makedDom);
      lastElm.append(data);
      this.$cursor.cursoredElm._block_uid = this.blockUID;
      // remove raw contenteditable block
      contenteditableElm?.remove();
      contentElm.append(makedDom);
      // set Range
      this.$cursor.saveRange($.setCursor(lastElm, 0));
      // save cursored elm
      this.$cursor.saveCursoredElm();
    }
    onEnter(...args: any[]): boolean {
      const self = this;
      if (!self.isActivated()) return false;
      return Boolean(self.onEnterFunc.call(null, self, ...args));
    }
    isActivated() {
      return (
        !!this.$cursor.cursoredElm &&
        this.$cursor.cursoredElm._block_uid === this.blockUID
      );
    }
  };
}
export const ParagraphTool = createBlockTool((tool) =>
  tool.$elements.createParagraph()
);
export const Heading1Tool = createBlockTool(() =>
  h('h1', { class: 'encre-heading-1' })
);
export const Heading2Tool = createBlockTool(() =>
  h('h2', { class: 'encre-heading-2' })
);

function createListTool(ordered?: boolean) {
  const listTitleTag = ordered ? 'ol' : 'ul';
  const listItemTag = 'li';
  const getClosestListItem = (n: Node) =>
    $.createGetParentTemplate(
      n,
      (parent) => parent.tagName === listItemTag.toUpperCase()
    );
  const getClosetListParent = (n: Node) =>
    $.createGetParentTemplate(
      n,
      (parent) => parent.tagName === listTitleTag.toUpperCase()
    );
  return createBlockTool(
    () =>
      h(listTitleTag, { class: 'encre-ol' }, [
        h(listItemTag, { class: 'encre-list--item' }),
      ]),
    (ctx, cloneContents, newRange) => {
      let range: Range | undefined,
        closetListItem: HTMLElement | null = null;
      if (
        !newRange ||
        !(range = ctx.$cursor.range) ||
        !(closetListItem = getClosestListItem(range.endContainer)) ||
        (!closetListItem.nextElementSibling && !cloneContents)
      ) {
        let endContainer: Node | undefined;
        // if at last position & no text, remove its self
        if ((endContainer = range?.endContainer) && !endContainer.textContent) {
          endContainer.parentElement?.removeChild(endContainer);
        }
        return false;
      }
      const ulElement = getClosetListParent(closetListItem);
      if (ulElement) {
        let nextElm: Element | null;
        const listItemElm = render(
          h(listItemTag, { class: 'encre-list--item' })
        );
        cloneContents && listItemElm.appendChild(cloneContents);
        // insert new list item
        if ((nextElm = closetListItem.nextElementSibling)) {
          !listItemElm.textContent && (listItemElm.textContent = '\u00A0');
          ulElement.insertBefore(listItemElm, nextElm);
        } else {
          ulElement.append(listItemElm);
        }
        // set cursor and save range
        ctx.$cursor.saveRange($.setCursor($.getFirstLeftNode(listItemElm), 0));
        // save cursoredElment
        ctx.$cursor.saveCursoredElm();
        // delete previous elments' last nodes
        newRange.deleteContents();
        if (!newRange.startContainer.textContent) {
          newRange.startContainer.textContent = '\u00A0';
        }
        return true;
      }
      return false;
    }
  );
}

export const OrderedList = createListTool(true);
export const UnorderedList = createListTool();

export function createInlineTool(
  commandName: string,
  styleStr: string
): ToolConstructor {
  return class InlineTool extends ToolTemplate implements IEditorTool {
    readonly type = ToolEnum.INLINE;
    exec() {
      let range: Range | undefined;
      if (!(range = this.$cursor.range)) {
        return;
      }
      let newRange: Range | null | undefined;
      if (this.$cursor.collapsed) {
        const { startOffset, startContainer } = range;
        newRange = $.setCursor(startContainer, startOffset);
      }
      $.execCommand('styleWithCSS');
      $.execCommand(commandName, styleStr);
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
export const UnderlineTool = createInlineTool(
  'underline',
  'text-decoration: underline;'
);
export const StrikeThroughTool = createInlineTool(
  'strikeThrough',
  'text-decoration: line-through;'
);
