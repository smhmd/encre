import { ExtractPluginInterface, PluginConstructor } from './plugin';
import { SerializedStruct } from './serialize';

export type PropClassType = string | Record<string, any> | Array<any>;
export type HyperProps = { [props: string]: any } & {
  class?: PropClassType;
  style?: PropClassType;
};
export type HyperElement = HTMLElement | DocumentFragment | Text;
export type HyperChildren = HyperElement[] | HyperElement | string | undefined;

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
  disabled: boolean;
  elm: HTMLElement | undefined;
  cursoringBlock: HTMLElement | undefined;
  plugins: IReigsteredPlugin;
  range: Range | null | undefined;
  onUpdate: (cb: () => any) => void;
  renderNewBlock: (
    tagOrChildren?: string | HyperChildren,
    props?: HyperProps,
    children?: HyperChildren,
    innerProps?: Record<string, any>
  ) => HyperElement;
  getJson: () => Array<SerializedStruct>;
  setJson: (data: Array<SerializedStruct>) => void;
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

export type IReigsteredPlugin = {
  get<T extends new (...args: any[]) => any>(
    constructorOrName: T
  ): ExtractPluginInterface<T> | undefined;
};
