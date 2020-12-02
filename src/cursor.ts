import { $ } from './dom';
import { EncreEditor } from './editor';
import { EditorRoles } from './elements';
import { isUndefined } from './helpers';

function createGetParentTemplate(
  n: Node | HTMLElement,
  cb: (parent: HTMLElement) => boolean = (...args: any) => false
) {
  let parent = n.parentElement;
  while (parent && !cb.call(null, parent)) {
    parent = parent.parentElement;
  }
  return parent;
}

// const getClosestParagrph = (node: Node) =>
//   createGetParentTemplate(
//     node,
//     (parent) => parent.getAttribute('contenteditable') === 'true'
//   );

const getClosetBlock = (n: Node) =>
  createGetParentTemplate(
    n,
    (parent) => parent.getAttribute('role') === EditorRoles.EDITOR_BLOCK
  );

export class EncreCursor {
  range?: Range;
  cursoredElm?: HTMLElement;
  $editor: EncreEditor;
  constructor(editor: EncreEditor) {
    this.$editor = editor;
  }

  get collapsed() {
    return this.range?.collapsed;
  }

  get rangeSameNode() {
    if (!this.range) return;
    return (
      !this.collapsed &&
      this.range.startContainer === this.range.endContainer &&
      this.range.commonAncestorContainer === this.range.startContainer &&
      this.range.commonAncestorContainer === this.range.endContainer
    );
  }

  initRange(rootElm: Element) {
    const node = $.getLastRightNode(rootElm),
      offset = node.textContent?.length || 0;
    if (!node || isUndefined(offset)) return;
    this.range = $.setCursor(node, offset);
    this.saveCursoredElm();
  }

  saveRange(r?: Range | null) {
    if (r) {
      this.range = r;
      return;
    }
    let tempRange: Range | null;
    if ((tempRange = $.range)) {
      this.range = tempRange;
    }
  }

  saveCursoredElm() {
    if (!this.range) return;
    let cursoringElm: HTMLElement | null;
    if (
      (cursoringElm = getClosetBlock(this.range.startContainer)) &&
      this.cursoredElm !== cursoringElm
    ) {
      if (this.cursoredElm) {
        // remove previous cursored focus class
        this.cursoredElm.classList.remove(this.$editor.focusClassName);
      }
      // set cursored paragraph
      this.cursoredElm = cursoringElm;
      // add focused class to new cursoring elment
      this.cursoredElm.classList.add(this.$editor.focusClassName);
    }
  }
}
