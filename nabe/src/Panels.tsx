/**
 * 図（段階2）。流しと大鍋、日付の札、タイトル帯。
 * 線の太さと色は本編（tadashii-sharehouse の Panels.tsx）にそろえる。
 */
import React from "react";
import { fontFamily } from "./font";
import { Style } from "./style";

/** 縁取りの白抜き文字（本編の Telop と同じ作り） */
export const Telop: React.FC<{ style: Style; text: string; color: string; fontSize: number }> = ({ style, text, color, fontSize }) => (
  <div
    style={{
      fontFamily,
      fontWeight: 800,
      fontSize,
      lineHeight: 1.2,
      color: "#fff",
      textAlign: "center",
      WebkitTextStroke: `${style.caption.border * 2}px ${color}`,
      paintOrder: "stroke fill",
      textShadow: "0 8px 0 rgba(0,0,0,0.25)",
      whiteSpace: "pre",
    }}
  >
    {text}
  </div>
);

/** カレーの跡の色（汚れの段階 0〜3。日がたつほど濃くなる） */
const GRIME_COLORS = ["#b5782a", "#9a5f1d", "#7c4813", "#5e350c"];
/** 段階が上がると足す垂れ跡（x, 長さ） */
const EXTRA_DRIPS: [number, number][] = [
  [300, 40],
  [620, 56],
  [470, 70],
];

/**
 * 流しに大鍋が1つ。knobShiny のときはフタの取っ手だけがピカピカ。
 * grime（0〜3）が上がるほどカレーの跡が濃く・多くなり、3 ではにおいの線が出る
 */
export const Sink: React.FC<{ style: Style; knobShiny?: boolean; grime?: number }> = ({ style, knobShiny = false, grime = 0 }) => {
  const line = style.colors.frame;
  const w = style.caption.border;
  const curry = GRIME_COLORS[Math.max(0, Math.min(3, grime))];
  return (
    <svg viewBox="0 0 900 600" width={style.sink.width} height={(style.sink.width * 600) / 900}>
      {/* 調理台と流し */}
      <rect x={10} y={250} width={880} height={330} rx={30} fill="#e9edf0" stroke={line} strokeWidth={w} />
      <rect x={90} y={300} width={720} height={240} rx={40} fill="#b9c3ca" stroke={line} strokeWidth={w} />
      <rect x={110} y={320} width={680} height={60} rx={20} fill="#a7b2ba" />
      {/* 蛇口 */}
      <path d="M720 250 L720 120 Q720 70 670 70 L600 70" fill="none" stroke={line} strokeWidth={26} strokeLinecap="round" />
      <path d="M720 250 L720 120 Q720 70 670 70 L600 70" fill="none" stroke="#d4dbe0" strokeWidth={12} strokeLinecap="round" />
      {/* 大鍋（流しの中に置いてある） */}
      <g>
        {/* 取っ手（左右） */}
        <rect x={168} y={300} width={70} height={30} rx={14} fill="#6d7880" stroke={line} strokeWidth={w} />
        <rect x={662} y={300} width={70} height={30} rx={14} fill="#6d7880" stroke={line} strokeWidth={w} />
        {/* 胴 */}
        <path d="M230 250 L670 250 L650 480 Q648 510 618 510 L282 510 Q252 510 250 480 Z" fill="#8f9aa3" stroke={line} strokeWidth={w} strokeLinejoin="round" />
        {/* カレーの跡 */}
        <path d="M250 262 L650 262 L648 282 Q600 300 560 284 Q520 310 470 286 Q420 306 380 284 Q330 304 300 282 Q270 296 252 280 Z" fill={curry} />
        <path d="M400 286 Q404 330 396 348" stroke={curry} strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M560 286 Q566 316 558 330" stroke={curry} strokeWidth={12} strokeLinecap="round" fill="none" />
        {EXTRA_DRIPS.slice(0, grime).map(([x, len]) => (
          <path key={x} d={`M${x} 284 Q${x + 4} ${284 + len / 2} ${x - 2} ${284 + len}`} stroke={curry} strokeWidth={12} strokeLinecap="round" fill="none" />
        ))}
        {/* フタ（鍋に斜めにのせてある） */}
        <g transform="rotate(-8 450 240)">
          <ellipse cx={450} cy={240} rx={240} ry={42} fill="#a3adb5" stroke={line} strokeWidth={w} />
          {/* フタの取っ手 */}
          <rect x={410} y={176} width={80} height={46} rx={18} fill={knobShiny ? "#f4f8fb" : "#5f6a72"} stroke={line} strokeWidth={w} />
          {knobShiny ? (
            <g fill="#ffd84a" stroke={line} strokeWidth={4}>
              {[
                [380, 170, 1],
                [520, 160, 1.3],
                [470, 128, 0.8],
              ].map(([x, y, s]) => (
                <path
                  key={`${x}`}
                  transform={`translate(${x} ${y}) scale(${s})`}
                  d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z"
                />
              ))}
            </g>
          ) : null}
        </g>
      </g>
      {/* においの線（いちばん汚れたとき） */}
      {grime >= 3 ? (
        <g fill="none" stroke="#7a8a3a" strokeWidth={8} strokeLinecap="round" opacity={0.85}>
          {[300, 450, 600].map((x) => (
            <path key={x} d={`M${x} 150 q-18 -22 0 -44 q18 -22 0 -44`} />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

/** 上のタイトル帯 */
export const TitleBand: React.FC<{ style: Style; text: string }> = ({ style, text }) => (
  <div
    style={{
      display: "inline-block",
      padding: "14px 40px",
      borderRadius: 999,
      background: style.colors.frame,
      color: "#fff",
      fontFamily,
      fontWeight: 800,
      fontSize: style.title.fontSize,
      lineHeight: 1.2,
    }}
  >
    {text}
  </div>
);
