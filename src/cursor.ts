import { $ } from './dom';
import { Editor } from './editor';
import { EditorRoles } from './tool';
import { isUndefined } from './helpers';

const getClosestParagrph = (node: Node) =>
  $.createGetParentTemplate(
    node,
    (parent) => parent.getAttribute('contenteditable') === 'true'
  );

const getClosetBlock = (n: Node) =>
  $.createGetParentTemplate(
    n,
    (parent) => parent.getAttribute('role') === EditorRoles.EDITOR_BLOCK
  );

export class EditorCursor {
  range?: Range;
  cursoredElm?: HTMLElement;
  $editor: Editor;
  callbacks: Array<($cursor: this) => any>;
  constructor(editor: Editor) {
    this.$editor = editor;
    this.callbacks = [];
  }

  registerOnRangeCallbacks(cb?: ($cursor: this) => any) {
    cb && this.callbacks.push(cb);
  }

  private execCallbacks() {
    let cb: ($cursor: this) => any;
    const self = this;
    for (let i = 0; i < self.callbacks.length; i++) {
      cb = self.callbacks[i];
      cb && cb.call(null, self);
    }
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
      this.execCallbacks();
      return;
    }
    let tempRange: Range | null;
    if ((tempRange = $.range)) {
      this.execCallbacks();
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

      this.execCallbacks();
    }
  }
}
