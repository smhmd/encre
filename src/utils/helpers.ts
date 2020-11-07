import { clamp, isNumber, isUndefined, lerp } from '@lagabu/tool';
export function convertToNumber(str: string | number | undefined) {
  if (!isNumber(str) && !str) return NaN;
  if (isNumber(str)) return str;
  if (!isNaN(+str)) {
    return +str;
  }
  return +str.replace(/([a-zA-Z\%]+)$/, '');
}

export function stringOrNumberProps() {
  return {
    type: [String, Number],
    default: 0,
  };
}

export class Pointer {
  private _x: number;
  private _y: number;
  constructor(x?: number, y?: number) {
    this._x = x || 0;
    this._y = y || 0;
  }

  get x() {
    return this._x;
  }

  set x(val: number) {
    this._x = val;
  }

  get y() {
    return this._y;
  }

  set y(val: number) {
    this._y = val;
  }
}

export type Coefficients = {
  A: number;
  B: number;
  C: number;
};

export type StringOrNumber = string | number;

export class Vector {
  p1: Pointer;
  p2: Pointer;
  constructor(p1: Pointer, p2: Pointer) {
    this.p1 = p1;
    this.p2 = p2;
  }

  get coefficients(): Coefficients {
    if (this.p1.x === this.p2.x) {
      return { A: 1, B: 0, C: -this.p1.x };
    }
    let k = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x),
      b = this.p1.y - k * this.p1.x;
    return {
      A: k,
      B: -1,
      C: b,
    };
  }
  get dist() {
    return Math.sqrt(
      (this.p2.x - this.p1.x) ** 2 + (this.p2.y - this.p1.y) ** 2
    );
  }
}

export function lerp2D(p1: Pointer, p2: Pointer, t: number) {
  const v = new Vector(p1, p2);
  let x1 = p1.x,
    y1 = p1.y;
  if (v.coefficients.B === 0) {
    // x1 === x2
    y1 = lerp(p1.y, p2.y, t);
  } else {
    const d = v.dist,
      d1 = clamp(t, 0, 1) * d,
      k = v.coefficients.A,
      b = v.coefficients.C;
    if (k === 0) {
      // y1 === y2
      x1 = lerp(p1.x, p2.x, t);
    } else {
      let subOrAdd = p2.y < p1.y ? -1 : 1;
      y1 = p1.y + subOrAdd * d1 * Math.sqrt(k ** 2 / (k ** 2 + 1));
      x1 = (y1 - b) / k;
    }
  }
  return new Pointer(x1, y1);
}