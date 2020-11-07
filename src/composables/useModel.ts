import {
  ExtractPropTypes,
  PropType,
  toRef,
  Ref,
  reactive,
  watch,
  customRef,
  UnwrapRef,
  SetupContext,
} from 'vue';

export function useModel<T extends unknown>(
  modelValue: Ref<T>,
  context: SetupContext
) {
  const outerModel = modelValue;
  const state = reactive({ value: outerModel.value });

  const model = customRef((track, trigger) => {
    return {
      set(val: UnwrapRef<T>) {
        if (val === state.value) return;
        state.value = val;
        trigger();
        context.emit('update:modelValue', val);
      },
      get() {
        track();
        return state.value;
      },
    };
  });

  watch(outerModel, (val, old) => {
    state.value = val as UnwrapRef<T>;
  });

  return {
    model,
    state,
  };
}
