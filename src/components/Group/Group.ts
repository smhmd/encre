import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'ak-group',
  render() {
    return h('g', {}, this.$slots.default && this.$slots.default());
  },
});
