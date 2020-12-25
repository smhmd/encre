import '/src/theme.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';
import {
  createEncre,
  UnorderedList,
  OrderedList,
  BoldPlugin,
  ItalicPlugin,
  StrikeThroughPlugin,
  UnderlinePlugin,
  Heading2Plugin,
  ParagraphPlugin,
  BlockquotePlugin,
  AlignLeftPlugin,
  AlignRightPlugin,
  AlignCenterPlugin,
  ImagePlugin,
} from '/src/index';

const editor = createEncre()
  .use(
    UnorderedList,
    {},
    {
      class: 'list-item',
    }
  )
  .use(OrderedList)
  .use(ItalicPlugin)
  .use(BoldPlugin)
  .use(StrikeThroughPlugin)
  .use(UnderlinePlugin)
  .use(Heading2Plugin)
  .use(ParagraphPlugin)
  .use(BlockquotePlugin)
  .use(AlignLeftPlugin)
  .use(AlignCenterPlugin)
  .use(AlignRightPlugin)
  .use(ImagePlugin)
  .mount('#content');

editor.setJson([
  {
    feature: 'block',
    children: [
      {
        feature: 'ul',
        children: [
          {
            feature: 'li',
            children: ['Hello'],
          },
          {
            feature: 'li',
            children: ['World'],
          },
        ],
      },
    ],
  },
]);

function registerClick(
  selector: string,
  constructor: new (...args: any[]) => any
) {
  document.querySelector(selector)?.addEventListener(
    'click',
    () => {
      editor.plugins.get(constructor)?.exec();
    },
    false
  );
}

function registerActive(
  selector: string,
  constructor: new (...args: any[]) => any,
  activeName: string = 'active'
) {
  let plg: any,
    elm = document.querySelector(selector);
  if (!elm || !(plg = editor.plugins.get(constructor))) return;
  plg.isActive()
    ? elm.classList.add(activeName)
    : elm.classList.remove(activeName);
}

function register(selector: string, constructor: new (...args: any[]) => any) {
  registerClick(selector, constructor);
  editor.onUpdate(() => {
    registerActive(selector, constructor);
  });
}

register('#ul', UnorderedList);
register('#ol', OrderedList);
register('#bold', BoldPlugin);
register('#italic', ItalicPlugin);
register('#underline', UnderlinePlugin);
register('#strike-through', StrikeThroughPlugin);
register('#heading', Heading2Plugin);
register('#blockquote', BlockquotePlugin);
register('#paragraph', ParagraphPlugin);
register('#align-left', AlignLeftPlugin);
register('#align-center', AlignCenterPlugin);
register('#align-right', AlignRightPlugin);

editor.onUpdate(() => {
  console.log(editor.getJson());
});
