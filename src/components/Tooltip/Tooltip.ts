import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'as-tooltip',
  render() {
    return h('div', {}, this.$slots.default && this.$slots.default());
  },
});
