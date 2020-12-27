import {
  convertBlockToInline,
  deepTraverseRightNode,
  lookup,
  mergeProps,
  setCursorToEnd,
  resolveProps,
  traverseAndFindBlockContent,
  isBlockContent,
} from '../dom';
import { isHTMLElement } from '../helpers';
import { IPlugin, PluginConstructor, PluginTemplate, Feature } from './plugin';
import { Editor, EditorRole, HyperProps } from '../config';

function makeBlockPlugin(
  tag: string = 'p',
  props: HyperProps = {},
  blockType: string = ''
) {
  if (!blockType) {
    blockType = tag;
  }
  return class BlockPlugin extends PluginTemplate implements IPlugin {
    features: Feature[];
    constructor(editor: Editor, blockProps: HyperProps = {}) {
      super(editor);
      this.features = [
        {
          tag,
          name: blockType,
          props: mergeProps(props, blockProps, {
            role: EditorRole.blockContent,
            feature: blockType,
            contenteditable: true,
          }),
        },
      ];
    }
    exec() {
      if (this.$editor.disabled) return;

      let editorElm: HTMLElement | undefined,
        cursoringBlock: HTMLElement | undefined,
        blc: HTMLElement | undefined;
      if (
        !(editorElm = this.$editor.elm) ||
        !(cursoringBlock = this.$editor.cursoringBlock) ||
        !(blc = traverseAndFindBlockContent(cursoringBlock))
      ) {
        return;
      }
      if (blc.tagName === tag.toUpperCase()) return;
      const tagName = tag;
      const frag = convertBlockToInline(blc) as DocumentFragment;
      let newBlock = this.$editor.renderNewBlock(
        tagName,
        this.features[0].props,
        frag
      );
      newBlock = editorElm.insertBefore(
        newBlock,
        cursoringBlock.nextElementSibling
      );
      const lastNode = deepTraverseRightNode(newBlock);
      editorElm.removeChild(cursoringBlock);
      this.$editor.range = setCursorToEnd(lastNode);
    }
    isActive() {
      let _range: Range | null | undefined;
      if (!(_range = this.$editor.range)) return false;
      return Boolean(
        lookup(
          _range.commonAncestorContainer,
          (current) =>
            isHTMLElement(current) &&
            isBlockContent(current) &&
            current.getAttribute('feature') === blockType
        )
      );
    }
  };
}

export const ParagraphPlugin = makeBlockPlugin('p', {}, 'paragraph');
export const BlockquotePlugin = makeBlockPlugin('blockquote', {}, 'blockquote');
export const Heading1Plugin = makeBlockPlugin('h1', {}, 'heading-1');
export const Heading2Plugin = makeBlockPlugin('h2', {}, 'heading-2');
export const Heading3Plugin = makeBlockPlugin('h3', {}, 'heading-3');
export const Heading4Plugin = makeBlockPlugin('h4', {}, 'heading-4');
export const Heading5Plugin = makeBlockPlugin('h5', {}, 'heading-5');

function makePropsReplacePlugin(props: HyperProps, inlineType: string) {
  return class PropsReplacePlugin extends PluginTemplate implements IPlugin {
    _props: HyperProps;
    constructor(editor: Editor, innerProps: HyperProps = {}) {
      super(editor);
      this._props = mergeProps(props, innerProps);
    }
    exec() {
      if (this.$editor.disabled) return;

      let _range: Range | null | undefined, blc: HTMLElement | undefined;
      if (
        !(_range = this.$editor.range) ||
        !(blc = lookup(
          _range.commonAncestorContainer,
          (curr) => isHTMLElement(curr) && isBlockContent(curr)
        ) as HTMLElement | undefined)
      ) {
        return;
      }
      resolveProps(blc, this._props);
      const lastNode = deepTraverseRightNode(blc);
      this.$editor.range = setCursorToEnd(lastNode);
    }
    isActive() {
      return false
    }
  };
}

export const AlignLeftPlugin = makePropsReplacePlugin(
  { style: 'text-align: left;' },
  'align-left'
);

export const AlignCenterPlugin = makePropsReplacePlugin(
  { style: 'text-align: center;' },
  'align-center'
);

export const AlignRightPlugin = makePropsReplacePlugin(
  { style: 'text-align: right;' },
  'align-right'
);
