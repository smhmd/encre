import {
  createANode as h,
  renderANode as render,
  serialize,
  PathMap,
  cloneAbstractNode,
  mergeProps,
  AbstractProps,
  AbstractNode,
} from '../node';
describe('node.ts', () => {
  it('should render node', () => {
    expect(serialize(render(h('div', 'node')))).toEqual('<div>node</div>');
    expect(
      serialize(
        render(
          h('div', { class: 'wrapper' }, [
            h('div', 'start'),
            h('div', 'middle'),
            h('div', 'end'),
          ])
        )
      )
    ).toEqual(
      '<div class="wrapper"><div>start</div><div>middle</div><div>end</div></div>'
    );
    expect(serialize(render(h('div')))).toEqual('<div></div>');
    expect(
      serialize(
        render(h([h('div', 'start'), h('div', 'middle'), h('div', 'end')]))
      )
    ).toEqual(`<div>start</div><div>middle</div><div>end</div>`);
  });

  it('should clone abstract node', () => {
    const node = h(
      'div',
      { class: 'wrapper' },
      h('div', { class: { first: true } }, 'haha')
    );
    const cloneNode = cloneAbstractNode(node);
    expect(serialize(render(node))).toEqual(serialize(render(cloneNode)));
  });

  it('should merge abstract node props', () => {
    const props1: AbstractProps = {
      class: 'haha',
    };
    const props2: AbstractProps = {
      class: 'hehe',
    };
    expect(mergeProps(props1, props2)).toMatchObject({
      class: {
        haha: true,
        hehe: true,
      },
    });
    props2.class = {
      haha: false,
      props1: true,
    };
    expect(mergeProps(props1, props2)).toMatchObject({
      class: { haha: false, props1: true },
    });
  });
});
