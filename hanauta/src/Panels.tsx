/**
 * 画面の真ん中に出す図（段階2）。前のショート yattoita の Panels.tsx を複製し、図をこの動画のもの（ヘッドホンで歌う・聞こえ方）に描き直した。ヘッドホンは本編 hitorigoto の Headset と同じ。
 * 幅 1240px で描いてあり、置くときに縮める。
 */
import React from "react";
import { fontFamily } from "./font";
import { Style } from "./style";

/** 白い角丸のパネル */
export const Card: React.FC<{ style: Style; children: React.ReactNode; css?: React.CSSProperties }> = ({ style, children, css }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.96)",
      border: `${style.caption.border}px solid ${style.colors.frame}`,
      borderRadius: style.caption.radius,
      fontFamily,
      fontWeight: 800,
      color: style.colors.captionText,
      textAlign: "center",
      boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
      ...css,
    }}
  >
    {children}
  </div>
);

/** 音符 */
const Note: React.FC<{ x: number; y: number; size: number; color: string; line: string; rotate?: number }> = ({ x, y, size, color, line, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size / 100})`}>
    <path d="M30 -70 L30 20" stroke={line} strokeWidth={10} strokeLinecap="round" />
    <path d="M30 -70 Q60 -60 70 -30" fill="none" stroke={line} strokeWidth={10} strokeLinecap="round" />
    <ellipse cx={8} cy={22} rx={26} ry={19} transform="rotate(-20 8 22)" fill={color} stroke={line} strokeWidth={7} />
  </g>
);

/** 頭の上のヘッドホン（耳あてと、間のバンド）。原点は真ん中、幅 w */
const Phones: React.FC<{ x: number; y: number; w: number; line: string }> = ({ x, y, w, line }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M${-w / 2 + 20} 40 C${-w / 2} ${-w * 0.55}, ${w / 2} ${-w * 0.55}, ${w / 2 - 20} 40`} fill="none" stroke={line} strokeWidth={22} strokeLinecap="round" />
    {[-w / 2, w / 2 - 50].map((cx) => (
      <g key={cx}>
        <rect x={cx} y={10} width={50} height={90} rx={22} fill="#2f3542" stroke={line} strokeWidth={6} />
        <rect x={cx + 12} y={22} width={26} height={66} rx={10} fill="#5cbf2a" />
      </g>
    ))}
  </g>
);

/** S1：ヘッドホンで曲を聞きながら、ノリノリで歌っている */
export const SingingBoard: React.FC<{ style: Style }> = ({ style }) => {
  const line = style.colors.frame;
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 60, marginBottom: 4 }}>ヘッドホンで、ノリノリ</div>
      <svg viewBox="0 0 1100 520" width={1100} height={520}>
        <Phones x={550} y={210} w={360} line={line} />
        <Note x={250} y={200} size={120} color={style.colors.zundamon} line={line} rotate={-12} />
        <Note x={870} y={170} size={110} color="#7fb3e6" line={line} rotate={10} />
        <Note x={190} y={400} size={90} color="#f2c94c" line={line} rotate={8} />
        <Note x={920} y={390} size={95} color="#e88aa8" line={line} rotate={-8} />
        <text x={550} y={440} fontFamily={fontFamily} fontWeight={800} fontSize={64} fill={style.colors.zundamon} textAnchor="middle">
          ずんだー♪
        </text>
      </svg>
    </Card>
  );
};

/** S2：聞こえ方。左＝ずんだもんの耳（曲＋自分の歌）、右＝まわり（歌声だけ） */
export const HearingBoard: React.FC<{ style: Style }> = ({ style }) => {
  const line = style.colors.frame;
  const box = (x: number, title: string, color: string, rows: { text: string; on: boolean }[]) => (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={10} width={500} height={470} rx={28} fill="#f7f8fa" stroke={line} strokeWidth={7} />
      <text x={250} y={85} fontFamily={fontFamily} fontWeight={800} fontSize={48} fill={color} textAnchor="middle">
        {title}
      </text>
      {rows.map((r, i) => (
        <g key={r.text} transform={`translate(40 ${150 + i * 150})`}>
          <rect x={0} y={0} width={420} height={110} rx={55} fill={r.on ? "#fff" : "#eceff2"} stroke={r.on ? line : "#b8c0c8"} strokeWidth={6} strokeDasharray={r.on ? undefined : "16 12"} />
          <text x={210} y={73} fontFamily={fontFamily} fontWeight={800} fontSize={46} fill={r.on ? line : "#a5adb5"} textAnchor="middle">
            {r.text}
          </text>
        </g>
      ))}
    </g>
  );
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 60, marginBottom: 4 }}>聞こえているのは？</div>
      <svg viewBox="0 0 1100 500" width={1100} height={500}>
        {box(20, "ずんだもんの耳", style.colors.zundamon, [
          { text: "♪ 流行りの曲", on: true },
          { text: "自分の歌", on: true },
        ])}
        {box(580, "まわりの耳", style.colors.tsumugi, [
          { text: "♪ 流行りの曲", on: false },
          { text: "自分の歌", on: true },
        ])}
      </svg>
    </Card>
  );
};

/** 上のタイトル帯（前のショート nabe と同じ） */
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

/** 立ち絵の頭に付けるヘッドホン（本編 hitorigoto と同じ）。x は顔の真ん中、y は頭のてっぺんあたり */
export const Headset: React.FC<{ x: number; y: number; width: number; height: number; flip?: boolean; color?: string }> = ({ x, y, width, height, flip = false, color = "#2f3542" }) => {
  const line = "#1a1a1a";
  const cup = { w: width * 0.2, h: height * 0.42 };
  const micSide = flip ? -1 : 1;
  return (
    <svg style={{ position: "absolute", left: x - width / 2 - 40, top: y - 20, overflow: "visible" }} width={width + 80} height={height + 80}>
      <g transform="translate(40,20)">
        {/* 頭のバンド */}
        <path d={`M ${cup.w * 0.5} ${height * 0.62} C ${cup.w * 0.2} ${-height * 0.12}, ${width - cup.w * 0.2} ${-height * 0.12}, ${width - cup.w * 0.5} ${height * 0.62}`} fill="none" stroke={line} strokeWidth={30} strokeLinecap="round" />
        <path d={`M ${cup.w * 0.5} ${height * 0.62} C ${cup.w * 0.2} ${-height * 0.12}, ${width - cup.w * 0.2} ${-height * 0.12}, ${width - cup.w * 0.5} ${height * 0.62}`} fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" />
        {/* マイク（口元へ伸びる） */}
        <path d={flip ? `M ${cup.w * 0.5} ${height * 0.8} Q ${-width * 0.02} ${height * 1.12}, ${width * 0.28} ${height * 1.18}` : `M ${width - cup.w * 0.5} ${height * 0.8} Q ${width * 1.02} ${height * 1.12}, ${width * 0.72} ${height * 1.18}`} fill="none" stroke={line} strokeWidth={14} strokeLinecap="round" />
        <circle cx={micSide > 0 ? width * 0.72 : width * 0.28} cy={height * 1.18} r={16} fill={line} />
        {/* 耳あて */}
        {[0, width - cup.w].map((cx) => (
          <g key={cx}>
            <rect x={cx} y={height * 0.55} width={cup.w} height={cup.h} rx={cup.w * 0.45} fill={color} stroke={line} strokeWidth={7} />
            <rect x={cx + cup.w * 0.25} y={height * 0.62} width={cup.w * 0.5} height={cup.h * 0.66} rx={cup.w * 0.2} fill="#5cbf2a" />
          </g>
        ))}
      </g>
    </svg>
  );
};
