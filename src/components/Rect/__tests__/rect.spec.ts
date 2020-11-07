import { mount, VueWrapper } from '@vue/test-utils';
import Rect from '../Rect';

describe('Rect.ts', () => {
  let mountFunc: (options?: object) => VueWrapper<any>;
  beforeEach(() => {
    mountFunc = (options = {}) => {
      return mount(Rect, options);
    };
  });
  it('should render rect component', async () => {
    const wrapper = mountFunc({
      props: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });

    expect(wrapper.attributes('role')).toBe('rect');
    await wrapper.setProps({
      fill: 'green',
    });
    expect(wrapper.find('[role*="rect-inner"]')).not.toBeUndefined();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
