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
  static get commonAncestorNode() {
    return (root: AbstractNode) => {
      const container = Cursor.commonAncestorContainer?.parentElement;
      if (!container || isUndefined(container._uid)) return null;
      return traverse(root, container._uid) || null;
    };
  }
  range: Range;
  constructor() {
    this.range = Cursor.range || document.createRange();
  }
  // TODO
  saveRange() {}
  // TODO
  recoverRange() {}
}
