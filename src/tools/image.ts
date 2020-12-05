import { IEditorTool, ToolTemplate, BindDOMType, ToolEnum } from '../tool';
import { Editor } from '../editor';
import { AbstractDom, createDom as h, $, render } from '../dom';
export interface ImageToolConstructor {
  new (
    editor: Editor,
    bindImgButtonFunc: (exec: (str: string) => any) => any
  ): IEditorTool;
}

export function createImageTool(
  makeDOMFunc: () => AbstractDom
): ImageToolConstructor {
  return class ImageTool extends ToolTemplate implements IEditorTool {
    makeDOMFunc: () => AbstractDom;
    bindImgButtonFunc: (...args: any) => any;
    readonly type = ToolEnum.INLINE;
    constructor(...args: ConstructorParameters<ImageToolConstructor>) {
      super(args[0], () => null);
      this.makeDOMFunc = makeDOMFunc;
      this.bindImgButtonFunc = args[1];
    }
    bind() {
      const self = this;
      this.bindImgButtonFunc &&
        this.bindImgButtonFunc.call(null, self.exec.bind(self));
    }
    exec(str: string) {
      let range: Range | undefined;
      let makedDom: AbstractDom;
      if (
        !(range = this.$cursor.range) ||
        !(makedDom = this.makeDOMFunc.call(null))
      ) {
        return;
      }
      const { startContainer, startOffset } = range;
      makedDom.props.src = str;
      const realDom = render(makedDom);
      if (!range.collapsed) {
        range.deleteContents();
      }
      range.insertNode(realDom);

      this.$cursor.saveRange($.setCursor(startContainer, startOffset));

      this.$cursor.saveCursoredElm();
    }
  };
}

export const ImageTool = createImageTool(() =>
  h('img', {
    class: 'encre-img',
    style: {
      'max-width': '100%',
    },
  })
);
