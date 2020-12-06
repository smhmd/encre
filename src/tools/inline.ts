import {
  $,
  createDom as h,
  AbstractProps,
  AbstractDomChildrenOrAbstractDom,
  _resolveProps,
  AbstractDom,
} from '../dom';
import { IEditorTool, ToolTemplate, ToolEnum } from '../tool';

export function createTemplateInline(
  tag: string,
  props: AbstractProps = {},
  children: AbstractDomChildrenOrAbstractDom = []
): AbstractDom {
  return h(tag, props, children);
}

export interface InlineToolConstructor {
  new (...args: ConstructorParameters<typeof ToolTemplate>): IEditorTool;
}
export function createInlineTool(
  commandName: string,
  value?: string
): InlineToolConstructor {
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
      $.execCommand(commandName, value);
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
/**
 * @public
 */
export const BoldTool = createInlineTool('bold');
/**
 * @public
 */
export const ItalicTool = createInlineTool('italic');
/**
 * @public
 */
export const UnderlineTool = createInlineTool('underline');
/**
 * @public
 */
export const StrikeThroughTool = createInlineTool('strikeThrough');
