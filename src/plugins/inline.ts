import { getRange, createDOM as h } from '../dom';
import { Editor } from '../config';
import { Feature, IPlugin, PluginConstructor, PluginTemplate } from '../plugin';

function makeInlinePlugin(commandName: string): PluginConstructor {
  return class InlinePlugin extends PluginTemplate implements IPlugin {
    features: Feature[] = [];
    constructor(editor: Editor) {
      super(editor);
    }
    exec(value?: string) {
      if (this.$editor.disabled) return;
      // TODO
      // need to be more smart
      document.execCommand(commandName, false, value);
      this.$editor.range = getRange();
    }
    isActive() {
      return document.queryCommandState(commandName);
    }
  };
}

export const BoldPlugin = makeInlinePlugin('bold');
export const ItalicPlugin = makeInlinePlugin('italic');
export const UnderlinePlugin = makeInlinePlugin('underline');
export const StrikeThroughPlugin = makeInlinePlugin('strikeThrough');
export const ForeColorPlugin = makeInlinePlugin('foreColor');
export const BackColorPlugin = makeInlinePlugin('backColor');
