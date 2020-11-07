import { vec, ptr, lerp, lerpLine } from '../src/helpers';

describe('helpers.ts', () => {
  it('should create vector', () => {
    expect(vec([0, 0], [3, 4]).dist()).toEqual(5);
    expect(vec(ptr(0, 0), ptr(3, 4)).dist()).toEqual(5);
    expect(vec(ptr([0, 0]), ptr([3, 4])).dist()).toEqual(5);
    expect(vec(ptr([3, 4])).dist()).toEqual(5);
    expect(vec([3, 4]).dist()).toEqual(5);
    expect(vec(ptr(ptr(3, 4))).dist()).toEqual(5);
  });

  it('should lerp number', () => {
    expect(Math.round(lerp(-3, 5, 0.5))).toEqual(1);
    expect(Math.round(lerp(-3, 5, 50))).toEqual(1);
    expect(Math.round(lerp(-3, 5, '50%'))).toEqual(1);
    expect(Math.round(lerp(5, -3, 0.5))).toEqual(1);
  });

  it('should lerp line', () => {
    const p1 = ptr(),
      p2 = ptr([30, 40]);
    const v = vec(p1, p2);
    let p = lerpLine(v, 0.5);
    expect(Math.round(p.x)).toEqual(15);
    expect(Math.round(p.y)).toEqual(20);
    p = lerpLine([0, 0], [30, 40], 0.5);
    expect(Math.round(p.x)).toEqual(15);
    expect(Math.round(p.y)).toEqual(20);
    // reverse vector
    p = lerpLine(v.reverse(), 0.5);
    expect(Math.round(p.x)).toEqual(15);
    expect(Math.round(p.y)).toEqual(20);
    // x1 === x2
    p = lerpLine(vec([1, 0], [1, 2]), 0.5);
    expect(Math.round(p.x)).toEqual(1);
    expect(Math.round(p.y)).toEqual(1);
    // y1 === y2
    p = lerpLine(vec([0, 1], [2, 1]), 0.5);
    expect(Math.round(p.x)).toEqual(1);
    expect(Math.round(p.y)).toEqual(1);
  });
});
