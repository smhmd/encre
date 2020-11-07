import {
  Pointer,
  Vector,
  convertToNumber,
  lerp2D,
  StringOrNumber,
} from '../utils/helpers';
import { lerp } from '@lagabu/tool';

/**
 * 绘制手绘线的坐标
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param offset
 */
export function useSketchLine(
  x1: StringOrNumber,
  y1: StringOrNumber,
  x2: StringOrNumber,
  y2: StringOrNumber,
  offset: StringOrNumber = 0
) {
  const p1 = new Pointer(convertToNumber(x1), convertToNumber(y1)),
    p2 = new Pointer(convertToNumber(x2), convertToNumber(y2)),
    mid = new Pointer((p1.x + p2.x) / 2, (p1.y + p2.y) / 2),
    vector = new Vector(p1, p2),
    OFFSET = convertToNumber(offset);
  let q = lerp2D(p1, mid, Math.random());
  if (vector.coefficients.B === 0) {
    // x1 === x2
    q = new Pointer(lerp(q.x - OFFSET, q.x + OFFSET, Math.random()), q.y);
  } else {
    if (vector.coefficients.A === 0) {
      // y1 === y2
      q = new Pointer(q.x, lerp(q.y - OFFSET, q.y + OFFSET, Math.random()));
    } else {
      const k2 = -1 / vector.coefficients.A,
        b2 = q.y - k2 * q.x,
        delta = OFFSET * Math.sqrt(k2 ** 2 / (k2 ** 2 + 1)),
        newQY = q.y + (Math.random() > 0.5 ? 1 : -1) * delta; // random y offset
      q = new Pointer((newQY - b2) / k2, newQY);
    }
  }
  return {
    M: p1,
    Q: q,
    mid,
    T: p2,
  };
}
