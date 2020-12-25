import {
  mergeProps,
  createDOM as h,
  convertBlockToInline,
  setCursorToStart,
  deepTraverseLeftNode,
} from '../dom';
import { Editor, HyperProps } from '../config';
import { IPlugin, PluginConstructor, PluginTemplate, Feature } from '../plugin';

export function makeImagePlugin() {
  const defaultProps = {
    src: '',
    alt: '',
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
      const mergedProps = mergeProps(defaultProps, {
          src,
          'data-src': src,
        }),
        imgBlock = h(this.features[0].tag || 'img', mergedProps),
        nextElm = cursoringBlock.nextElementSibling,
        newBlock = this.$editor.renderNewBlock([imgBlock]),
        extractBlock = this.$editor.renderNewBlock(
          convertBlockToInline(_range.extractContents()) as DocumentFragment
        );
      const insertedBlock = editorElm.insertBefore(extractBlock, nextElm);
      editorElm.insertBefore(newBlock, insertedBlock);
      const firstNode = deepTraverseLeftNode(insertedBlock);
      this.$editor.range = setCursorToStart(firstNode);
    }
    isActive() {
      return false;
    }
  };
}

export const ImagePlugin = makeImagePlugin();
