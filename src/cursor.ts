import { hasWindow, isUndefined, throwError } from './helpers';
import { AbstractNode, traverse, PathMap } from './node';

export class Cursor {
  static get selection() {
    if (!hasWindow()) throwError('No Window Specified');
    return window.getSelection();
  }
  static get range() {
    let selection: Selection | null;
    if (!(selection = Cursor.selection) || !selection.rangeCount) return null;
    return selection.getRangeAt(0);
  }
  static get commonAncestorContainer() {
    return Cursor.range?.commonAncestorContainer || null;
  }

  range?: Range | null;
  editor: AbstractNode;
  constructor(rootNode: AbstractNode) {
    this.editor = rootNode;
  }
  get ancestorNode() {
    const container = Cursor.commonAncestorContainer;
    if (!container || isUndefined(container._uid)) return null;
    return traverse(this.editor, container._uid) || null;
  }
  // TODO
  saveRange(r?: Range) {
    if (r) {
      this.range = r
      return
    }
    this.range = Cursor.range
  }
  // TODO
  recoverRange() {}
}
