import { defineComponent, h } from 'vue';
import { lerp } from '@lagabu/encre';

export default defineComponent({
  name: 'ELine',
  render() {
    const num = lerp(0, 10, 0.5);
    return h('div', {}, '' + num);
  },
});
