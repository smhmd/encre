import {
  defaultOptions,
  Editor,
  EditorOptions,
  EditorRole,
  IReigsteredPlugin,
  PluginItem,
  HyperChildren,
  HyperProps,
} from './config';
import {
  bfs,
  createDOM as h,
  lookup,
  mergeProps,
  normalizeChildren,
  traverseAndFindBlockContent,
  isBlockContent,
  isBlockElement,
  isEditorElement,
  deepTraverseRightNode,
  dfs,
  setCursorToEnd,
} from './dom';
import { createEvents } from './events';
import {
  deepClone,
  deepMergeOptions,
  hasProperty,
  isBlockStyleElement,
  isFunction,
  isHTMLElement,
  isString,
  warn,
} from './helpers';
import { Feature, FeatureRecord, IPlugin, PluginConstructor } from './plugin';
import {
  isEncreStruct,
  serialize,
  deserialize,
  SerializedStruct,
} from './serialize';

function registerPlugins(ctx: Editor, plugins: PluginItem[]) {
  let item: PluginItem, itemInstance: IPlugin, featureItem: Feature;
  const pluginMap = new WeakMap<PluginConstructor, any>();
  const featureRecord: FeatureRecord = {};

  for (let i = 0; i < plugins.length; i++) {
    item = plugins[i];
    if (isFunction(item[0])) {
      itemInstance = new item[0](ctx, ...item[1]);
      pluginMap.set(item[0], itemInstance);
      for (let i = 0; i < itemInstance.features.length; i++) {
        featureItem = itemInstance.features[i];
        featureRecord[featureItem.name] = {
          tag: featureItem.tag,
          props: deepClone(
            mergeProps(
              hasProperty(featureRecord, featureItem.name)
                ? featureRecord[featureItem.name].props
                : {},
              featureItem.props
            )
          ),
        };
      }
    }
  }
  return {
    pluginMap,
    featureRecord,
  };
}

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
    _features: FeatureRecord,
    _events: Record<string, (...args: any[]) => any>,
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
    ) {
      return;
    }
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

  const autofocus = () => {
    let firstBlc: HTMLElement | undefined;
    if (
      (firstBlc = dfs(
        root,
        (curr) =>
          isHTMLElement(curr) &&
          isBlockContent(curr) &&
          !!curr.getAttribute('contenteditable')
      ) as HTMLElement | undefined)
    ) {
      instance.range = setCursorToEnd(deepTraverseRightNode(firstBlc));
    }
  };

  // instance
  const instance: Editor = {
    get disabled() {
      return !!_options.readonly;
    },
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
    onUpdate(cb: () => any) {
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
    getJson() {
      let root: HTMLElement | undefined;
      if (!(root = instance.elm) || !_features) {
        warn('Editor element not found or features not specified');
        return [];
      }
      const result = serialize(root, _features);
      if (isString(result)) {
        return [];
      }
      return result.children as SerializedStruct[];
    },
    setJson(val: SerializedStruct[]) {
      let editorElm: HTMLElement | undefined;
      if (!(editorElm = instance.elm)) {
        return warn('editor element not found');
      }
      const frag = deserialize(val, _features, _classes, _options.readonly);
      editorElm.innerHTML = '';
      editorElm.append(frag);
      if (!_options.readonly) {
        autofocus();
      }
    },
  };
  // initial global variables
  const { pluginMap, featureRecord } = registerPlugins(instance, plgs);
  _plugins = pluginMap;
  _features = featureRecord;
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
  // autofocus
  if (!_options.readonly && _options.autofocus) {
    autofocus();
  }
  return instance;
}
