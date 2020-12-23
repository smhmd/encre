import { Editor, isBlockContent, traverseAndFindBlockContent } from '../editor';
import { IPlugin, PluginTemplate } from '../Plugin';
import {
  convertBlockToInline,
  createDOM as h,
  deepTraverseRightNode,
  lookup,
  setCursorToEnd,
} from '../dom';
import { isHTMLElement } from '../helpers';

function makeListPlugin(ordered?: boolean) {
  return class ListPlugin extends PluginTemplate implements IPlugin {
    _inner_role: string;
    constructor(editor: Editor) {
      super(editor);
      this._inner_role = 'list-' + this._uid;
    }
    exec() {
      const { cursoringBlock, range, elm: editorElm } = this.$editor;
      let blc: HTMLElement | undefined, nextBlock: Element | null;

      if (
        !editorElm ||
        !cursoringBlock ||
        !(blc = traverseAndFindBlockContent(cursoringBlock)) ||
        blc.tagName === (ordered ? 'OL' : 'UL')
      ) {
        return;
      }
      const tagName = ordered ? 'ol' : 'ul';
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
        frag.append(...blc.childNodes);
      } else {
        props = {
          class: 'editor-list',
        };
        const convertedFrag = convertBlockToInline(blc);
        frag.append(
          h(
            'li',
            {
              class: 'editor-list-item',
            },
            convertedFrag as DocumentFragment
          )
        );
      }
      const newBlock = this.$editor.renderNewBlock(tagName, props, frag, {
        _inner_role: this._inner_role,
      });
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
          r.startContainer,
          (curr) =>
            isHTMLElement(curr) &&
            isBlockContent(curr) &&
            curr['_inner_role'] === this._inner_role
        )
      );
    }
  };
}

export const OrderedList = makeListPlugin(true);
export const UnorderedList = makeListPlugin();
