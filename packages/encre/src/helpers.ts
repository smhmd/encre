export function isArray<T extends any>(str: any): str is Array<T> {
  return Array.isArray(str);
}

export function isUndefined(str: any): str is undefined {
  return typeof str === 'undefined';
}

export function isNumber(str: any): str is number {
  return typeof str === 'number';
}

export function isString(str: any): str is string {
  return typeof str === 'string';
}

export class Pointer {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  reverse() {
    return new Pointer(this.y, this.x);
  }
}

export function ptr(p?: Pointer): Pointer;
export function ptr(x: number, y: number): Pointer;
export function ptr(pointerArray: number[]): Pointer;
export function ptr(...args: any[]): Pointer {
  if (args.length === 1) {
    if (args[0] instanceof Pointer) {
      return args[0];
    } else if (isArray<any>(args[0])) {
      const arg = args[0];
      return new Pointer(+arg[0] || 0, +arg[1] || 0);
    }
  }

  return new Pointer(+args[0] || 0, +args[1] || 0);
}

export class Vector {
  p1: Pointer;
  p2: Pointer;
  constructor(p1: Pointer, p2: Pointer) {
    this.p1 = p1;
    this.p2 = p2;
  }

  /**
   * 两点间的距离
   */
  dist(): number {
    return Math.sqrt(
      (this.p2.y - this.p1.y) ** 2 + (this.p2.x - this.p1.x) ** 2
    );
  }

  /**
   * 直线方程的系数
   */
  coefficient() {
    if (this.p1.x === this.p2.x) {
      // x1 === x2
      return {
        A: 1,
        B: 0,
        C: -this.p1.x,
      };
    }
    const k = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x),
      b = this.p1.y - k * this.p1.x;

    return {
      A: k,
      B: -1,
      C: b,
    };
  }

  reverse() {
    return new Vector(this.p2, this.p1);
  }
}

export function vec(pointOrArray?: Pointer | number[]): Vector;
export function vec(p1: Pointer | number[], p2: Pointer | number[]): Vector;
export function vec(...args: any[]): Vector {
  if (args.length === 1) {
    if (isArray<any>(args[0])) {
      const arg = args[0];
      return new Vector(ptr(), ptr(arg[0], arg[1]));
    } else if (args[0] instanceof Pointer) {
      return new Vector(ptr(), args[0]);
    }
  }

  return new Vector(ptr(args[0]), ptr(args[1]));
}

export function clamp(num: number, min?: number | null, max?: number | null) {
  if (isNumber(min) && isNumber(max)) return Math.max(min, Math.min(max, num));
  else if (isNumber(min) && !isNumber(max)) return Math.max(num, min);
  else if (isNumber(max) && !isNumber(min)) return Math.min(num, max);
  else return num;
}

export function lerp(from: number, to: number, t: number | string) {
  t = isString(t) ? +t.replace(/(\%)/, '') : t || 0;
  const percent = t <= 100 && t > 1 ? t / 100 : t;
  return from + (to - from) * clamp(percent, 0, 1);
}

export function lerpLine(
  p1: Pointer | number[],
  p2: Pointer | number[],
  t: number
): Pointer;
export function lerpLine(
  vectorOrPointer: Vector | Pointer | number[],
  t: number
): Pointer;
export function lerpLine(...args: any[]): Pointer {
  let v: Vector,
    t = 0;
  if (args.length === 2) {
    if (args[0] instanceof Vector) {
      v = args[0];
    } else {
      v = vec(ptr(args[0]));
    }
    t = args[1] || 0;
  } else if (args.length === 3) {
    v = vec(ptr(args[0]), ptr(args[1]));
    t = args[2] || 0;
  } else {
    return ptr();
  }
  let xm: number = v.p1.x,
    ym: number = v.p1.y;
  const co = v.coefficient();
  if (co.B === 0) {
    // x1 === x2
    ym = lerp(v.p1.y, v.p2.y, t);
  } else {
    const k = co.A,
      b = co.C,
      d = lerp(0, v.dist(), t),
      subOrAdd = v.p1.x > v.p2.x ? -1 : 1,
      deltaX = subOrAdd * d * Math.sqrt(1 / (k ** 2 + 1));
    xm = v.p1.x + deltaX;
    ym = k * xm + b;
  }

  return ptr(xm, ym);
}
