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
  BlockquoteTool,
  JustifyCenterTool,
  JustifyRightTool,
  JustifyLeftTool,
} from '/src/index';
import '@fortawesome/fontawesome-free/css/all.min.css';

(function () {
  createEditor({
    autofocus: false,
  })
    .use(BoldTool, () => '#bold', 'active')
    .use(ItalicTool, () => '#italic', 'active')
    .use(UnderlineTool, () => '#underline', 'active')
    .use(StrikeThroughTool, () => '#strike-through', 'active')
    .use(Heading1Tool, () => '#heading', 'active')
    .use(ParagraphTool, () => '#paragraph', 'active')
    .use(OrderedList, () => '#ol', 'active')
    .use(UnorderedList, () => '#ul', 'active')
    .use(BlockquoteTool, () => '#blockquote', 'active')
    .use(JustifyLeftTool, () => '#align-left', 'active')
    .use(JustifyCenterTool, () => '#align-center', 'active')
    .use(JustifyRightTool, () => '#align-right', 'active')
    .mount('#content');
})();
