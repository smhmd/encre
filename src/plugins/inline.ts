import { getRange } from '../dom';
import { Editor } from '../editor';
import { IPlugin, PluginTemplate } from '../Plugin';

function makeInlinePlugin(commandName: string) {
  return class InlinePlugin extends PluginTemplate implements IPlugin {
    constructor(editor: Editor) {
      super(editor);
    }
    exec(value?: string) {
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
