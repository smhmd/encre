import { convertToNumber, StringOrNumber } from '../utils/helpers';

export function useArc(
  cx: StringOrNumber,
  cy: StringOrNumber,
  radius: StringOrNumber,
  offset: StringOrNumber = 0
) {
  const x = convertToNumber(cx),
    y = convertToNumber(cy);
  
}
