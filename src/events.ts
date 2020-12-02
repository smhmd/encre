import { EncreCursor } from './cursor';
import { $, render } from './dom';
import { p } from './elements';
import { EncreEditor } from './editor';
import { isTextNode } from './helpers';

const defaultEventOptions = {
  tabWidth: 2,
};

export type EventOptions = Partial<typeof defaultEventOptions>;
export class EncreEvent {
  isComposing: boolean;
  $cursor: EncreCursor;
  $editor: EncreEditor;
  opts: typeof defaultEventOptions;
  constructor(
    editor: EncreEditor,
    cursor: EncreCursor,
    options: EventOptions = {}
  ) {
    this.isComposing = false;
    this.$cursor = cursor;
    this.$editor = editor;
    this.opts = Object.assign({}, defaultEventOptions, options);
  }
  onAfterUpdate() {
    this.$cursor.saveCursoredElm();
  }

  onBeforeUpdate() {
    const selection = $.selection;
    let anchorNode: Node | null, anchorOffset: number;
    if ($.isCursoring) {
      if (selection && (anchorNode = selection.anchorNode)) {
        anchorOffset = selection.anchorOffset;
        this.$cursor.range = $.setCursor(anchorNode, anchorOffset);
      }
    } else if ($.isOnRange) {
      this.$cursor.saveRange();
    }
  }
  /**
   * composition start
   * @param e CompositionEvent
   */
  onCompositionstart(e: CompositionEvent) {
    this.onBeforeUpdate();
    this.isComposing = true;
  }
  /**
   * composition end
   */
  onCompositionend() {
    this.isComposing = false;
    this.onAfterUpdate();
  }
  /**
   * input data
   */
  onInput() {
    if (this.isComposing) return;
  }

  /**
   * Mouse down
   */
  onMousedown() {}

  /**
   *  Mouse Up
   */
  onMouseup() {
    this.onBeforeUpdate();
    this.onAfterUpdate();
  }

  /**
   * on Tab key down
   */
  private _onTab() {
    if (!this.$cursor.range) return;
    const {
      startContainer,
      startOffset,
      endContainer,
      endOffset,
    } = this.$cursor.range;
    if (!isTextNode(startContainer) || !isTextNode(endContainer)) return;
    const tabLength = this.opts.tabWidth || defaultEventOptions.tabWidth;
    const tabWord = '\u00A0'.repeat(tabLength);
    if (this.$cursor.rangeSameNode) {
      // range same Node
      startContainer.replaceData(startOffset, endOffset - startOffset, tabWord);
    } else {
      if (!this.$cursor.collapsed) {
        // range over nodes
        this.$cursor.range.deleteContents();
      }
      startContainer.insertData(startOffset, tabWord);
    }
    const range = $.setCursor(startContainer, startOffset + tabLength);
    this.$cursor.saveRange(range);
  }

  /**
   * on Enter key down
   */
  private _onEnter() {
    let editorElm: HTMLElement | undefined,
      cursoredElm: HTMLElement | undefined;
    if (
      !(editorElm = this.$editor.elm) ||
      !this.$cursor.range ||
      !(cursoredElm = this.$cursor.cursoredElm)
    ) {
      return;
    }
    const { startContainer, startOffset } = this.$cursor.range;
    const newRange = $.createRange();
    if (!this.$cursor.collapsed) {
      // range something
      this.$cursor.range.deleteContents();
    }
    // select range to the last of elements
    const lastNode = $.getLastRightNode(this.$cursor.cursoredElm);
    newRange.setStart(startContainer, startOffset);
    newRange.setEnd(lastNode, lastNode.textContent?.length || 0);
    const cloneContents = newRange.cloneContents();
    // delete chosen contents
    newRange.deleteContents();
    const container = render(p());
    // append cloneContents to new container
    $.setLastRightElement(container as Element, cloneContents);
    let nextSibling: Element | null;
    // appen new paragraph
    if ((nextSibling = cursoredElm.nextElementSibling)) {
      editorElm.insertBefore(container, nextSibling);
    } else {
      editorElm.appendChild(container);
    }
    // save range at new line
    this.$cursor.saveRange(
      $.setCursor($.getFirstLeftNode(container as Element), 0)
    );
    // set focus class to new line
    this.$cursor.saveCursoredElm();
  }

  private _onBackspace() {
    let cursoredElm: HTMLElement | undefined,
      editorElm: HTMLElement | undefined;
    if (
      !(editorElm = this.$editor.elm) ||
      !(cursoredElm = this.$cursor.cursoredElm) ||
      cursoredElm.textContent
    ) {
      return;
    }
    let previousElm: Element | null, lastNode: ChildNode | null | Text;
    // get previous block item
    if (editorElm.children.length > 1) {
      // if root element's has child then remove cursored element
      previousElm = cursoredElm.previousElementSibling;
      editorElm.removeChild(cursoredElm);
    } else {
      previousElm = cursoredElm;
    }
    if (
      !previousElm ||
      !(lastNode = $.getLastRightNode(previousElm)) ||
      !isTextNode(lastNode)
    ) {
      return;
    }
    // set cursor at new node & save this cursor
    this.$cursor.saveRange($.setCursor(lastNode, lastNode.data.length));
    // save current cursored element
    this.$cursor.saveCursoredElm();
  }
  /**
   * keydown event
   * @param e
   */
  onKeydown(e: KeyboardEvent) {
    if (this.isComposing) return;
    this.onBeforeUpdate();
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        this._onEnter();
        break;
      }
      case 'Tab': {
        e.preventDefault();
        this._onTab();
        break;
      }
      case 'Backspace': {
        this._onBackspace();
        break;
      }
      default: {
        this.$cursor.saveRange();
        break;
      }
    }
  }

  /**
   * keyup event
   */
  onKeyup(e: KeyboardEvent) {
    this.onAfterUpdate();
  }
}
