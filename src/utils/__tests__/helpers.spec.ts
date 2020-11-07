import { convertToNumber } from '../helpers';

describe('helpers.ts', () => {
  it('should convert string to number', () => {
    expect(convertToNumber('1e-1')).toEqual(0.1);
    expect(convertToNumber('11px')).toEqual(11);
    expect(convertToNumber('11')).toEqual(11);
    expect(convertToNumber(11)).toEqual(11);
    expect(convertToNumber('1px1')).toEqual(NaN);
  });
});
