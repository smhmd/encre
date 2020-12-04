import { EditorCursor } from './cursor';
import { $, createDom as h, render } from './dom';
import { Editor } from './editor';
import { isTextNode, isUndefined } from './helpers';
import { EditorElements, IEditorTool, ToolEnum } from './tool';

const defaultEventOptions = {
  tabWidth: 2,
};

export type EventOptions = Partial<typeof defaultEventOptions>;
export class EditorEvent {
  isComposing: boolean;
  $cursor: EditorCursor;
  $editor: Editor;
  $elements: EditorElements;
  $tools: IEditorTool[];
  opts: typeof defaultEventOptions;
  constructor(editor: Editor, options: EventOptions = {}) {
    this.isComposing = false;
    this.$editor = editor;
    this.$cursor = this.$editor.$cursor;
    this.$elements = this.$editor.$elements;
    this.$tools = this.$editor.tools;
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
        this.$cursor.saveRange($.setCursor(anchorNode, anchorOffset));
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

  insertNewParagraph(contents: DocumentFragment) {
    let editorElm: HTMLElement | undefined,
      cursoredElm: HTMLElement | undefined;
    if (
      !(editorElm = this.$editor.elm) ||
      !(cursoredElm = this.$cursor.cursoredElm)
    ) {
      return;
    }
    const container = render(
      this.$elements.createTemplateBlock(this.$elements.createParagraph())
    );
    // append cloneContents to new container
    $.setLastRightElement(container as Element, contents);
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

  copyRawContents() {
    let cursoredElm: HTMLElement | undefined;
    if (!this.$cursor.range || !(cursoredElm = this.$cursor.cursoredElm)) {
      return;
    }
    const { startContainer, startOffset, endContainer } = this.$cursor.range;
    const newRange = $.createRange();
    if (!this.$cursor.collapsed) {
      // range something
      this.$cursor.range.deleteContents();
    }
    // select range to the last of elements
    if (!endContainer.parentElement) return;
    const lastNode = $.getLastRightNode(endContainer.parentElement);
    newRange.setStart(startContainer, startOffset);
    newRange.setEnd(lastNode, lastNode.textContent?.length || 0);
    const cloneContents = newRange.cloneContents();
    return { cloneContents, newRange };
  }
  /**
   * on Enter key down
   */
  private _onEnter() {
    const copiedResult = this.copyRawContents();
    if (isUndefined(copiedResult)) return;
    const { cloneContents, newRange } = copiedResult;
    let tool: IEditorTool, canEnter: boolean;
    // interupt enter with block tools
    for (let i = 0; i < this.$tools.length; i++) {
      tool = this.$tools[i];
      if (tool.type !== ToolEnum.BLOCK) continue;
      canEnter = !!tool.onEnter(cloneContents, newRange);
      if (canEnter) {
        return;
      }
    }
    // insert default new paragraph
    this.insertNewParagraph(cloneContents);
    newRange.deleteContents();
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
