import { computed, defineComponent, h } from 'vue';
import { stringOrNumberProps } from '../../utils/helpers';
import { useSketchLine } from '../../composables';

export const DefaultOffset = 1;
export default defineComponent({
  name: 'as-line',
  props: {
    x1: stringOrNumberProps(),
    y1: stringOrNumberProps(),
    x2: stringOrNumberProps(),
    y2: stringOrNumberProps(),
    offset: {
      type: [String, Number],
      default: DefaultOffset,
    },
    fill: {
      type: String,
      default: 'transparent',
    },
  },
  setup(props) {
    const computedPath = computed(() => {
      const { M, Q, mid, T } = useSketchLine(
        props.x1,
        props.y1,
        props.x2,
        props.y2,
        props.offset
      );
      return `M ${M.x} ${M.y} Q ${Q.x} ${Q.y} , ${mid.x} ${mid.y} T ${T.x} ${T.y}`;
    });

    return {
      computedPath,
    };
  },
  render() {
    return h(
      'path',
      {
        role: 'line',
        fill: this.fill,
        d: this.computedPath,
      },
      this.$slots.default && this.$slots.default()
    );
  },
});
