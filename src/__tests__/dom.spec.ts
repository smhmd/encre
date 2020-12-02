import { createDom as h, render, html } from '../dom';
describe('dom.ts', () => {
  it('should render real dom', () => {
    const wrapper = render(
      h(
        'div',
        {
          class: 'wrapper',
        },
        [h('div', 'first'), h('div', 'second'), h('div', 'third')]
      )
    );
    expect(html(wrapper)).toBe(
      `<div class="wrapper"><div>first</div><div>second</div><div>third</div></div>`
    );
  });

  it('should render real dom with fragment options', () => {
    const wrapper = render(
      h([
        h('div', { class: 'first' }),
        h('div', { class: 'second' }),
        h('div', { class: 'third' }),
        h('div', { class: 'forth' }),
      ])
    );
    expect(html(wrapper)).toBe(
      `<div class="first"></div><div class="second"></div><div class="third"></div><div class="forth"></div>`
    );
  });
});
