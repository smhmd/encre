import {
  BoldTool,
  createEditor,
  ItalicTool,
  UnderlineTool,
  StrikeThroughTool,
  Heading1Tool,
  ParagraphTool,
  OrderedList,
  UnorderedList,
} from '/src/index';
import '@fortawesome/fontawesome-free/css/all.min.css';

(function () {
  createEditor({
    autofocus: false,
  })
    .use(BoldTool, () => document.querySelector('#bold'), 'active')
    .use(ItalicTool, () => document.querySelector('#italic'), 'active')
    .use(UnderlineTool, () => document.querySelector('#underline'), 'active')
    .use(
      StrikeThroughTool,
      () => document.querySelector('#strike-through'),
      'active'
    )
    .use(Heading1Tool, () => document.querySelector('#heading'), 'active')
    .use(ParagraphTool, () => document.querySelector('#paragraph'), 'active')
    .use(OrderedList, () => document.querySelector('#ol'), 'active')
    .use(UnorderedList, () => document.querySelector('#ul'), 'active')
    .mount('#content');
})();
