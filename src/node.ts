import {
  hasDocument,
  isArray,
  isObject,
  isString,
  hyphenate,
  isUndefined,
  deepClone,
  EncreError,
} from './helpers';

export const enum ABSTRACT_NODE_TYPE {
  FRAGMENT = 1,
  NODES = 1 << 1,
}

export type AbstractNodeChildren = Array<string | AbstractNode>;
export type AbstractProps = { [props: string]: any } & {
  class?: string | Record<string, any>;
  style?: string | Record<string, any>;
};

export interface AbstractNode {
  _is_abstract_node?: true;
  _uid?: number;
  children: AbstractNodeChildren;
  props: AbstractProps;
  type: ABSTRACT_NODE_TYPE;
  tag: string;
}

export type ANodeChildren = AbstractNodeChildren | string | AbstractNode;
export function isANode(obj: any): obj is AbstractNode {
  return !!(obj as AbstractNode)._is_abstract_node;
}
function normalizeNodeChildren(children: ANodeChildren) {
  if (isString(children) || isANode(children)) {
    return [children];
  } else if (isArray(children)) {
    return children;
  }
  return [];
}
let _uid = 0;
function createANode(frag: AbstractNodeChildren): AbstractNode;
function createANode(tag: string): AbstractNode;
function createANode(
  tag: string,
  propsOrChildren: ANodeChildren | AbstractProps
): AbstractNode;
function createANode(
  tag: string,
  props: AbstractProps,
  children: ANodeChildren
): AbstractNode;
function createANode(...args: any[]): AbstractNode {
  let tag: string = '';
  const result: AbstractNode = {
    _uid: _uid++,
    _is_abstract_node: true,
    children: [],
    props: {},
    type: ABSTRACT_NODE_TYPE.NODES,
    tag: '',
  };
  if (args.length === 1) {
    if (isArray<string | AbstractNode>(args[0])) {
      result.children = args[0];
      result.type = ABSTRACT_NODE_TYPE.FRAGMENT;
      return result;
    }
  } else if (args.length === 2) {
    if (isArray<string | AbstractNode>(args[1])) {
      result.children = args[1];
    } else if (isObject(args[1])) {
      if (isANode(args[1])) {
        result.children = [args[1]];
      } else {
        result.props = args[1];
      }
    } else if (isString(args[1])) {
      result.children = [args[1]];
    }
  } else if (args.length === 3) {
    isObject(args[1]) && (result.props = args[1]);
    result.children = normalizeNodeChildren(args[2]);
  }
  result.tag = args[0];
  return result;
}

function _resolveProps(elm: DocumentFragment | HTMLElement, n: AbstractNode) {
  if (elm instanceof DocumentFragment) return;
  elm._uid = n._uid;
  elm._is_abstract_node = true;
  const props = n.props;
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

function _render(n: AbstractNode) {
  if (!hasDocument()) {
    throw new EncreError('No Document Specified');
  }
  const elm =
    n.type === ABSTRACT_NODE_TYPE.FRAGMENT
      ? document.createDocumentFragment()
      : document.createElement(n.tag);
  // resolve prop
  _resolveProps(elm, n);
  return elm;
}

export const PathMap = new Map<number, number[]>();

function renderANode(n: AbstractNode, structArray: number[] = []) {
  const nodeStack: AbstractNode[] = [n];
  const elmStack: Array<{
    childrenCount: number;
    rawCount: number;
    elm: DocumentFragment | HTMLElement;
  }> = [];
  const getTop = () => elmStack[elmStack.length - 1];
  const pathArray = structArray.concat([0]);

  let currNode: AbstractNode,
    currElem: HTMLElement | DocumentFragment,
    childNode: AbstractNode | string,
    realLength = 0, // node's children length without string
    level = 0, // node level
    currUID = -1,
    result: HTMLElement | DocumentFragment = document.createDocumentFragment();
  while (nodeStack.length > 0) {
    if (elmStack.length > 0 && getTop()) {
      getTop().childrenCount -= 1;
    }
    // traverse start
    currNode = nodeStack.pop()!;
    currElem = _render(currNode);
    // set path map
    // eg: [0, [0, 0, 1]]
    if (getTop()) {
      pathArray[level] = getTop().rawCount - getTop().childrenCount - 1;
    }
    currUID = isUndefined(currNode._uid) ? -1 : currNode._uid;
    PathMap.set(currUID, [...pathArray]);

    if (currNode.children.length === 0) {
      getTop() && getTop().elm.append(currElem);
    } else {
      realLength = 0;
      for (let i = currNode.children.length - 1; i >= 0; i--) {
        childNode = currNode.children[i];
        if (isString(childNode)) {
          currElem.append(childNode);
          continue;
        }
        realLength++;
        nodeStack.push(childNode);
      }
      elmStack.push({
        rawCount: realLength,
        childrenCount: realLength,
        elm: currElem,
      });
      level++;
    }

    // taverse end & close tag
    while (elmStack.length > 0 && getTop() && getTop().childrenCount === 0) {
      currElem = elmStack.pop()!.elm;
      pathArray.pop();
      level = level > 0 ? level - 1 : level;
      if (elmStack.length > 0) {
        getTop().elm.append(currElem);
      }
    }
  }
  result = currElem!;
  return result;
}

function serialize(elm: DocumentFragment | HTMLElement) {
  if (elm instanceof DocumentFragment) {
    let result = '';
    for (let child of elm.children) {
      result += child.outerHTML;
    }
    return result;
  } else {
    return elm.outerHTML;
  }
}

function traverse(root: AbstractNode, _uid: number) {
  const path = PathMap.get(_uid);
  if (!path) return;
  if (root.children.length === 0) {
    return {
      parent: root,
      current: root,
    };
  }
  let i = 1,
    parentNode = root;
  const topNode = () =>
    parentNode.children.filter((c) => !isString(c))[path[i]] as AbstractNode;
  for (; i < path.length - 1; i++) {
    parentNode = topNode();
  }

  return {
    parent: parentNode,
    current: topNode(),
  };
}

function cloneAbstractNode(n: AbstractNode) {
  const obj: AbstractNode = {
    tag: n.tag,
    type: n.type,
    children: [],
    props: deepClone(n.props),
  };
  let child: string | AbstractNode;
  for (let i = 0; i < n.children.length; i++) {
    child = n.children[i];
    if (isString(child)) {
      obj.children.push(child);
    } else {
      obj.children.push(cloneAbstractNode(child));
    }
  }
  return obj;
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
export const enum PATCH_FLAG {
  TEXT = 1,
  CLASS = 1 << 1,
  STYLE = 1 << 2,
}
// TODO patch Node
function patchNode(
  oldNode: AbstractNode,
  newNode: AbstractNode,
  flag: PATCH_FLAG = PATCH_FLAG.TEXT
) {}
function patchNodeAndUpdate() {}

export {
  renderANode,
  createANode,
  serialize,
  traverse,
  cloneAbstractNode,
  mergeProps,
  patchNode,
  patchNodeAndUpdate,
};
