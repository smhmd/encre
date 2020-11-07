import { VueWrapper, mount } from '@vue/test-utils';
import Line from '../Line';

describe('Line.ts', () => {
  let mountFunc: (options?: object) => VueWrapper<any>;
  beforeEach(() => {
    mountFunc = (opts = {}) => {
      return mount(Line, opts);
    };
  });
  it('should render line', () => {
    const wrapper = mountFunc({
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 100,
    });
    expect(wrapper.element.tagName).toBe('PATH');
  });
});
