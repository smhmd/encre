import {
  mergeProps,
  createDOM as h,
  convertBlockToInline,
  setCursorToStart,
  deepTraverseLeftNode,
  deepTraverseRightNode,
} from '../dom';
import { Editor, HyperProps } from '../config';
import { IPlugin, PluginConstructor, PluginTemplate, Feature } from './plugin';

export function makeImagePlugin() {
  const defaultProps = {
    src: '',
    alt: '',
    class: 'editor-image',
    feature: 'image',
  };
  return class ImagePlugin extends PluginTemplate implements IPlugin {
    constructor(editor: Editor, tag: string = 'img', props: HyperProps = {}) {
      super(editor);
      this.features = [
        {
          tag,
          name: defaultProps.feature,
          props: mergeProps(defaultProps, props),
        },
      ] as Feature[];
    }
    exec(src?: string) {
      if (this.$editor.disabled) return;

      let _range: Range | null | undefined,
        cursoringBlock: HTMLElement | undefined,
        editorElm: HTMLElement | undefined;

      if (
        !(editorElm = this.$editor.elm) ||
        !(_range = this.$editor.range) ||
        !(cursoringBlock = this.$editor.cursoringBlock)
      ) {
        return;
      }
      if (!_range.collapsed) {
        _range.deleteContents();
      }
      const lastNode = deepTraverseRightNode(cursoringBlock);
      _range.setEnd(lastNode, lastNode.textContent?.length || 0);
      const mergedProps = mergeProps(defaultProps, {
          src,
        }),
        imgBlock = h(this.features[0].tag || 'div', mergedProps),
        nextElm = cursoringBlock.nextElementSibling,
        newBlock = this.$editor.renderNewBlock([imgBlock]),
        extractBlock = this.$editor.renderNewBlock(
          convertBlockToInline(_range.extractContents()) as DocumentFragment
        );
      let insertedBlock = editorElm.insertBefore(newBlock, nextElm);
      insertedBlock = editorElm.insertBefore(
        extractBlock,
        insertedBlock.nextElementSibling
      );
      const firstNode = deepTraverseLeftNode(insertedBlock);
      this.$editor.range = setCursorToStart(firstNode);
    }
    isActive() {
      return false;
    }
  };
}

export const ImagePlugin = makeImagePlugin();
