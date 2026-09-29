import React from "react";
import type { Style } from "../style";

/**
 * 外の熱。画面の左右から波線が寄ってきて、ポットの手前で止まる。
 * 座標はコンポジション全体（1920x1080）の px。
 */
const wavePath = (
  x0: number,
  x1: number,
  y: number,
  amp: number,
  wavelength: number,
  reach: number,
  phase: number,
) => {
  // 熱の波。ポット側（x1）に近づくほど振幅が小さくなり、表面で平らになって止まる。
  // reach: 始点から終点までのどこまで伸びているか（0〜1）。phase: 波の位相（周期単位）
  const len = Math.abs(x1 - x0);
  const n = Math.max(2, Math.round((len * reach) / 4));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * reach;
    const x = x0 + (x1 - x0) * t;
    const envelope = 1 - Math.pow(t, 2.2) * 0.85;
    const yy = y + Math.sin(((t * len) / wavelength - phase) * Math.PI * 2) * amp * envelope;
    pts.push(`${x.toFixed(1)} ${yy.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};

export const HeatWaves: React.FC<{
  colors: Style["colors"];
  /** ポットの左右の端（px） */
  stopLeft: number;
  stopRight: number;
  /** 波を置く高さ（px） */
  rows: number[];
  /** 画面端からの始点（px） */
  startLeft: number;
  startRight: number;
  width: number;
  height: number;
  /** 行ごとの伸び具合（0〜1）。省略時はすべて伸びきった状態 */
  reach?: number[];
  /** 波の位相（周期単位）。時間で増やすと、波がポットへ向かって流れる */
  phase?: number;
  opacity?: number;
}> = ({ colors, stopLeft, stopRight, rows, startLeft, startRight, width, height, reach, phase = 0, opacity = 1 }) => {
  const wavelength = 64;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity }}>
      {rows.map((y, i) => {
        const r = reach?.[i] ?? 1;
        if (r <= 0) {
          return null;
        }
        return (
          <g key={i} opacity={0.75}>
            <path
              d={wavePath(startLeft, stopLeft, y, 10, wavelength, r, phase)}
              fill="none"
              stroke={colors.heat}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <path
              d={wavePath(startRight, stopRight, y, 10, wavelength, r, phase)}
              fill="none"
              stroke={colors.heat}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
};
