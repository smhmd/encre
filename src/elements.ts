import {
  createDom as h,
  AbstractDomChildrenOrAbstractDom,
  AbstractProps,
  mergeProps,
} from './dom';
import { isUndefined } from './helpers';
export const enum EditorRoles {
  CONTAINER = 'container',
  EDITOR = 'editor',
  EDITOR_BLOCK = 'block',
}
export function p(
  children?: AbstractDomChildrenOrAbstractDom,
  contenteditable = true
) {
  return createTemplateBlock(
    'p',
    { class: 'ee-paragraph' },
    children,
    contenteditable
  );
}

export function b(children?: AbstractDomChildrenOrAbstractDom) {
  return createTemplateInline(
    'strong',
    {
      class: 'ee-strong',
    },
    children
  );
}

export function createDefaultEditor(
  props: AbstractProps = {},
  children: AbstractDomChildrenOrAbstractDom = []
) {
  return h(
    'div',
    {
      class: 'encre-editor__container',
      role: EditorRoles.CONTAINER,
    },
    h(
      'div',
      mergeProps(
        {
          class: 'encre-editor',
          role: EditorRoles.EDITOR,
          spellcheck: false,
          tabindex: -1,
        },
        props
      ),
      children
    )
  );
}

export function createTemplateBlock(
  tag: string = 'div',
  props: AbstractProps = {},
  children?: AbstractDomChildrenOrAbstractDom,
  contenteditable: boolean = true
) {
  const tempChildren = isUndefined(children) ? [] : children;
  return h(
    'div',
    { class: 'ee-block', role: EditorRoles.EDITOR_BLOCK },
    h(
      'div',
      {
        class: 'ee-block__content',
      },
      h(
        tag,
        mergeProps(
          {
            contenteditable,
          },
          props
        ),
        tempChildren
      )
    )
  );
}

export function createTemplateInline(
  tag: string = 'span',
  props: AbstractProps = {},
  children?: AbstractDomChildrenOrAbstractDom
) {
  const tempChildren = isUndefined(children) ? [] : children;
  return h(
    tag,
    mergeProps(
      {
        class: 'ee-inline',
      },
      props
    ),
    tempChildren
  );
}

export const enum ToolElementType {
  BLOCK = 1,
  INLINE_BLOCK = 1 << 1,
}
