import { computed, defineComponent, h, ref } from 'vue';
import { sketchProps, useSketchProvider } from '../../composables';

export default defineComponent({
  name: 'as-sketch',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    ...sketchProps,
  },
  setup(props, context) {
    const renderer = ref<null | HTMLCanvasElement>(null);
    const { computedViewBox, styles } = useSketchProvider(props);

    return {
      renderer,
      computedViewBox,
      styles,
    };
  },
  methods: {
    genRenderer() {
      return h(
        'svg',
        {
          class: 'ako-svg',
          viewBox: this.computedViewBox,
          xmlns: 'http://www.w3.org/2000/svg',
          ref: 'renderer',
        },
        this.$slots.default && this.$slots.default()
      );
    },
  },
  render() {
    return h(
      this.tag,
      {
        class: 'ako-sketch',
        style: this.styles,
        role: 'Sketch',
      },
      this.genRenderer()
    );
  },
});
