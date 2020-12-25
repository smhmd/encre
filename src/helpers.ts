/**
 * @internal
 * @param str
 */
export function isString(str: any): str is string {
  return typeof str === 'string';
}

/**
 * @internal
 * @param str
 */
export function isArray<T = any>(str: any): str is Array<T> {
  return Array.isArray(str);
}

export function isObject(str: any): str is object {
  return typeof str === 'object';
}
export function isUndefined(str: any): str is undefined {
  return typeof str === 'undefined';
}

export function isFunction(str: any): str is Function {
  return typeof str === 'function';
}

export function isHTMLElement(elm: Node): elm is HTMLElement {
  return elm.nodeType === Node.ELEMENT_NODE;
}

export function isBlockStyleElement(elm: Node): elm is HTMLElement {
  return (
    isHTMLElement(elm) && !getComputedStyle(elm).display.match(/(?:inline)/)
  );
}

export function isSameType(left: any, right: any): boolean {
  return typeof left === typeof right;
}

export function isTextNode(n: Node): n is Text {
  return n.nodeName === '#text';
}

export function hyphenate(str: string) {
  return str.replace(/\B([A-Z])/, '-$1').toLowerCase();
}

export function hasProperty(obj: object, keyName: string) {
  return Object.prototype.hasOwnProperty.call(obj, keyName);
}

export function warn(msg: string) {
  console.warn(`[Encre Warn]: ${msg}`);
}

export class EncreError extends Error {
  constructor(str: string = '') {
    super(`[Encre Error]: ${str}`);
  }
}

function _deepMerge(
  rawOptions: Record<string, any>,
  opts: Record<string, any>
): Record<string, any> {
  if (typeof opts !== 'object') return {};
  const result: Record<string, any> = isArray(rawOptions) ? [] : {};
  let value: any;
  for (let key in rawOptions) {
    value = rawOptions[key];
    if (
      Object.prototype.hasOwnProperty.call(opts, key) &&
      isSameType(value, opts[key])
    ) {
      let innerValue = opts[key];
      if (isObject(innerValue)) {
        innerValue = _deepMerge(value, innerValue);
      }
      value = innerValue;
    }
    result[key] = value;
  }
  return result;
}

export function deepMergeOptions<T extends Record<string, any>>(
  rawOptions: T,
  ...args: Record<string, any>[]
): T {
  let defaultOptions: Record<string, any> = rawOptions;
  for (let i = 0; i < args.length; i++) {
    defaultOptions = _deepMerge(defaultOptions, args[i]);
  }
  return defaultOptions as T;
}

export function deepClone(obj: any) {
  if (!isObject(obj)) obj;
  const result: Record<string, any> = isArray(obj) ? [] : {};
  let value: any;
  for (let key in obj) {
    value = obj[key];
    if (isObject(value)) {
      result[key] = deepClone(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
