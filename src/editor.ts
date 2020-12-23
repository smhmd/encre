import {
  bfs,
  createDOM as h,
  deepTraverseLeftNode,
  deepTraverseRightNode,
  dfs,
  getRange,
  HyperChildren,
  HyperElement,
  HyperProps,
  lookup,
  mergeProps,
  setCursor,
  setCursorToStart,
  normalizeChildren,
} from './dom';
import {
  deepMergeOptions,
  isBlockStyleElement,
  isFunction,
  isHTMLElement,
  isString,
} from './helpers';
import { ExtractPluginInterface, PluginConstructor } from './Plugin';

type ClassesKeys =
  | 'container'
  | 'editor'
  | 'block'
  | 'block-content'
  | 'focused';
export type EditorClasses = {
  [T in ClassesKeys]?: string;
};

export interface EditorOptions extends Record<string, any> {
  readonly?: boolean;
  autofocus?: boolean;
  classes?: EditorClasses;
}

export interface Editor {
  elm: HTMLElement | undefined;
  cursoringBlock: HTMLElement | undefined;
  plugins: IReigsteredPlugin;
  range: Range | null | undefined;
  onRangeSaved: (cb: () => any) => void;
  renderNewBlock: (
    tagOrChildren?: string | HyperChildren,
    props?: HyperProps,
    children?: HyperChildren,
    innerProps?: Record<string, any>
  ) => HyperElement;
}

export const enum EditorRole {
  editor = 'editor-content',
  container = 'editor-container',
  block = 'editor-block',
  blockContent = 'editor-block-content',
}

export const defaultOptions: EditorOptions = {
  readonly: false,
  autofocus: true,
  classes: {
    editor: 'editor',
    container: 'editor__container',
    block: 'editor-block',
    focused: 'editor-block--focused',
    'block-content': 'editor-block__content',
  },
};

export type PluginItem = [plugin: PluginConstructor, args: any[]];

export type IReigsteredPlugin = ReturnType<typeof registerPlugins>;

function registerPlugins(ctx: Editor, plugins: PluginItem[]) {
  let item: PluginItem;
  const pluginMap = new WeakMap<PluginConstructor, any>();

  for (let i = 0; i < plugins.length; i++) {
    item = plugins[i];
    if (isFunction(item[0])) {
      pluginMap.set(item[0], new item[0](ctx, ...item[1]));
    }
  }
  return {
    get<T extends new (...args: any[]) => any>(
      constructorOrName: T
    ): ExtractPluginInterface<T> | undefined {
      return pluginMap.get(constructorOrName);
    },
  };
}

export function traverseAndFindBlockContent(elm: HTMLElement) {
  return bfs(
    elm,
    (current) => isHTMLElement(current) && isBlockContent(current)
  ) as HTMLElement | undefined;
}

function findFirstText(elm: Node) {
  return dfs(
    elm,
    (current) => current.nodeName === '#text' && !!current.textContent?.length
  );
}

type EventState = {
  isComposing: boolean;
  isPointerDown: boolean;
  timerId: number | any;
};
// backspace key down need to be smart
function resolveBackspace(ctx: Editor, e: KeyboardEvent, state: EventState) {
  let editorElm: HTMLElement | undefined,
    cursoringBlock: HTMLElement | undefined,
    _range: Range | null | undefined,
    currBlockContent: HTMLElement | undefined;

  if (
    state.timerId ||
    !(editorElm = ctx.elm) ||
    !(cursoringBlock = ctx.cursoringBlock) || // not cursoring
    !cursoringBlock.previousElementSibling || // is first element
    !(_range = ctx.range) || // no range
    !_range.collapsed || // is not collapsed
    !cursoringBlock.contains(_range.commonAncestorContainer) || // range content doesn't in editor
    !(currBlockContent = traverseAndFindBlockContent(cursoringBlock))
  ) {
    // heavy fast fail
    return;
  }

  const firstTextNode =
    findFirstText(currBlockContent) || cursoringBlock.firstChild;
  if (
    !firstTextNode ||
    !firstTextNode.isSameNode(_range.startContainer) || // range not first node
    !(_range.startOffset === 0) // range offset not at 0
  ) {
    return;
  }
  let closestBlockStyleElm: HTMLElement | undefined, lastNode: Node | undefined;
  if (
    !(closestBlockStyleElm = lookup(_range.startContainer, (current) =>
      isBlockStyleElement(current)
    ) as HTMLElement | undefined) ||
    !(lastNode = deepTraverseRightNode(closestBlockStyleElm))
  ) {
    return;
  }
  _range.setEnd(lastNode, lastNode.textContent?.length || 0);
  const extractFrag = _range.extractContents();
  let insertedNode: Node | undefined;
  if (isBlockContent(closestBlockStyleElm)) {
    // if closest block is content
    let previousElm: HTMLElement | undefined,
      previousBlC: HTMLElement | undefined;
    if (
      !(previousElm = cursoringBlock.previousElementSibling as
        | HTMLElement
        | undefined) ||
      !(previousBlC = traverseAndFindBlockContent(previousElm) as
        | HTMLElement
        | undefined)
    ) {
      return;
    }

    let lastNode: Node;
    let lastElement: HTMLElement | undefined;
    const lastChildIdx =
      previousBlC.childNodes.length > 0 ? previousBlC.childNodes.length - 1 : 0;
    if (
      !(lastNode = deepTraverseRightNode(previousBlC)) ||
      !(lastElement = lookup(lastNode, (curr) => isHTMLElement(curr)) as
        | HTMLElement
        | undefined)
    ) {
      return;
    }
    const endIdx = lastNode.textContent?.length || 0;
    if (!lastElement.textContent?.length) {
      // important
      // clear previous block's innner element
      // in case change appended style
      lastElement.innerHTML = '';
    }
    lastElement.insertBefore(extractFrag, null);
    editorElm.removeChild(cursoringBlock);
    lastNode = previousBlC.childNodes.item(lastChildIdx) || previousBlC;
    lastNode = deepTraverseRightNode(lastNode);
    state.timerId = setTimeout(() => {
      ctx.range = setCursor(lastNode, endIdx);
      clearTimeout(state.timerId);
      state.timerId = 0;
    });
  } else {
    // create new block paragraph
    // and insert it before current block
    const templateBlock = ctx.renderNewBlock(extractFrag);
    insertedNode = editorElm.insertBefore(templateBlock, cursoringBlock);
    if (
      !(insertedNode = traverseAndFindBlockContent(insertedNode as HTMLElement))
    ) {
      return;
    }
    // set range
    const leftTextNode = deepTraverseLeftNode(insertedNode);
    ctx.range = setCursorToStart(leftTextNode);
    closestBlockStyleElm.remove();
  }
}

