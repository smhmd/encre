import {
  convertBlockToInline,
  createDOM as h,
  html,
  mergeProps,
} from '../src/dom';
describe('dom.ts', () => {
  it("should render h('div')", () => {
    expect(html(h('div'))).toEqual(`<div></div>`);
  });

  it("should render h('[]')", () => {
    expect(html(h([h('div', 'first'), h('div', 'second')]))).toEqual(
      `<div>first</div><div>second</div>`
    );
    expect(html(h(h('div', 'wrapper')))).toEqual(`<div>wrapper</div>`);
  });

  it("should render h('div', {})", () => {
    expect(html(h('div', { class: 'wrapper' }))).toEqual(
      `<div class="wrapper"></div>`
    );

    expect(html(h('div', h('div', { class: 'content' })))).toEqual(
      `<div><div class="content"></div></div>`
    );
  });

  it('should merge classes', () => {
    const props = mergeProps(
      { class: 'hello' },
      {
        class: {
          world: true,
        },
      },
      {
        style: {
          'background-color': '#0f0',
          hehe: '#0',
        },
      },
      {
        style: 'color: #000',
      }
    );
    expect(props).toEqual({
      class: ['hello', 'world'],
      style: [
        {
          'background-color': '#0f0',
          hehe: '#0',
        },
        {
          color: '#000',
        },
      ],
    });

    const wrapper = h('div', props);
    expect(html(wrapper)).toEqual(
      `<div class="hello world" style="background-color: rgb(0, 255, 0); color: rgb(0, 0, 0);"></div>`
    );
  });

  it('should convert block element to inline element', () => {
    console.log(
      html(
        convertBlockToInline(
          h('div', [
            'hello',
            h('span', { style: 'display: inline-block;' }, 'world'),
            h('p', { style: 'display: block;' },'my fellows'),
          ])
        ) as HTMLElement
      )
    );
  });
});
