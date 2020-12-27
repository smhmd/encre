import { Editor, EditorRole, HyperProps } from '../config';
import { IPlugin, PluginTemplate, Feature, PluginConstructor } from './plugin';
import {
  convertBlockToInline,
  createDOM as h,
  deepTraverseRightNode,
  lookup,
  mergeProps,
  setCursorToEnd,
  traverseAndFindBlockContent,
  isBlockContent,
} from '../dom';
import { isHTMLElement } from '../helpers';

const defaultListProps: HyperProps = {
  class: 'editor-list',
};
const defaultItemProps: HyperProps = {
  class: 'editor-list-item',
};

function makeListPlugin(ordered?: boolean) {
  const tagName = ordered ? 'ol' : 'ul';
  const listFeaure: Feature = {
    tag: tagName,
    name: tagName,
    props: {},
  };
  const itemFeature: Feature = {
    tag: 'li',
    name: 'li',
    props: {},
  };

  return class ListPlugin extends PluginTemplate implements IPlugin {
    features: Feature[] = [];
    constructor(
      editor: Editor,
      listProps: HyperProps = {},
      itemProps: HyperProps = {}
    ) {
      super(editor);
      listFeaure.props = mergeProps(defaultListProps, listProps, {
        feature: listFeaure.name,
        contenteditable: true,
        role: EditorRole.blockContent,
      });
      itemFeature.props = mergeProps(defaultItemProps, itemProps, {
        feature: itemFeature.name,
      });
      this.features = [listFeaure, itemFeature];
    }
    exec() {
      const { cursoringBlock, elm: editorElm } = this.$editor;
      let blc: HTMLElement | undefined, nextBlock: Element | null;

      if (
        this.$editor.disabled ||
        !editorElm ||
        !cursoringBlock ||
        !(blc = traverseAndFindBlockContent(cursoringBlock)) ||
        blc.tagName === tagName.toUpperCase()
      ) {
        return;
      }
      const frag = document.createDocumentFragment();
      let props: Record<string, any> = {};

      if (blc.tagName === (ordered ? 'UL' : 'OL')) {
        // change tagName when list block
        let attr: Attr | null;
        for (let i = 0; i < blc.attributes.length; i++) {
          attr = blc.attributes.item(i);
          if (!attr) continue;
          props[attr.name] = attr.value;
        }
        props['feature'] = listFeaure.name;
        frag.append(...blc.childNodes);
      } else {
        props = listFeaure.props;
        const convertedFrag = convertBlockToInline(blc);
        frag.append(
          h('li', itemFeature.props, convertedFrag as DocumentFragment)
        );
      }
      const newBlock = this.$editor.renderNewBlock(tagName, props, frag);
      nextBlock = cursoringBlock.nextElementSibling;
      editorElm.removeChild(cursoringBlock);
      const insertedBlock = editorElm.insertBefore(newBlock, nextBlock);
      const lastChild = deepTraverseRightNode(insertedBlock);
      this.$editor.range = setCursorToEnd(lastChild);
    }

    isActive() {
      let r: Range | null | undefined;
      if (!(r = this.$editor.range)) return false;
      return Boolean(
        lookup(
          r.commonAncestorContainer,
          (curr) =>
            isHTMLElement(curr) &&
            isBlockContent(curr) &&
            curr.getAttribute('feature') === listFeaure.name
        )
      );
    }
  };
}

export const OrderedList = makeListPlugin(true);
export const UnorderedList = makeListPlugin();
