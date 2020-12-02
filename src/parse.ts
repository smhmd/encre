import { AbstractDom, createDom as h } from './dom';
import { isString } from './helpers';

export function parse(html: string) {
  let result = '';
  let start = 0,
    l = 0;
  while (html.length > 0) {
    // TODO
    l = html.length;
    result += html.substr(start, l);
    start = l;
    html = html.slice(html.length);
  }
  return h('span', result);
}

export function parsePlaceholder(placeholder?: string | AbstractDom) {
  if (!placeholder) return;
  if (isString(placeholder)) {
    return parse(placeholder);
  } else {
    return placeholder;
  }
}
