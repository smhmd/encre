import { Editor, HyperElement } from './config';
import {
  deepTraverseLeftNode,
  deepTraverseRightNode,
  getRange,
  isBlockContent,
  lookup,
  setCursorToEnd,
  setCursorToStart,
  traverseAndFindBlockContent,
} from './dom';
import { isBlockStyleElement, isHTMLElement } from './helpers';

function resetCursoringBlock(ctx: Editor) {
  let editorElm: HTMLElement | undefined,
    cursoringBlock: HTMLElement | undefined;
  if (!(editorElm = ctx.elm) || !(cursoringBlock = ctx.cursoringBlock)) return;
  const newBlock = ctx.renderNewBlock() as Element;
  const insertedElm = editorElm.insertBefore(
    newBlock,
    cursoringBlock.nextElementSibling
  );
  editorElm.removeChild(cursoringBlock);
  const lastNode = deepTraverseRightNode(insertedElm);
  ctx.range = setCursorToEnd(lastNode);
}
// backspace key down need to be smart
function resolveBackspace(ctx: Editor, e: KeyboardEvent) {
  let _range: Range | null | undefined,
    cursoringBlock: HTMLElement | undefined,
    deepFirstNode: Node | null = null,
    editorElm: HTMLElement | undefined;
  let blc: HTMLElement | undefined;
  if (
    ctx.cursoringBlock &&
    (blc = traverseAndFindBlockContent(ctx.cursoringBlock)) &&
    blc.childElementCount > 0 &&
    !blc.textContent?.length
  ) {
    resetCursoringBlock(ctx);
    return;
  }
  if (
    !(_range = ctx.range) ||
    !_range.collapsed ||
    _range.startOffset !== 0 ||
    !(cursoringBlock = ctx.cursoringBlock) ||
    !(editorElm = ctx.elm) ||
    !(deepFirstNode = deepTraverseLeftNode(cursoringBlock)) ||
    !deepFirstNode.isSameNode(_range.startContainer)
  ) {
    return;
  }

  let prevCursorElm = cursoringBlock.previousElementSibling;
  if (!cursoringBlock.textContent?.length) {
    if (!prevCursorElm) {
      const blc = traverseAndFindBlockContent(cursoringBlock);
      if (!blc) return;
      const newBlock = ctx.renderNewBlock() as Element;
      prevCursorElm = editorElm.insertBefore(
        newBlock,
        cursoringBlock.nextElementSibling
      );
    }
    editorElm.removeChild(cursoringBlock);
  }
  if (!prevCursorElm) return;
  const lastNode = deepTraverseRightNode(prevCursorElm);
  lastNode.textContent += '\u00A0';
  ctx.range = setCursorToEnd(lastNode);
}

function resolveEnter(ctx: Editor, e: KeyboardEvent) {
  let _range: Range | null | undefined,
    closestBlockElm: HTMLElement | undefined,
    cursoringBlock: HTMLElement | undefined,
    editorElm: HTMLElement | undefined;
  if (
    !(_range = ctx.range) ||
    !_range.collapsed ||
    !(closestBlockElm = lookup(
      _range.startContainer,
      (curr) => isHTMLElement(curr) && isBlockStyleElement(curr)
    ) as HTMLElement | undefined) ||
    !(cursoringBlock = ctx.cursoringBlock) ||
    !(editorElm = ctx.elm)
  ) {
    return e.preventDefault();
  }

  let insertedElm: HyperElement;
  let extractContents: DocumentFragment | undefined;
  if (isBlockContent(closestBlockElm)) {
    e.preventDefault();

    const lastNode = deepTraverseRightNode(closestBlockElm);
    _range.setEnd(lastNode, lastNode.textContent?.length || 0);
    extractContents = _range.extractContents();
  } else if (
    !closestBlockElm.textContent?.length &&
    closestBlockElm.previousElementSibling &&
    !closestBlockElm.nextElementSibling
  ) {
    e.preventDefault();
    closestBlockElm.parentElement?.removeChild(closestBlockElm);
  } else {
    return;
  }
  insertedElm = editorElm.insertBefore(
    ctx.renderNewBlock(extractContents),
    cursoringBlock.nextElementSibling
  );
  ctx.range = setCursorToStart(deepTraverseRightNode(insertedElm));
}
/**
 * @internal on tab key down
 * @param ctx
 * @param e
 */
function resolveTab(ctx: Editor, e: KeyboardEvent) {
  e.preventDefault();
  let _range: Range | null | undefined;
  if (!(_range = ctx.range)) return;
  const tabWord = '\u00A0'.repeat(4);
  if (!_range.collapsed) {
    _range.deleteContents();
  }
  _range.insertNode(document.createTextNode(tabWord));
  _range.collapse(false);
  ctx.range = _range;
}
function resolveKeydown(ctx: Editor, e: KeyboardEvent) {
  switch (e.key) {
    case 'Enter': {
      resolveEnter(ctx, e);
      break;
    }
    case 'Backspace': {
      resolveBackspace(ctx, e);
      break;
    }
    case 'Tab': {
      resolveTab(ctx, e);
      break;
    }
    default:
      break;
  }
}

function updateRangeFromDocument(ctx: Editor) {
  let _range: Range | null;
  if (!(_range = getRange()) || ctx.range === _range) {
    // just in case no range selected and duplicated selection
    return;
  }
  ctx.range = _range;
}

export function createEvents(ctx: Editor) {
  let isComposing: boolean, isPointerDown: boolean;
  return {
    onKeydown: (e: KeyboardEvent) => {
      if (isComposing) return;
      updateRangeFromDocument(ctx);
      resolveKeydown(ctx, e);
    },
    onKeyup: () => {
      if (isComposing) return;
      updateRangeFromDocument(ctx);
    },
    onCompositionstart: () => {
      isComposing = true;
    },
    onCompositionend: () => {
      isComposing = false;
    },
    onPointerdown: () => {
      isPointerDown = true;
      updateRangeFromDocument(ctx);
    },
    onPointerup: (e: PointerEvent) => {
      isPointerDown = false;
      updateRangeFromDocument(ctx);
    },
  };
}
