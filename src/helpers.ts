export function isString(str: any): str is string {
  return typeof str === 'string';
}
export function isNumber(str: any): str is number {
  return typeof str === 'number';
}
export function isBool(str: any): str is boolean {
  return typeof str === 'boolean';
}
export function isObject<T extends string | number, U = any>(
  str: any
): str is Record<T, U> {
  return Object.prototype.toString.call(str) === '[object Object]';
}

export function isArray<T extends any>(str: any): str is Array<T> {
  return Array.isArray(str);
}

export function isUndefined(str: any): str is undefined {
  return typeof str === 'undefined';
}

export function isTextNode(node: any): node is Text {
  return !!node && !!node.nodeName && node.nodeName === '#text';
}

export function hasDocument() {
  return typeof document !== 'undefined';
}

export function hasWindow() {
  return typeof window !== 'undefined';
}
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
export function hyphenate(str: string) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase();
}

export function convertToUnit(str: string | number | undefined, unit = 'px') {
  if (!str) {
    return '0' + unit;
  } else if (isString(str) && isNaN(+str)) {
    return str;
  } else {
    return String(+str) + unit;
  }
}
export function deepClone(obj: Record<any, any>) {
  const result: Record<string | number, any> = isArray(obj) ? [] : {};
  let value: any;
  for (let key in obj) {
    value = obj[key];
    if (isObject(value) || isArray(value)) {
      result[key] = deepClone(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
export class EncreError extends Error {
  constructor(message: string) {
    super(`[ Encre-Error ] - ${message}`);
  }
}
export function throwError(msg: string = '') {
  throw new EncreError(msg);
}

export function getTop<T = any>(arr: Array<T>) {
  return arr[arr.length - 1];
}

export function setTop<T = any>(arr: Array<T>, val: T) {
  return (arr[arr.length - 1] = val);
}

export function debounce<T extends (...args: any) => any>(
  callback: T,
  timeout = 300
) {
  let timer: any;
  return function (...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      callback && callback.apply(null, args);
    }, timeout);
  };
}
