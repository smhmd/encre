import { createEditor, h } from '/src/index';
createEditor({
  placeholder: h('div', { class: 'editor-block', contenteditable: true }, [
    'Please type ',
    h('b', 'Something '),
    'essential!',
  ]),
}).mount('#app');
