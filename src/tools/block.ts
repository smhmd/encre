import {
  AbstractDom,
  render,
  $,
  createDom as h,
  isAbstractDom,
  mergeProps,
  _resolveProps,
} from '../dom';
import { Editor } from '../editor';
import {
  ToolTemplate,
  ToolConstructor,
  IEditorTool,
  BindDOMType,
} from '../tool';

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
  onEnterFunc: EnterFuncType = () => false,
  justChangeProps: boolean = false
): ToolConstructor {
  return class BlockTool extends ToolTemplate implements IEditorTool {
    makeDOMFunc: DOMFuncType;
    onEnterFunc: EnterFuncType;
    blockUID: number;
    constructor(
      editor: Editor,
      bindDOMFunction: () => BindDOMType,
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
      if (justChangeProps) {
        if (isAbstractDom(makedDom)) {
          const props = makedDom.props;
          _resolveProps(
            mergeProps(props, { contenteditable: true }),
            contenteditableElm
          );
        }
        return;
      }
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
export const BlockquoteTool = createBlockTool(() =>
  h('blockquote', {
    class: 'encre-blockquote',
  })
);
export const Heading1Tool = createBlockTool(() =>
  h('h1', { class: 'encre-heading-1' })
);
export const Heading2Tool = createBlockTool(() =>
  h('h2', { class: 'encre-heading-2' })
);
function createJustifyTool(alignName = 'auto') {
  return createBlockTool(
    () =>
      h('p', {
        style: {
          'text-align': alignName,
        },
      }),
    undefined,
    true
  );
}
export const JustifyLeftTool = createJustifyTool('start');
export const JustifyCenterTool = createJustifyTool('center');
export const JustifyRightTool = createJustifyTool('end');
