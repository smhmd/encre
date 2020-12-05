import {
  EncreError,
  getTop,
  hasDocument,
  isArray,
  isObject,
  isString,
  hyphenate,
  deepClone,
  isUndefined,
  hasWindow,
} from './helpers';
import { EditorRoles } from './tool';
const enum AbstractDomType {
  FRAGMENT = 1,
  NODES = 1 << 1,
  TEXT = 1 << 2,
  BLOCK = 1 << 3,
}
export function isAbstractBlock(type: AbstractDomType) {
  return type === AbstractDomType.BLOCK;
}
export const $ = {
  createElement(tag: string) {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    return document.createElement(tag);
  },
  createTextNode(str: string) {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    const textNode = document.createTextNode(str);
    textNode._in_encre = true;
    return textNode;
  },
  createFragment() {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    return document.createDocumentFragment();
  },
  seletor(str: string) {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    return document.querySelector(str);
  },
  get selection() {
    if (!hasWindow()) throw new EncreError('No Window Specified');
    return window.getSelection();
  },
  get range() {
    let selection: Selection | null;
    if (!(selection = $.selection) || !selection.rangeCount) return null;
    return selection.getRangeAt(0);
  },
  createRange() {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    return document.createRange();
  },
  execCommand(commandName: string, value?: string) {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    return (
      document.queryCommandSupported(commandName) &&
      document.execCommand(commandName, false, value)
    );
  },
  checkCommandState(commandName: string) {
    if (!hasDocument()) throw new EncreError('No Document Specified');
    return document.queryCommandState(commandName);
  },
  getFirstLeftNode(root: Element | Node | DocumentFragment) {
    if (!root.firstChild) return root;
    let first = root.firstChild;
    while (first && first.firstChild) {
      first = first.firstChild;
    }
    return first;
  },
  getLastRightNode(root: Element) {
    if (!root.lastChild) return root;
    let last = root.lastChild;
    while (last && last.lastChild) {
      last = last.lastChild;
    }
    return last;
  },
  getLastRightElement(root: Element) {
    if (!root.lastElementChild) return root;
    let last = root.lastElementChild;
    while (last && last.lastElementChild) {
      last = last.lastElementChild;
    }
    return last;
  },
  setLastRightElement<T extends Node>(root: Element, n: T) {
    let elm: Element | null = root;
    while (elm.children.length > 0) {
      if (!(elm = elm.lastElementChild)) {
        return;
      }
    }
    elm.appendChild(n);
  },
  setCursor(n: Node, offset: number) {
    const range = $.createRange(),
      selection = $.selection;
    if (!selection) return;
    range.setStart(n, offset);
    range.setEnd(n, offset);
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  },
  get isCursoring() {
    return $.selection?.type === 'Caret';
  },
  get isOnRange() {
    return $.selection?.type === 'Range';
  },
  traverseAndFind(
    elm: HTMLElement | Element,
    cb: (element: HTMLElement | Element) => boolean = () => true
  ): HTMLElement | Element | undefined {
    // travse DOM tree and find the element with queue
    const queue: Array<Element | HTMLElement> = [elm];
    let currentElm: HTMLElement | Element;
    while (queue.length > 0) {
      currentElm = queue.shift()!;
      if (cb.call(null, currentElm)) return currentElm;
      for (let i = 0; i < currentElm.children.length; i++) {
        queue.push(currentElm.children[i]);
      }
    }
    return;
  },
  createGetParentTemplate(
    n: Node | HTMLElement,
    cb: (parent: HTMLElement) => boolean = (...args: any) => false
  ) {
    let parent = n.parentElement;
    while (parent && !cb.call(null, parent)) {
      parent = parent.parentElement;
    }
    return parent;
  },
  get spaceUnicode() {
    return '\u00A0';
  },
};

export type AbstractProps = { [prop: string]: any } & {
  class?: Record<string, any> | string;
  style?: Record<string, any> | string;
};
type AbstractDomChild = AbstractDom | string;
export type AbstractDomChildrenOrAbstractDom =
  | Array<AbstractDomChild>
  | AbstractDomChild;
type AbstractDomChildren = Array<AbstractDom> | string;
export type AbstractDom = {
  tag: string;
  props: AbstractProps;
  children: AbstractDomChildren;
  _is_abstract: boolean;
  type: AbstractDomType;
};
function isAbstractDom(obj: Record<string, any>): obj is AbstractDom {
  return !!(obj as AbstractDom)._is_abstract;
}

