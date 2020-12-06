import { createBlockTool, BlockToolConstructor } from './block';
import { $, createDom as h, render } from '../dom';

export function createListTool(ordered?: boolean): BlockToolConstructor {
  const listTitleTag = ordered ? 'ol' : 'ul';
  const listItemTag = 'li';
  const getClosestListItem = (n: Node) =>
    $.createGetParentTemplate(
      n,
      (parent) => parent.tagName === listItemTag.toUpperCase()
    );
  const getClosetListParent = (n: Node) =>
    $.createGetParentTemplate(
      n,
      (parent) => parent.tagName === listTitleTag.toUpperCase()
    );
  return createBlockTool(
    () =>
      h(listTitleTag, { class: 'encre-list' }, [
        h(listItemTag, { class: 'encre-list--item' }),
      ]),
    (ctx, cloneContents, newRange) => {
      let range: Range | undefined,
        closetListItem: HTMLElement | null = null;
      if (
        !newRange ||
        !(range = ctx.$cursor.range) ||
        !(closetListItem = getClosestListItem(range.endContainer)) ||
        (!closetListItem.nextElementSibling && !cloneContents)
      ) {
        let endContainer: Node | undefined;
        // if at last position & no text, remove its self
        if ((endContainer = range?.endContainer) && !endContainer.textContent) {
          endContainer.parentElement?.removeChild(endContainer);
        }
        return false;
      }
      const ulElement = getClosetListParent(closetListItem);
      if (ulElement) {
        let nextElm: Element | null;
        const listItemElm = render(
          h(listItemTag, { class: 'encre-list--item' })
        );
        cloneContents && listItemElm.appendChild(cloneContents);
        // insert new list item
        if ((nextElm = closetListItem.nextElementSibling)) {
          !listItemElm.textContent &&
            (listItemElm.textContent = $.spaceUnicode);
          ulElement.insertBefore(listItemElm, nextElm);
        } else {
          ulElement.append(listItemElm);
        }
        // set cursor and save range
        ctx.$cursor.saveRange($.setCursor($.getFirstLeftNode(listItemElm), 0));
        // save cursoredElment
        ctx.$cursor.saveCursoredElm();
        // delete previous elments' last nodes
        newRange.deleteContents();
        if (!newRange.startContainer.textContent) {
          newRange.startContainer.textContent = $.spaceUnicode;
        }
        return true;
      }
      return false;
    }
  );
}
/**
 * @public
 */
export const OrderedList: BlockToolConstructor = createListTool(true);
/**
 * @public
 */
export const UnorderedList: BlockToolConstructor = createListTool();
