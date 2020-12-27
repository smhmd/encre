import '/src/theme.css';
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
import placeholder from './word.json';

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

editor.setJson(JSON.parse(JSON.stringify(placeholder)));

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

function registerImage() {
  const input = document.querySelector('#img-input');
  if (!input) return;
  document.querySelector('#img')?.addEventListener(
    'click',
    () => {
      input.click();
    },
    false
  );
  input.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files) return;
    let file: File | null;
    for (let i = 0; i < files.length; i++) {
      if ((file = files.item(i))) {
        const reader = new FileReader();
        reader.onload = function ($e) {
          editor.plugins.get(ImagePlugin)?.exec($e.target?.result?.toString());
        };
        reader.readAsDataURL(file);
      }
    }
    (e.target as HTMLInputElement).value = '';
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
registerImage();
