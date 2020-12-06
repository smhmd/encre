import {
  AbstractDom,
  render,
  $,
  createDom as h,
  isAbstractDom,
  mergeProps,
  _resolveProps,
} from '../dom';
import { ToolTemplate, IEditorTool, EditorRoles } from '../tool';

export type DOMFuncType = (
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
    if (child && child.getAttribute('role') === EditorRoles.EDITOR_ZONE) {
      contenteditableElm = child;
      break;
    }
  }
  return contenteditableElm;
}
export interface BlockToolConstructor {
  new (...args: ConstructorParameters<typeof ToolTemplate>): IEditorTool;
}
export function createBlockTool(
  makeDOMFunc: DOMFuncType = () => null,
  onEnterFunc: EnterFuncType = () => false,
  justChangeProps: boolean = false
): BlockToolConstructor {
  return class BlockTool extends ToolTemplate implements IEditorTool {
    makeDOMFunc: DOMFuncType;
    onEnterFunc: EnterFuncType;
    blockUID: number;
    constructor(...args: ConstructorParameters<BlockToolConstructor>) {
      super(...args);
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
          const editableProps = this.$elements.editable
            ? {
                contenteditable: true,
              }
            : {};
          _resolveProps(
            mergeProps(props, editableProps, {
              role: EditorRoles.EDITOR_ZONE,
            }),
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
      if (this.$elements.editable) {
        makedDom.setAttribute('contenteditable', 'true');
      } else {
        makedDom.removeAttribute('contenteditable');
      }
      makedDom.setAttribute('role', EditorRoles.EDITOR_ZONE);
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
/**
 * @public
 */
export const ParagraphTool = createBlockTool((tool) =>
  tool.$elements.createParagraph()
);
/**
 * @public
 */
export const BlockquoteTool = createBlockTool(() =>
  h('blockquote', {
    class: 'encre-blockquote',
  })
);
/**
 * @public
 */
export const Heading1Tool = createBlockTool(() =>
  h('h1', { class: 'encre-heading-1' })
);
/**
 * @public
 */
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
/**
 * @public
 */
export const JustifyLeftTool = createJustifyTool('start');
/**
 * @public
 */
export const JustifyCenterTool = createJustifyTool('center');
/**
 * @public
 */
export const JustifyRightTool = createJustifyTool('end');