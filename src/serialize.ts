import { EditorClasses, EditorRole, HyperElement, HyperProps } from './config';
import {
  hasProperty,
  isArray,
  isHTMLElement,
  isString,
  isTextNode,
} from './helpers';
import { FeatureRecord } from './plugin';
import {
  createDOM as h,
  isBlockContent,
  isBlockElement,
  mergeProps,
} from './dom';

export interface SerializedStruct extends Record<string, any> {
  _is_struct?: boolean;
  feature?: string;
  tag?: string;
  props?: HyperProps;
  children: Array<SerializedStruct | string>;
}

function isSpecifiedFeature(n: Node, features: FeatureRecord): string | false {
  let attr: string | null;
  if (
    isHTMLElement(n) &&
    !!(attr = n.getAttribute('feature')) &&
    Object.keys(features).includes(attr)
  ) {
    return attr;
  }

  return false;
}

export function isEncreStruct(obj: Record<string, any>): boolean {
  return !!obj._is_struct;
}

function _serializeNode(
  n: Node,
  features: FeatureRecord
): SerializedStruct | string {
  if (isTextNode(n)) {
    return n.data;
  }
  const result: SerializedStruct = {
    _is_struct: true,
    children: [],
  };
  let feature: string | false;
  if (!isHTMLElement(n)) {
    return result;
  }
  result.tag = n.tagName.toLowerCase();
  if ((feature = isSpecifiedFeature(n, features))) {
    result.feature = feature;
    let featureTag: string | undefined;
    if ((featureTag = features[feature].tag)) {
      result.tag = featureTag;
    }
  } else if (isBlockContent(n)) {
    result.feature = 'content';
  } else if (isBlockElement(n)) {
    result.feature = 'block';
  }
  let attr: Attr | null;
  for (let i = 0; i < n.attributes.length; i++) {
    attr = n.attributes.item(i);
    if (!attr) continue;
    if (!result.props) {
      result.props = {};
    }
    if (
      feature &&
      !Object.prototype.hasOwnProperty.call(features[feature].props, attr.name)
    ) {
      continue;
    }
    result.props[attr.name] = attr.value;
  }

  return result;
}

interface SerializeHelperItem {
  childrenCount: number;
  struct: SerializedStruct;
}

export function serialize(
  root: HTMLElement,
  features: FeatureRecord
): string | SerializedStruct {
  const stack: Node[] = [root];
  const helperStack: SerializeHelperItem[] = [];
  const getTop = (): SerializeHelperItem | undefined => {
    return helperStack[helperStack.length - 1];
  };
  let result: SerializedStruct | string = { _is_struct: true, children: [] },
    item: Node | undefined,
    childrenCount: number,
    tempStrcut: SerializedStruct | string,
    tempTop: SerializeHelperItem | undefined,
    tempItem: SerializeHelperItem | undefined;
  while (stack.length) {
    if (!(item = stack.pop())) break;
    tempTop = getTop();
    tempStrcut = _serializeNode(item, features);
    tempTop && tempTop.childrenCount--;

    childrenCount = item.childNodes.length;

    if (childrenCount === 0 || isString(tempStrcut)) {
      if (tempTop) {
        tempTop.struct.children.push(tempStrcut);
      } else {
        result = tempStrcut;
      }
    } else {
      for (let i = childrenCount - 1; i >= 0; i--) {
        stack.push(item.childNodes.item(i));
      }
      helperStack.push({
        childrenCount,
        struct: tempStrcut,
      });
    }

    while ((tempTop = getTop()) && tempTop.childrenCount === 0) {
      if ((tempItem = helperStack.pop())) {
        if ((tempTop = getTop())) {
          tempTop.struct.children.push(tempItem.struct);
        } else {
          result = tempItem.struct;
        }
      }
    }
  }

  return result;
}
interface DeserializeHelperItem {
  childrenCount: number;
  dom: Node;
}

function _deserializeNode(
  s: SerializedStruct | string,
  features: FeatureRecord,
  classes: EditorClasses,
  disabled?: boolean
) {
  if (isString(s)) {
    return document.createTextNode(s);
  }
  let f: string | undefined;
  let tag: string = s.tag || 'div',
    props: HyperProps = s.props || {};

  if ((f = s.feature)) {
    if (Object.keys(features).includes(f.toLowerCase())) {
      const attrs = features[f];
      attrs.tag && (tag = attrs.tag);
      props = attrs.props;
    } else if (f.match(/(block)/i)) {
      return h('div', {
        role: EditorRole.block,
        class: classes.block,
      });
    } else if (f.match(/(content)/i)) {
      props['role'] = EditorRole.blockContent;
      props['contenteditable'] = true;
    }
  }

  if (disabled && hasProperty(props, 'contenteditable')) {
    props['contenteditable'] = void 0;
  }

  if (props['role'] === EditorRole.block) {
    props['class'] = classes.block;
  }
  return h(tag, props);
}

export function deserialize(
  structs: SerializedStruct[],
  features: FeatureRecord,
  classes: EditorClasses,
  disabled?: boolean
) {
  let result: Node = document.createDocumentFragment();
  if (!isArray(structs)) return result;
  const stack: Array<SerializedStruct | string> = [];
  const helperStack: DeserializeHelperItem[] = [];
  let s: SerializedStruct;
  for (let i = structs.length - 1; i >= 0; i--) {
    s = structs[i];
    if (
      (s.props && s.props['role'] === EditorRole.block) ||
      s.feature?.match(/(block)/i)
    ) {
      stack.push(s);
    }
  }

  let item: SerializedStruct | string | undefined,
    tempDom: HyperElement,
    topItem: DeserializeHelperItem | undefined;
  const getTop = (): DeserializeHelperItem | undefined => {
    return helperStack[helperStack.length - 1];
  };
  while (stack.length) {
    if (!(item = stack.pop())) {
      break;
    }
    topItem = getTop();
    tempDom = _deserializeNode(item, features, classes, disabled);
    topItem && topItem.childrenCount--;
    if (isString(item) || item.children.length === 0) {
      if (topItem) {
        topItem.dom.append(tempDom);
      } else {
        result = tempDom;
      }
    } else {
      for (let j = item.children.length - 1; j >= 0; j--) {
        stack.push(item.children[j]);
      }
      helperStack.push({
        childrenCount: item.children.length,
        dom: tempDom,
      });
    }

    while ((topItem = getTop()) && topItem.childrenCount === 0) {
      let tempItem = helperStack.pop();
      if (tempItem) {
        if ((topItem = getTop())) {
          topItem.dom.append(tempItem.dom);
        } else {
          result = tempItem.dom;
        }
      }
    }
  }
  return result;
}
