import {
  EditorRole,
  PropClassType,
  HyperElement,
  HyperChildren,
  HyperProps,
} from './config';
import {
  hyphenate,
  isArray,
  isBlockStyleElement,
  isFunction,
  isHTMLElement,
  isObject,
  isString,
  isUndefined,
} from './helpers';

function normalizeClass(value: PropClassType) {
  let result: string[] = [];
  let tempValue: any;
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!value[i]) continue;
      result = result.concat(normalizeChildren(value[i]));
    }
  } else if (isObject(value)) {
    for (let innerKey in value) {
      tempValue = value[innerKey];
      if (!!tempValue) {
        result = result.concat(innerKey.split(' '));
      }
    }
  } else {
    result = result.concat(value.split(' '));
  }

  return result;
}

function normalizeStyle(value: PropClassType) {
  let result: Record<string, any> = {};
  let tempValue: any;
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!value[i]) continue;
      result = Object.assign({}, result, normalizeStyle(value[i]));
    }
  } else if (isObject(value)) {
    result = value;
  } else {
    tempValue = value.split(';');
    let styleStr: string, innerKey: string, innerValue: string;
    for (let i = 0; i < tempValue.length; i++) {
      styleStr = tempValue[i];
      if (!styleStr.match(/([\S]+): ?([\S]+);?/)) continue;
      innerKey = hyphenate(RegExp.$1);
      innerValue = RegExp.$2;
      if (innerKey && innerValue) {
        result[innerKey] = innerValue;
      }
    }
  }

  return result;
}
export function resolveProps(elm: HyperElement, props: HyperProps) {
  if (!isHTMLElement(elm)) return;
  let value: any;
  for (let key in props) {
    value = props[key];
    switch (key) {
      case 'style': {
        const styleObj = normalizeStyle(value);
        for (let innerKey in styleObj) {
          elm.style.setProperty(
            hyphenate(innerKey),
            String(styleObj[innerKey])
          );
        }
        break;
      }
      case 'class': {
        const classArr = normalizeClass(value);
        elm.className = classArr
          .reduce((prev, next) => {
            if (prev.indexOf(next) !== -1) {
              return prev;
            }
            prev.push(next);
            return prev;
          }, [] as string[])
          .join(' ');
        break;
      }
      default: {
        if (key.match(/on([A-Z].*)/)) {
          let event: string;
          if ((event = RegExp.$1.toLowerCase())) {
            elm.addEventListener(event, value, false);
          }
        } else {
          elm.setAttribute(key, value);
        }
        break;
      }
    }
  }
}
/**
 * normalize children to Array<any>
 * @param children
 */
export function normalizeChildren(children: HyperChildren): Array<any> {
  if (isUndefined(children)) {
    return [];
  } else if (isArray(children)) {
    return children;
  }
  return [children];
}
/**
 * @public
 * h('div')
 * h([ ...elements ])
 * @param tagOrChildren - tag or Fragment or Element
 */
export function createDOM(
  tagOrChildren: string | Array<string | HyperElement> | HyperElement
): HyperElement;
/**
 * @public
 * h('div', { class: 'class' })
 * h('div', [...elements])
 * @param tag - elements tag
 * @param propsOrChildren - props or children
 */
export function createDOM(
  tag: string,
  propsOrChildren: HyperProps | HyperChildren
): HyperElement;
/**
 * @public
 * h('div', {}, [])
 * @param tag - elements tag
 * @param props - elements attrs
 * @param children - elements array
 */
export function createDOM(
  tag: string,
  props: HyperProps,
  children?: HyperChildren
): HyperElement;
/**
 * @public
 * h('div', [], [])
 * @param tag - elements tag
 * @param children - children array
 */
export function createDOM(
  tag: string,
  ...children: HyperChildren[]
): HyperElement;

export function createDOM(...args: any[]): HyperElement {
  const l = args.length;
  let elm: HyperElement = document.createDocumentFragment();
  if (l === 0) return elm;
  if (!isString(args[0])) {
    if (isArray(args[0])) {
      elm.append(...args[0]);
      return elm;
    } else {
      return args[0];
    }
  }

  let tag = isString(args[0]) ? args[0] : 'div';
  elm = document.createElement(tag);
  let children: any[] = [];
  if (l >= 2) {
    if (Object.prototype.toString.call(args[1]) === '[object Object]') {
      resolveProps(elm, args[1]);
    } else {
      children = children.concat(normalizeChildren(args[1]));
    }
    for (let i = 2; i < l; i++) {
      children = children.concat(normalizeChildren(args[i]));
    }
  }
  elm.append(...children);

  return elm;
}

