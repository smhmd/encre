import { mount, VueWrapper } from '@vue/test-utils';
import Sketch from '../Sketch';

describe('Sketch.ts', () => {
  let mountFunc: (options?: object) => VueWrapper<any>;
  beforeEach(() => {
    mountFunc = (opts = {}) => {
      return mount(Sketch, opts);
    };
  });
  it('should render sketch svg', () => {
    const wrapper = mountFunc({
      props: {
        width: 100,
        height: 100,
      },
      slots: {
        default: 'sketch',
      },
    });
    expect(wrapper.attributes('style')).toContain('width: 100px');
    expect(wrapper.attributes('style')).toContain('height: 100px');
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 100 100');
    expect(wrapper.text()).toBe('sketch');
    expect(wrapper.classes()).toContain('ako-sketch');
    expect(wrapper.html()).toMatchSnapshot();
  });
});