function normalizeChild(child: AbstractDomChild) {
  return isString(child) ? createAbstractText(child) : child;
}

function normalizeChildren(children: AbstractDomChildrenOrAbstractDom) {
  if (isArray<AbstractDomChild>(children)) {
    const tempChildren: AbstractDom[] = [];
    for (let i = 0; i < children.length; i++) {
      tempChildren.push(normalizeChild(children[i]));
    }
    return tempChildren;
  } else if (isString(children)) {
    return [createAbstractText(children)];
  } else {
    return [children];
  }
}
function createAbstractText(str: string): AbstractDom {
  return {
    tag: '',
    props: {},
    children: str,
    _is_abstract: true,
    type: AbstractDomType.TEXT,
  };
}
function createAbstractDom(
  tag: string,
  props: AbstractProps,
  children: AbstractDomChildrenOrAbstractDom
): AbstractDom {
  const normalizedChildren = normalizeChildren(children);
  return {
    tag,
    props,
    children: normalizedChildren,
    _is_abstract: true,
    type: AbstractDomType.NODES,
  };
}

function createAbstractFragment(
  children: AbstractDomChildrenOrAbstractDom
): AbstractDom {
  return {
    tag: '',
    props: {},
    children: normalizeChildren(children),
    type: AbstractDomType.FRAGMENT,
    _is_abstract: true,
  };
}

function _resolveProps(props: AbstractProps, elm: HTMLElement) {
  elm._in_encre = true;
  for (let key in props) {
    switch (key) {
      case 'class':
      case 'style': {
        const content = props[key]!;
        if (isString(content)) {
          if (key === 'class') {
            elm.className = content;
          } else if (key === 'style') {
            elm.setAttribute('style', content);
          }
        } else if (isObject(content)) {
          const classesArray = [];
          for (let k in content) {
            if (key === 'style') {
              elm.style.setProperty(hyphenate(k), content[k]);
            } else if (key === 'class' && !!content[k]) {
              classesArray.push(k);
            }
          }
          if (classesArray.length > 0) {
            elm.className = classesArray.join(' ');
          }
        }
        break;
      }
      default: {
        if (key.match(/on([A-Z].*)/)) {
          const event = RegExp.$1.toLowerCase();
          elm.addEventListener(event, props[key], false);
        } else {
          elm.setAttribute(key, String(props[key]));
        }
        break;
      }
    }
  }
}

function _renderDom(n: AbstractDom) {
  if (n.type === AbstractDomType.FRAGMENT) {
    return $.createFragment();
  }

  let element: HTMLElement | Text;
  if (n.type === AbstractDomType.TEXT) {
    element = $.createTextNode(String(n.children));
  } else {
    element = $.createElement(n.tag);
    // resolve props, such as class style
    _resolveProps(n.props, element);
  }
  return element;
}
type FragOrTextOrElement = DocumentFragment | HTMLElement | Text;
type ElmStackInner = {
  childrenCount: number;
  rawCount: number;
  elm: FragOrTextOrElement;
};
function render(n: AbstractDom): FragOrTextOrElement {
  const nodeStack: AbstractDom[] = [n],
    elmStack: Array<ElmStackInner> = [];
  let currentNode: AbstractDom,
    currentChild: AbstractDomChild,
    currentElm: FragOrTextOrElement,
    currentTop: ElmStackInner;
  while (nodeStack.length > 0) {
    currentTop = getTop(elmStack);
    // leaves count - 1
    if (currentTop) {
      currentTop.childrenCount--;
    }

    currentNode = nodeStack.pop()!;
    currentElm = _renderDom(currentNode);
    if (
      currentNode.type === AbstractDomType.TEXT ||
      currentNode.children.length === 0
    ) {
      // Frag Or HTMLElement append current Element
      if (currentTop && !(currentTop.elm instanceof Text)) {
        currentTop.elm.append(currentElm);
      }
    } else {
      for (let i = currentNode.children.length - 1; i >= 0; i--) {
        currentChild = normalizeChild(currentNode.children[i]);
        nodeStack.push(currentChild);
      }
      elmStack.push({
        elm: currentElm,
        childrenCount: currentNode.children.length,
        rawCount: currentNode.children.length,
      });
    }

    while (
      elmStack.length > 0 &&
      (currentTop = getTop(elmStack)) &&
      currentTop.childrenCount === 0
    ) {
      // close tag and append to upper element
      currentElm = elmStack.pop()!.elm;
      if (
        elmStack.length > 0 &&
        (currentTop = getTop(elmStack)) &&
        !(currentTop.elm instanceof Text)
      ) {
        currentTop.elm.append(currentElm);
      }
    }
  }
  return currentElm! || document.createDocumentFragment();
}
type PropsOrChildren = AbstractProps | AbstractDomChildrenOrAbstractDom;
function createDom(tag: string): AbstractDom;
function createDom(frag: AbstractDomChild[]): AbstractDom;
function createDom(tag: string, propsOrChildren: PropsOrChildren): AbstractDom;
function createDom(
  tag: string,
  ...args: AbstractDomChildrenOrAbstractDom[]
): AbstractDom;
function createDom(
  tag: string,
  propsOrChildren: PropsOrChildren,
  children: AbstractDomChildrenOrAbstractDom
): AbstractDom;
function createDom(...args: any[]): AbstractDom {
  let props = {},
    children: AbstractDom[] = [],
    tag = '',
    args0: any,
    args1: any;
  if (args.length === 1) {
    args0 = args[0];
    if (isString(args0)) {
      return createAbstractDom(args0, {}, []);
    } else if (isArray<AbstractDomChild>(args0)) {
      return createAbstractFragment(args0);
    }
  } else if (args.length >= 2) {
    args0 = args[0];
    args1 = args[1];
    if (!isString(args0)) return createAbstractFragment([]);
    tag = args0;
    if (isObject(args1) && !isAbstractDom(args1)) {
      props = args1;
    } else {
      children = normalizeChildren(args1);
    }

    if (args.length >= 3) {
      let otherArgs = args.slice(2);
      for (let i = 0; i < otherArgs.length; i++) {
        if (isUndefined(otherArgs[i])) continue;
        children = children.concat(normalizeChildren(otherArgs[i]));
      }
    }

    return createAbstractDom(tag, props, children);
  }

  return createAbstractFragment([]);
}

