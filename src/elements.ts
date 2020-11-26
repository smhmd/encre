import {
  AbstractProps,
  ANodeChildren,
  createANode as h,
  mergeProps,
} from './node';
export const defaultBlockClasses = {
  paragraph: 'editor-paragrpah',
  heading: 'editor-heading',
};
export const defaultInlineClasses = {
  strong: 'editor-strong',
};
export type BlockClasses = {
  [T in keyof typeof defaultBlockClasses]: string;
};
export type InlineClasses = {
  [T in keyof typeof defaultInlineClasses]: string;
};
export type ElementClasses = {
  block: { [tag: string]: string } & Partial<BlockClasses>;
  inline: { [tag: string]: string } & Partial<InlineClasses>;
};
export type ElementOptions = Partial<ElementClasses>;
function genBlockTemplate(props: AbstractProps) {
  return (children: ANodeChildren) =>
    h(
      'div',
      mergeProps(
        {
          class: 'editor-block',
          contenteditable: true,
        },
        props
      ),
      children
    );
}

export const defaultElementClasses = {
  block: defaultBlockClasses,
  inline: defaultInlineClasses,
};
export class EditorElement {
  blockClasses: BlockClasses & { [key: string]: string };
  inlineClasses: InlineClasses & { [key: string]: string };
  constructor(classesOptions: ElementOptions = {}) {
    this.blockClasses = Object.assign(
      {},
      defaultBlockClasses,
      classesOptions.block
    );
    this.inlineClasses = Object.assign(
      {},
      defaultInlineClasses,
      classesOptions.inline
    );
  }
  get p() {
    return genBlockTemplate({
      class: this.blockClasses.paragraph,
    });
  }

  get h() {
    return genBlockTemplate({
      class: this.blockClasses.heading,
    });
  }
}