export function html(elm: HyperElement): string {
  if (elm instanceof HTMLElement) return elm.outerHTML;
  let child: ChildNode,
    str = '';
  for (let i = 0; i < elm.childNodes.length; i++) {
    child = elm.childNodes.item(i);
    if (child instanceof HTMLElement) {
      str += child.outerHTML;
    } else {
      str += child.textContent;
    }
  }
  return str;
}

export function mergeProps(...args: HyperProps[]) {
  let prop: HyperProps;
  const result: Record<string, any> = {};
  for (let i = 0; i < args.length; i++) {
    prop = args[i];
    let value: any;
    for (let key in prop) {
      value = prop[key];
      switch (key) {
        case 'class':
        case 'style': {
          if (!result[key]) {
            result[key] = [];
          }
          const tempResult =
            key === 'class' ? normalizeClass(value) : normalizeStyle(value);
          result[key] = result[key].concat(tempResult);
          break;
        }
        default: {
          result[key] = prop[key];
          break;
        }
      }
    }
  }
  return result;
}
export function getSelection() {
  return window.getSelection();
}
export function getRange() {
  let selection: Selection | null;
  if (!(selection = getSelection()) || selection.rangeCount === 0) {
    return null;
  }
  return selection.getRangeAt(0);
}

export function setCursor(n: Node, offset: number) {
  let selection: Selection | null;
  if (!(selection = getSelection())) return null;
  selection.removeAllRanges();
  const r = document.createRange();
  r.selectNodeContents(n);
  r.setStart(n, offset);
  r.setEnd(n, offset);
  r.collapse(false);
  selection.addRange(r);
  return r;
}

export function setCursorToStart(n: Node) {
  return setCursor(n, 0);
}

export function setCursorToEnd(n: Node) {
  return setCursor(n, n.textContent?.length || 0);
}

export function bfs(n: Node, cb: (current: Node) => boolean) {
  const queue: Node[] = [n];
  let child: Node | undefined;
  while (queue.length > 0) {
    if (!(child = queue.shift())) return void 0;
    if (cb && isFunction(cb) && cb.call(null, child)) {
      return child;
    }
    for (let i = 0; i < child.childNodes.length; i++) {
      queue.push(child.childNodes.item(i));
    }
  }
  return void 0;
}

export function dfs(n: Node, cb: (current: Node) => boolean) {
  const stack: Node[] = [n];
  let child: Node | undefined;
  while (stack.length > 0) {
    if (!(child = stack.pop())) return void 0;
    if (cb && isFunction(cb) && cb.call(null, child)) {
      return child;
    }
    for (let i = child.childNodes.length - 1; i >= 0; i--) {
      stack.push(child.childNodes.item(i));
    }
  }
  return void 0;
}

export function lookup(n: Node, cb: (current: Node) => boolean) {
  let current: Node | null = n;
  while (current) {
    if (cb && isFunction(cb) && cb.call(null, current)) {
      return current;
    }
    if (
      isHTMLElement(n) &&
      (n.getAttribute('role') === EditorRole.container || n.tagName === 'BODY')
    ) {
      return void 0;
    }
    current = current.parentNode;
  }
  return void 0;
}

export function deepTraverseRightNode(n: Node) {
  let last: Node | null = n;
  while (last) {
    if (!last.lastChild) return last;
    last = last.lastChild;
  }
  return last;
}

export function deepTraverseLeftNode(n: Node) {
  let first: Node | null = n;
  while (first) {
    if (!first.firstChild) return first;
    first = first.firstChild;
  }
  return first;
}

export function convertBlockToInline(n: Node) {
  let result = n.cloneNode();

  if (isBlockStyleElement(n)) {
    result = document.createDocumentFragment();
  }
  let child: Node;
  for (let i = 0; i < n.childNodes.length; i++) {
    child = convertBlockToInline(n.childNodes.item(i));
    result.appendChild(child);
  }

  return result;
}

export function cloneAttributes(elm: HTMLElement) {
  const props: HyperProps = {};
  let attr: Attr | null;
  for (let i = 0; i < elm.attributes.length; i++) {
    attr = elm.attributes.item(i);
    if (!attr) continue;
    props[attr.name] = attr.value;
  }
  return props;
}

function makeIsRoleEqualFunction(roleName: EditorRole) {
  return function (elm: HTMLElement) {
    return elm.getAttribute('role') === roleName;
  };
}

export const isEditorElement = makeIsRoleEqualFunction(EditorRole.editor);
export const isBlockElement = makeIsRoleEqualFunction(EditorRole.block);
export const isBlockContent = makeIsRoleEqualFunction(EditorRole.blockContent);

export function traverseAndFindBlockContent(elm: HTMLElement) {
  return bfs(
    elm,
    (current) => isHTMLElement(current) && isBlockContent(current)
  ) as HTMLElement | undefined;
}