function mergeProps(...args: AbstractProps[]) {
  const result: AbstractProps = {};
  let content: any;
  for (let arg of args) {
    for (let key in arg) {
      content = arg[key];
      switch (key) {
        case 'class':
        case 'style': {
          if (!result[key]) result[key] = {} as Record<string, any>;
          if (isObject(content)) {
            for (let oKey in content) {
              (result[key] as Record<string, any>)[oKey] = content[oKey];
            }
          } else if (isString(content)) {
            if (key === 'class') {
              (result[key] as Record<string, any>)[content] = true;
            } else {
              result[key] += content;
            }
          }

          break;
        }
        default: {
          result[key] = isObject(content) ? deepClone(content) : content;
          break;
        }
      }
    }
  }
  return result;
}

function html(elm: FragOrTextOrElement) {
  let result = '';
  if (elm instanceof DocumentFragment) {
    for (let node of elm.childNodes) {
      if (node instanceof Text) {
        result += node.data;
      } else if (node instanceof Element) {
        result += node.outerHTML;
      }
    }
  } else if (elm instanceof Text) {
    result = elm.data;
  } else {
    result = elm.outerHTML;
  }
  return result;
}

export { render, createDom, mergeProps, html, isAbstractDom, _resolveProps };
const IncludedAttrs = ['class', 'style'];
export function serialize(editor: Element) {
  const stack: Array<Element> = [];
  const result: AbstractDom[] = [];
  if (editor.childElementCount > 0 && editor.firstElementChild) {
    stack.push(editor.firstElementChild);
  }
  let blockElm: Element | null | undefined,
    editableElm: Element | null | undefined;
  while (stack.length > 0) {
    if (!(blockElm = stack.pop())) break;
    editableElm = $.traverseAndFind(
      blockElm,
      (elm) => elm.getAttribute('role') === EditorRoles.EDITOR_ZONE
    );
    if (!editableElm) break;
    let attr: Attr;
    const tempProps: Record<string, any> = {};
    for (let i = 0; i < editableElm.attributes.length; i++) {
      attr = editableElm.attributes[i];
      if (IncludedAttrs.includes(attr.name)) {
        tempProps[attr.name] = attr.value;
      }
    }
    result.push({
      tag: editableElm.tagName.toLowerCase(),
      children: editableElm.innerHTML,
      props: tempProps,
      _is_abstract: false,
      type: AbstractDomType.BLOCK,
    });

    if (blockElm.nextElementSibling) {
      stack.push(blockElm.nextElementSibling);
    }
  }
  return result;
}
