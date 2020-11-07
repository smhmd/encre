import { clamp } from '@lagabu/tool';
import {
  convertToNumber,
  Pointer,
  StringOrNumber,
  Vector,
} from '../utils/helpers';
import { useSketchLine } from './useLine';

/**
 * 绘制手绘矩形
 * @param x
 * @param y
 * @param width
 * @param height
 * @param offset
 */
export function useRect(
  x: StringOrNumber,
  y: StringOrNumber,
  width: StringOrNumber,
  height: StringOrNumber,
  offset: StringOrNumber = 0
) {
  const x1 = convertToNumber(x),
    y1 = convertToNumber(y),
    dw = convertToNumber(width),
    dh = convertToNumber(height);
  const top = useSketchLine(x1, y1, x1 + dw, y1, offset),
    right = useSketchLine(x1 + dw, y1, x1 + dw, y1 + dh, offset),
    bottom = useSketchLine(x1 + dw, y1 + dh, x1, y1 + dh, offset),
    left = useSketchLine(x1, y1 + dh, x1, y1, offset);

  return [top, right, bottom, left];
}

/**
 * 平行四边形区域内填充
 * @param x
 * @param y
 * @param width
 * @param height
 * @param offset
 * @param angle
 * @param segments
 */
export function useFillRect(
  x: StringOrNumber,
  y: StringOrNumber,
  width: StringOrNumber,
  height: StringOrNumber,
  offset: StringOrNumber = 0,
  angle: StringOrNumber = 0.5,
  segments: StringOrNumber = 10
) {
  const x1 = convertToNumber(x),
    y1 = convertToNumber(y),
    dw = convertToNumber(width),
    dh = convertToNumber(height),
    a = convertToNumber(angle),
    degree = a * 180;
  let segs = convertToNumber(segments),
    A = 0,
    B = -1,
    C = 0,
    totalLength = dh;
  const start = new Pointer(x1, y1),
    end = new Pointer(x1, y1);

  segs = segs < 10 ? 10 : segs;
  if (degree % 180 === 0) {
    // angle = 0
    A = 0;
  } else if (degree % 90 === 0) {
    // angle === 90
    B = 0;
    A = 1;
    totalLength = dw;
  } else {
    A = +Math.tan(a * Math.PI).toFixed(2);
    totalLength = Math.abs(A * dw) + totalLength;
  }

  const lines = [];
  for (let i = 0; i < segs; i++) {
    let segLength = i * (totalLength / segs);
    if (A === 0) {
      // angle = 0
      start.x = x1;
      start.y = y1 + segLength;
      end.x = x1 + dw;
      end.y = y1 + segLength;
    } else if (B === 0) {
      // angle = 90
      start.x = x1 + segLength;
      start.y = y1;
      end.x = x1 + segLength;
      end.y = y1 + dh;
    } else {
      if (A > 0) {
        // 0 < angle < 90 || 180 < angle < 270
        start.x = x1 + dw;
        start.y = y1 - dw * A + segLength;
        end.x = x1;
        end.y = y1 + segLength;
      } else {
        start.x = x1;
        start.y = y1 + dw * A + segLength;
        end.x = x1 + dw;
        end.y = y1 + segLength;
      }
    }

    // lines push
    lines.push(useSketchLine(start.x, start.y, end.x, end.y, offset));
  }

  return lines;
}
