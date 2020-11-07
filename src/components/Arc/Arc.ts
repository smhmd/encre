import { computed, defineComponent, h } from 'vue';
import { stringOrNumberProps } from '../../utils/helpers';

export default defineComponent({
  name: 'as-arc',
  props: {
    cx: stringOrNumberProps(),
    cy: stringOrNumberProps(),
    radius: stringOrNumberProps(),
    angle: {
      type: [String, Number],
      default: 0,
    },
  },
  setup(props) {
    const computedPath = computed(() => {});
    return {
      computedPath,
    };
  },
  methods: {
    genArc() {
      return h('path', {});
    },
  },
  render() {
    return h('g', {
      role: 'arc',
    });
  },
});
