import {
  BoldTool,
  createEditor,
  ItalicTool,
  UnderlineTool,
  StrikeThroughTool,
} from '/src/index';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.less';
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
  .mount('#content');
