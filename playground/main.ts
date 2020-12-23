import '/src/theme.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';
import {
  createEncre,
  UnorderedList,
  OrderedList,
  BoldPlugin,
  ItalicPlugin,
} from '/src/index';

const editor = createEncre()
  .use(UnorderedList)
  .use(OrderedList)
  .use(ItalicPlugin)
  .use(BoldPlugin)
  .mount('#content');

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

registerClick('#ul', UnorderedList);
registerClick('#ol', OrderedList);
registerClick('#bold', BoldPlugin);
registerClick('#italic', ItalicPlugin);

editor.onRangeSaved(() => {
  registerActive('#ul', UnorderedList);
  registerActive('#ol', OrderedList);
  registerActive('#bold', BoldPlugin);
  registerActive('#italic', ItalicPlugin);
});