function resolveEnter(ctx: Editor, e: KeyboardEvent) {
  e.preventDefault();
  let _range: Range | null | undefined,
    closestBlockElm: HTMLElement | undefined;
  if (
    !(_range = ctx.range) ||
    !(closestBlockElm = lookup(_range.commonAncestorContainer, (current) =>
      isBlockStyleElement(current)
    ) as HTMLElement | undefined)
  ) {
    return;
  }
  if (!_range.collapsed) {
    _range.deleteContents();
  }
  const lastNode = deepTraverseRightNode(closestBlockElm);
  // set end to the last node
  _range.setEnd(lastNode, lastNode.textContent?.length || 0);
  const extractFrag = _range.extractContents();
  let insertedNode: HTMLElement | undefined;
  if (
    isBlockContent(closestBlockElm) ||
    (closestBlockElm.parentElement?.lastElementChild?.isSameNode(
      closestBlockElm
    ) &&
      !closestBlockElm.textContent?.length)
  ) {
    // if closest block element is editable element
    // or there is no text in this element
    // just append a new template block
    let editorElm: HTMLElement | undefined,
      cursoringBlock: HTMLElement | undefined;
    if (!(editorElm = ctx.elm)) return;
    const templateBlock = ctx.renderNewBlock(extractFrag);
    insertedNode = editorElm.insertBefore(
      templateBlock,
      ((cursoringBlock = ctx.cursoringBlock) &&
        cursoringBlock.nextElementSibling) ||
        null
    ) as HTMLElement;
    if (!(insertedNode = traverseAndFindBlockContent(insertedNode))) {
      return;
    }

    // delete empty and not-content closest block
    if (!isBlockContent(closestBlockElm)) {
      closestBlockElm.parentElement?.removeChild(closestBlockElm);
    }
  } else {
    let parentElm: HTMLElement | null;
    if (!(parentElm = closestBlockElm.parentElement)) return;
    const clonedElm = closestBlockElm.cloneNode();
    clonedElm.appendChild(extractFrag);
    insertedNode = parentElm.insertBefore(
      clonedElm,
      closestBlockElm.nextElementSibling
    ) as HTMLElement;
  }
  let childNode: Node | null;
  if ((childNode = deepTraverseLeftNode(insertedNode))) {
    ctx.range = setCursorToStart(childNode);
  }
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
function resolveKeydown(ctx: Editor, e: KeyboardEvent, state: EventState) {
  switch (e.key) {
    case 'Enter': {
      resolveEnter(ctx, e);
      break;
    }
    case 'Backspace': {
      resolveBackspace(ctx, e, state);
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

function createEvents(ctx: Editor) {
  const state = {
    isComposing: false,
    isPointerDown: false,
    timerId: 0,
  };

  return {
    onKeydown: (e: KeyboardEvent) => {
      if (state.isComposing) return;
      updateRangeFromDocument(ctx);
      resolveKeydown(ctx, e, state);
    },
    onKeyup: () => {
      if (state.isComposing) return;
      updateRangeFromDocument(ctx);
    },
    onCompositionstart: () => {
      state.isComposing = true;
    },
    onCompositionend: () => {
      state.isComposing = false;
    },
    onPointerdown: () => {
      state.isPointerDown = true;
    },
    onPointerup: (e: PointerEvent) => {
      state.isPointerDown = false;
      updateRangeFromDocument(ctx);
    },
  };
}

function makeIsRoleEqualFunction(roleName: EditorRole) {
  return function (elm: HTMLElement) {
    return elm.getAttribute('role') === roleName;
  };
}

export const isEditorElement = makeIsRoleEqualFunction(EditorRole.editor);
export const isBlockElement = makeIsRoleEqualFunction(EditorRole.block);
export const isBlockContent = makeIsRoleEqualFunction(EditorRole.blockContent);

let uid = 0;
export function createEditor(
  root: Node,
  opts: EditorOptions = {},
  plgs: PluginItem[] = []
): Editor {
  const _uid = uid++;
  const _options = deepMergeOptions(defaultOptions, opts),
    _classes = _options.classes!;
  let _plugins: IReigsteredPlugin,
    _events: Record<string, any>,
    _range: Range | null | undefined,
    _cursoringBlock: HTMLElement | undefined;

  const rangeSavedCallbacks: Array<() => any> = [];
  function callRangeSavedArrays() {
    let cb: () => any;
    for (let i = 0; i < rangeSavedCallbacks.length; i++) {
      cb = rangeSavedCallbacks[i];
      if (cb && isFunction(cb)) {
        cb.call(null);
      }
    }
  }
  const updateFocusedBlock = () => {
    if (!_range) return;
    // update focused
    const rangingContainer = _range.commonAncestorContainer,
      rawBlock = _cursoringBlock;
    if (rawBlock && rawBlock.contains(rangingContainer)) return;
    const newBlock = lookup(
      rangingContainer,
      (current) => isHTMLElement(current) && isBlockElement(current)
    ) as HTMLElement | undefined;
    if (!newBlock) return;
    _cursoringBlock = newBlock;
    rawBlock?.classList.remove(_classes.focused!);
    _cursoringBlock.classList.add(_classes.focused!);
  };
  const isRangeAvailable = (r: Range | null | undefined): r is Range => {
    if (!r || !instance.elm?.contains(r.commonAncestorContainer)) return false;
    return !!lookup(
      r.commonAncestorContainer,
      (current) => isHTMLElement(current) && isBlockContent(current)
    );
  };

  const shallowClearBlockContent = () => {
    let blc: HTMLElement | undefined;
    if (
      !_cursoringBlock ||
      !(blc = traverseAndFindBlockContent(_cursoringBlock))
    )
      return;
    let child: Node;
    for (let i = 0; i < blc.childNodes.length; ) {
      child = blc.childNodes.item(i);
      if (!isBlockStyleElement(child) && !child.textContent?.length) {
        blc.removeChild(child);
      } else {
        i++;
      }
    }
  };

  // instance
  const instance: Editor = {
    get elm() {
      return bfs(
        root,
        (current) =>
          isHTMLElement(current) &&
          isEditorElement(current) &&
          current._uid === _uid
      ) as HTMLElement | undefined;
    },
    get plugins() {
      return _plugins;
    },
    get range(): Range | null | undefined {
      return _range;
    },
    set range(val: Range | null | undefined) {
      if (!isRangeAvailable(val)) return;
      // set range
      _range = val;
      // update focused Block
      updateFocusedBlock();
      // call range saved callbacks
      callRangeSavedArrays();
      // clear content inner empty inline elements
      shallowClearBlockContent();
    },
    onRangeSaved(cb: () => any) {
      if (cb && isFunction(cb)) {
        rangeSavedCallbacks.push(cb);
      }
    },
    get cursoringBlock() {
      return _cursoringBlock;
    },
    renderNewBlock(
      tagOrChildren: string | HyperChildren = 'p',
      props: HyperProps = {},
      children?: HyperChildren,
      innerProps?: Record<string, any>
    ) {
      let tag: string = 'p';
      let _children: any[] = [];
      if (isString(tagOrChildren)) {
        tag = tagOrChildren || 'p';
      } else {
        _children = normalizeChildren(tagOrChildren);
      }

      if (children) {
        _children = _children.concat(normalizeChildren(children));
      }
      const _props = _options.readonly
        ? {}
        : {
            contenteditable: true,
          };
      const content = h(
        tag,
        mergeProps(props, _props, { role: EditorRole.blockContent }),
        _children
      );
      if (innerProps) {
        for (let iKey in innerProps) {
          content[iKey] = innerProps[iKey];
        }
      }
      return h(
        'div',
        {
          class: _options.classes?.block,
          role: EditorRole.block,
        },
        content
      );
    },
  };
  // initial global variables
  _plugins = registerPlugins(instance, plgs);
  _events = _options.readonly ? {} : createEvents(instance);
  // create children
  const content = instance.renderNewBlock();
  const editor = h(
    'div',
    mergeProps(
      {
        class: _classes.editor,
        role: EditorRole.editor,
      },
      _events
    ),
    content
  );
  // set editor universal id
  editor._uid = _uid;
  const container = h(
    'div',
    {
      role: EditorRole.container,
      class: _classes.container,
      spellcheck: 'false',
      tabindex: '-1',
    },
    editor
  );
  // root append Child
  root.appendChild(container);

  return instance;
}
