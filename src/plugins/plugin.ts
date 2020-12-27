import { Editor, HyperProps } from '../config';
export type Feature = { [prop: string]: any } & {
  name: string;
  props: HyperProps;
  tag?: string;
};

export type FeatureRecord = Record<
  string,
  {
    tag?: string;
    props: HyperProps;
  }
>;
export type IPlugin = {
  _uid: number;
  features: Array<Feature>;
  $editor: Editor;
  exec: (...args: any[]) => any;
  isActive: () => boolean;
};
export interface PluginConstructor {
  new (editor: Editor, ...args: any[]): IPlugin;
}

export type ExtractPluginConstructor<
  T extends new (...args: any[]) => any
> = T extends new (editor: Editor, ...args: infer P) => IPlugin ? P : never;

export type ExtractPluginInterface<
  T extends new (...args: any[]) => any
> = T extends new (editor: Editor, ...args: any[]) => infer P ? P : never;

let innerUID = 0;
export class PluginTemplate implements IPlugin {
  $editor: Editor;
  _uid: number;
  features: Array<Feature> = [];
  constructor(editor: Editor) {
    this.$editor = editor;
    this._uid = ++innerUID;
  }
  exec() {}
  isActive() {
    return false;
  }
}
