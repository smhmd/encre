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
  ImageTool,
} from '/src/index';
import '/src/theme/styles.less';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';

(function () {
  function bindImgButtonFunc(exec: (str: string) => any) {
    const img = document.querySelector('#img');
    const imgInput = document.querySelector('#img-input') as HTMLInputElement;
    if (img && imgInput) {
      img.addEventListener(
        'click',
        () => {
          imgInput.click();
        },
        false
      );
      imgInput.addEventListener(
        'change',
        (e: Event) => {
          const input = e.target as HTMLInputElement;
          const files = input.files;
          if (!files) return;
          let file: File, target: FileReader | null;
          for (let i = 0; i < files.length; i++) {
            file = files[i];
            const reader = new FileReader();

            reader.onload = function ($e) {
              if ((target = $e.target)) {
                exec(String(target.result));
              }
            };

            reader.readAsDataURL(file);
          }
        },
        false
      );
    }
  }
  const jsonContainer = document.querySelector('#json-container');
  const editor = createEditor({
    autofocus: false,
    placeholder: '请输入文字。',
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
    .use(ImageTool, bindImgButtonFunc)
    .mount('#content');
  editor.onRangeSaved(() => {
    if (jsonContainer) {
      jsonContainer.innerHTML = JSON.stringify(editor.getJson());
    }
  });
})();
