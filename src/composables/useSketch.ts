import { convertToUnit } from '@lagabu/tool';
import {
  computed,
  ComputedRef,
  ExtractPropTypes,
  inject,
  InjectionKey,
  provide,
} from 'vue';
import { convertToNumber } from '../utils/helpers';

export const SketchSymbol: InjectionKey<{
  width: ComputedRef<number>;
  height: ComputedRef<number>;
}> = Symbol('Sketch');

export const sketchProps = {
  width: [String, Number],
  height: [String, Number],
  boxWidth: [String, Number],
  boxHeight: [String, Number],
};

export function useSketchProvider(props: ExtractPropTypes<typeof sketchProps>) {
  const computedBoxWidth = computed(
      () => convertToNumber(props.boxWidth || props.width) || 100
    ),
    computedBoxHeight = computed(
      () => convertToNumber(props.boxHeight || props.height) || 100
    ),
    computedViewBox = computed(() => {
      return `0 0 ${computedBoxWidth.value} ${computedBoxHeight.value}`;
    }),
    styles = computed(() => {
      let obj: Record<string, any> = {};
      if (props.width) obj['width'] = convertToUnit(props.width);
      if (props.height) obj['height'] = convertToUnit(props.height);
      return obj;
    });

  provide(SketchSymbol, {
    width: computedBoxWidth,
    height: computedBoxHeight,
  });
  return {
    computedViewBox,
    styles,
  };
}

export function useSketchInjector() {
  return inject(SketchSymbol);
}
