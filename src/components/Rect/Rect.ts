import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  VNodeArrayChildren,
} from 'vue';
import Line, { DefaultOffset } from '../Line/Line';
import { convertToNumber, stringOrNumberProps } from '../../utils/helpers';
import { useFillRect, useRect } from '../../composables';
import { isBool, isString } from '@lagabu/tool';

export default defineComponent({
  name: 'as-rect',
  props: {
    x: stringOrNumberProps(),
    y: stringOrNumberProps(),
    width: stringOrNumberProps(),
    height: stringOrNumberProps(),
    offset: {
      type: [String, Number],
      default: DefaultOffset,
    },
    fill: {
      type: [String, Boolean],
      default: false,
    },
    fillAngle: {
      type: [String, Number],
      default: 0.25,
    },
    segments: {
      type: [String, Number],
      default: 10,
    },
    stroke: {
      type: [String, Boolean],
      default: null,
    },
    clipId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const computedPath = computed(() => {
      const rectBorderArray = useRect(
        0,
        0,
        props.width,
        props.height,
        props.offset
      );
      let pathString = `M ${rectBorderArray[0].M.x} ${rectBorderArray[0].M.y} `;
      for (let elem of rectBorderArray) {
        pathString += `Q ${elem.Q.x} ${elem.Q.y}, ${elem.mid.x} ${elem.mid.y} T ${elem.T.x} ${elem.T.y} `;
      }
      pathString += 'Z';
      return pathString;
    });

    const computedFillPath = computed(() => {
      if (!props.fill && !isString(props.fill)) {
        return '';
      }
      const segments = useFillRect(
        0,
        0,
        props.width,
        props.height,
        props.offset,
        props.fillAngle,
        props.segments
      );
      return segments.reduce((prev, next) => {
        prev += `M ${next.M.x} ${next.M.y} Q ${next.Q.x} ${next.Q.y}, ${next.mid.x} ${next.mid.y} T ${next.T.x} ${next.T.y} `;
        return prev;
      }, '');
    });

    const uid = getCurrentInstance()?.uid || 0;

    return {
      computedPath,
      computedFillPath,
      uid,
    };
  },
  methods: {
    genInner() {
      // 填充内容
      const id = this.clipId || 'rect-clip-' + this.uid;
      return h('g', { role: 'rect-inner' }, [
        h(
          'clipPath',
          {
            id,
          },
          this.genBorderPath()
        ),
        h('path', {
          d: this.computedFillPath,
          fill: 'transparent',
          stroke: this.fill || this.stroke,

          'clip-path': `url(#${id})`,
        }),
      ]);
    },
    genBorderPath() {
      return h('path', {
        d: this.computedPath,
        fill: 'transparent',
      });
    },
    genBorder() {
      // 四条边
      return h(
        'g',
        {
          role: 'rect-border',
        },
        this.genBorderPath()
      );
    },
  },
  computed: {
    computedTranslate(): string {
      return `translate(${convertToNumber(this.x)}, ${convertToNumber(
        this.y
      )})`;
    },
  },
  render() {
    const children: VNodeArrayChildren = [this.genBorder()];
    if (this.fill === '' || this.fill) {
      children.push(this.genInner());
    }
    return h(
      'g',
      {
        role: 'rect',
        transform: this.computedTranslate,
        stroke: this.stroke,
      },
      children
    );
  },
});
