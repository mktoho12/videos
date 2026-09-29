import React from "react";
import type { Style } from "../style";

/** 麦茶の入ったグラス。viewBox 180x240、幅 width で拡縮する */
export const GLASS_VIEWBOX = { width: 180, height: 240 };

// グラスの外形（上が広い台形）
const TOP_Y = 10;
const BOTTOM_Y = 230;
const TOP_LEFT = 10;
const TOP_RIGHT = 170;
const BOTTOM_LEFT = 26;
const BOTTOM_RIGHT = 154;

const edgeX = (y: number, side: "left" | "right") => {
  const t = (y - TOP_Y) / (BOTTOM_Y - TOP_Y);
  return side === "left"
    ? TOP_LEFT + (BOTTOM_LEFT - TOP_LEFT) * t
    : TOP_RIGHT + (BOTTOM_RIGHT - TOP_RIGHT) * t;
};

// 表面の結露。丸い点だと中の泡に見えるので、縦に垂れた滴（上に筋を引く）にする
const DRIPS: { x: number; y: number; r: number; trail: number }[] = [
  { x: 36, y: 50, r: 3.5, trail: 18 },
  { x: 44, y: 118, r: 4.5, trail: 34 },
  { x: 30, y: 186, r: 4, trail: 26 },
  { x: 70, y: 160, r: 3, trail: 14 },
  { x: 118, y: 44, r: 3, trail: 12 },
  { x: 132, y: 132, r: 5, trail: 44 },
  { x: 108, y: 206, r: 3.5, trail: 20 },
  { x: 146, y: 188, r: 3, trail: 16 },
];

const dripPath = (x: number, y: number, r: number) =>
  `M${x} ${y - r * 2.2} C ${x + r * 0.4} ${y - r * 1.2}, ${x + r} ${y - r * 0.3}, ${x + r} ${y + r * 0.2}` +
  ` A ${r} ${r} 0 0 1 ${x - r} ${y + r * 0.2}` +
  ` C ${x - r} ${y - r * 0.3}, ${x - r * 0.4} ${y - r * 1.2}, ${x} ${y - r * 2.2} Z`;

export const Glass: React.FC<{
  colors: Style["colors"];
  width: number;
  /** 麦茶の液面の高さ（グラス座標の y） */
  teaTopY?: number;
  style?: React.CSSProperties;
}> = ({ colors, width, teaTopY = 62, style }) => {
  const height = (width * GLASS_VIEWBOX.height) / GLASS_VIEWBOX.width;
  const tl = edgeX(teaTopY, "left");
  const tr = edgeX(teaTopY, "right");
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${GLASS_VIEWBOX.width} ${GLASS_VIEWBOX.height}`}
      style={style}
    >
      {/* ガラス */}
      <path
        d={`M${TOP_LEFT} ${TOP_Y} L${TOP_RIGHT} ${TOP_Y} L${BOTTOM_RIGHT} ${BOTTOM_Y} L${BOTTOM_LEFT} ${BOTTOM_Y} Z`}
        fill="#FFFFFF"
        opacity={0.45}
      />
      {/* 麦茶 */}
      <path
        d={`M${tl} ${teaTopY} L${tr} ${teaTopY} L${BOTTOM_RIGHT - 4} ${BOTTOM_Y - 12} L${BOTTOM_LEFT + 4} ${BOTTOM_Y - 12} Z`}
        fill={colors.tea}
      />
      <rect x={tl} y={teaTopY} width={tr - tl} height={7} fill={colors.teaSurface} />
      {/* 結露のくもり */}
      <path
        d={`M${TOP_LEFT} ${TOP_Y} L${TOP_RIGHT} ${TOP_Y} L${BOTTOM_RIGHT} ${BOTTOM_Y} L${BOTTOM_LEFT} ${BOTTOM_Y} Z`}
        fill="#FFFFFF"
        opacity={0.12}
      />
      {/* 結露の滴 */}
      {DRIPS.map((d, i) => (
        <g key={i}>
          <line
            x1={d.x}
            y1={d.y - d.trail}
            x2={d.x}
            y2={d.y - d.r}
            stroke="#FFFFFF"
            strokeWidth={d.r * 0.7}
            strokeLinecap="round"
            opacity={0.35}
          />
          <path d={dripPath(d.x, d.y, d.r)} fill="#FFFFFF" opacity={0.7} />
          <circle cx={d.x - d.r * 0.35} cy={d.y - d.r * 0.2} r={d.r * 0.3} fill="#FFFFFF" />
        </g>
      ))}
      {/* 縁 */}
      <path
        d={`M${TOP_LEFT} ${TOP_Y} L${BOTTOM_LEFT} ${BOTTOM_Y} L${BOTTOM_RIGHT} ${BOTTOM_Y} L${TOP_RIGHT} ${TOP_Y}`}
        fill="none"
        stroke={colors.glassEdge}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <line x1={TOP_LEFT} y1={TOP_Y} x2={TOP_RIGHT} y2={TOP_Y} stroke={colors.glassEdge} strokeWidth={3} />
    </svg>
  );
};
