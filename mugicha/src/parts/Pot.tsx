import React from "react";
import type { Style } from "../style";

/**
 * ポット（家にある現物がモデル: ステンレスの胴、黒い肩とふた、上の押しレバー、黒い取っ手）。
 * viewBox 340x540、幅 width で拡縮する。比率は写真（胴の幅：全高 ≒ 1:2、黒い肩とふたで全高の約1/4）に合わせる。
 */
export const POT_VIEWBOX = { width: 340, height: 540 };

/** 見た目の左右の端（viewBox 座標）。熱の波を止める位置に使う */
export const POT_EXTENT = { left: 40, right: 330 };

export const Pot: React.FC<{
  colors: Style["colors"];
  width: number;
  style?: React.CSSProperties;
}> = ({ colors, width, style }) => {
  const height = (width * POT_VIEWBOX.height) / POT_VIEWBOX.width;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${POT_VIEWBOX.width} ${POT_VIEWBOX.height}`}
      style={style}
    >
      {/* 取っ手（黒い肩の上から、胴の上部へ大きく張り出す） */}
      <path
        d="M236 96 C 322 86, 338 214, 276 300"
        fill="none"
        stroke={colors.potDark}
        strokeWidth={26}
        strokeLinecap="round"
      />
      {/* ステンレスの胴（肩で丸く広がり、下はほぼまっすぐ） */}
      <path
        d="M70 158 C 44 176, 40 210, 40 252 L 40 512 Q 40 534, 62 534 L 258 534 Q 280 534, 280 512 L 280 252 C 280 210, 276 176, 250 158 Z"
        fill={colors.potBody}
      />
      {/* 胴のつや・陰 */}
      <path d="M72 230 C 66 300, 64 400, 68 500" stroke="#FFFFFF" strokeWidth={18} strokeLinecap="round" fill="none" opacity={0.5} />
      <path d="M98 214 C 94 300, 92 400, 96 500" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.3} />
      <path d="M262 230 C 268 300, 270 400, 268 504" stroke="#000000" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.1} />
      {/* 底の黒い縁 */}
      <path d="M40 514 L280 514 Q280 534 258 534 L62 534 Q40 534 40 514 Z" fill={colors.potDark} />
      {/* 黒い肩（下に向かって少し広がる） */}
      <path d="M78 84 Q 78 70 92 70 L 228 70 Q 242 70 242 84 L 250 164 L 70 164 Z" fill={colors.potDark} />
      {/* ふた（低いドーム） */}
      <path d="M88 74 Q 98 40 160 38 Q 222 40 232 74 Z" fill={colors.potDark} />
      {/* 押しレバー */}
      <path d="M186 52 L 244 34 Q 260 30 264 42 L 260 52 L 208 68 Z" fill={colors.potDark} />
    </svg>
  );
};
