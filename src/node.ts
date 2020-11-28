import {
  hasDocument,
  isArray,
  isObject,
  isString,
  hyphenate,
  isUndefined,
  deepClone,
  EncreError,
  getTop,
  setTop,
  isTextNode,
} from './helpers';

export const enum ABSTRACT_NODE_TYPE {
  FRAGMENT = 1,
  NODES = 1 << 1,
  TEXT = 1 << 2,
}

export type AbstractNodeChildren = Array<string | AbstractNode>;
export type AbstractProps = { [props: string]: any } & {
  class?: string | Record<string, any>;
  style?: string | Record<string, any>;
};
type FragOrElementOrText = DocumentFragment | HTMLElement | Text;
export interface AbstractNode {
  _is_abstract_node?: true;
  _uid?: number;
  _elm?: FragOrElementOrText;
  children: AbstractNodeChildren;
  props: AbstractProps;
  type: ABSTRACT_NODE_TYPE;
  tag: string;
}

export interface NormalizedAbstractNode extends AbstractNode {
  children: Array<AbstractNode>;
}

export type ANodeChildren = AbstractNodeChildren | string | AbstractNode;
export function isANode(obj: any): obj is AbstractNode {
  return !!(obj as AbstractNode)._is_abstract_node;
}
let _uid = 0;
function createTextANode(...args: string[]): AbstractNode {
  return {
    _uid: _uid++,
    _is_abstract_node: true,
    children: args,
    props: {},
    type: ABSTRACT_NODE_TYPE.TEXT,
    tag: '',
  };
}

function normalizeNodeChildren(children: ANodeChildren) {
  if (isString(children)) {
    return [createTextANode(children)];
  } else if (isANode(children)) {
    return [children];
  } else if (isArray(children)) {
    let child: string | AbstractNode;
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      if (isString(child)) {
        children[i] = createTextANode(child);
      }
    }
    return children as AbstractNode[];
  }
  return [];
}
function createANode(frag: AbstractNodeChildren): NormalizedAbstractNode;
function createANode(tag: string): NormalizedAbstractNode;
function createANode(
  tag: string,
  propsOrChildren: ANodeChildren | AbstractProps
): NormalizedAbstractNode;
function createANode(
  tag: string,
  props: AbstractProps,
  children: ANodeChildren
): NormalizedAbstractNode;
function createANode(...args: any[]): NormalizedAbstractNode {
  const result: NormalizedAbstractNode = {
    _uid: _uid++,
    _is_abstract_node: true,
    children: [],
    props: {},
    type: ABSTRACT_NODE_TYPE.NODES,
    tag: '',
  };
  if (args.length === 1) {
    if (isArray<string | AbstractNode>(args[0])) {
      result.children = normalizeNodeChildren(args[0]);
      result.type = ABSTRACT_NODE_TYPE.FRAGMENT;
      return result;
    }
  } else if (args.length === 2) {
    if (isObject(args[1]) && !isANode(args[1])) {
      result.props = args[1];
    } else {
      result.children = normalizeNodeChildren(args[1]);
    }
  } else if (args.length === 3) {
    isObject(args[1]) && !isANode(args[1]) && (result.props = args[1]);
    result.children = normalizeNodeChildren(args[2]);
  }
  result.tag = args[0];
  return result;
}

function _resolveProps(elm: FragOrElementOrText, n: AbstractNode) {
  elm._uid = n._uid;
  elm._is_abstract_node = true;
  if (!(elm instanceof HTMLElement)) {
    return;
  }
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

  let elm: FragOrElementOrText = document.createDocumentFragment();
  if (n.type === ABSTRACT_NODE_TYPE.NODES) {
    elm = document.createElement(n.tag);
  } else if (n.type === ABSTRACT_NODE_TYPE.TEXT) {
    elm = document.createTextNode(String(n.children.join('')));
  }
  // resolve prop
  _resolveProps(elm, n);
  // bind current elm
  n._elm = elm;
  return elm;
}

export const PathMap = new Map<number, number[]>();
interface ElmStackInner {
  childrenCount: number;
  rawCount: number;
  elm: FragOrElementOrText;
}
function renderANode(n: AbstractNode, structArray: number[] = []) {
  const nodeStack: Array<AbstractNode> = [n];
  const elmStack: Array<ElmStackInner> = [];
  const pathArray = structArray.concat([0]);

  let currNode: AbstractNode,
    currElem: FragOrElementOrText,
    childNode: AbstractNode | string,
    currentTop: ElmStackInner,
    level = 0, // node level
    currUID = -1,
    result: FragOrElementOrText = document.createDocumentFragment();
  while (nodeStack.length > 0) {
    // get elmStack top element -> current leaves' parent
    currentTop = getTop(elmStack);
    if (currentTop) {
      currentTop.childrenCount -= 1;
    }
    // traverse start
    currNode = nodeStack.pop()!;
    currElem = _render(currNode);

    if (currentTop) {
      pathArray[level] = currentTop.rawCount - currentTop.childrenCount - 1;
    }
    currUID = isUndefined(currNode._uid) ? -1 : currNode._uid;
    // set path map
    // eg: [0, [0, 0, 1]]
    PathMap.set(currUID, [...pathArray]);
    if (
      currNode.children.length === 0 ||
      currNode.type === ABSTRACT_NODE_TYPE.TEXT
    ) {
      currentTop &&
        !(currentTop.elm instanceof Text) &&
        currentTop.elm.append(currElem);
    } else {
      for (let i = currNode.children.length - 1; i >= 0; i--) {
        childNode = currNode.children[i];
        nodeStack.push(
          isString(childNode) ? createTextANode(childNode) : childNode
        );
      }
      elmStack.push({
        rawCount: currNode.children.length,
        childrenCount: currNode.children.length,
        elm: currElem,
      });
      level++;
    }

    // taverse end & close tag
    while (
      elmStack.length > 0 &&
      (currentTop = getTop(elmStack)) &&
      currentTop.childrenCount === 0
    ) {
      currElem = elmStack.pop()!.elm;
      pathArray.pop();
      level = level > 0 ? level - 1 : level;
      if (elmStack.length > 0) {
        (getTop(elmStack).elm as HTMLElement | DocumentFragment).append(
          currElem
        );
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
export type TraverseReturn = {
  parent: AbstractNode | undefined;
  current: AbstractNode | undefined;
};
function traverse(
  root: AbstractNode,
  _uid: number
): TraverseReturn | undefined {
  const path = PathMap.get(_uid);
  if (!path) return;
  if (root.children.length === 0) {
    return {
      parent: root,
      current: root,
    };
  }
  let i = 1,
    parentNode: AbstractNode | undefined = root;
  const topNode = () => {
    if (!parentNode || isString(parentNode)) return;
    if (parentNode.type === ABSTRACT_NODE_TYPE.TEXT) return parentNode;
    return parentNode.children[path[i]] as AbstractNode;
  };
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
  flag: PATCH_FLAG = PATCH_FLAG.TEXT,
  cb = () => {}
) {
  if (flag === PATCH_FLAG.TEXT && isTextNode(newNode._elm)) {
    newNode.children = [newNode._elm.data];
  }
  cb && cb();
}

function patchNodeAndUpdate(...args: Parameters<typeof patchNode>) {
  return patchNode(args[0], args[1], args[2]);
}

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
