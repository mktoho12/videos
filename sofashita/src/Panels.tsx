/**
 * 画面の真ん中に出す図（段階2）。前のショート hanauta の Panels.tsx を複製し、図をこの動画のもの（リモコン・ソファーの下）に描き直した。
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

/** リモコン（上から見た形）。x・y は真ん中 */
const Remote: React.FC<{ x: number; y: number; s: number; line: string; rotate?: number }> = ({ x, y, s, line, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
    <rect x={-45} y={-120} width={90} height={240} rx={30} fill="#3a3f4b" stroke={line} strokeWidth={8} />
    <circle cx={0} cy={-80} r={14} fill="#e8402c" />
    {[-30, 0, 30].map((dy) => [-18, 18].map((dx) => <rect key={`${dx}${dy}`} x={dx - 11} y={dy - 9} width={22} height={18} rx={5} fill="#cfd5df" />))}
  </g>
);

/** S1：リモコンが見つからない */
export const RemoteBoard: React.FC<{ style: Style }> = ({ style }) => {
  const line = style.colors.frame;
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 64, marginBottom: 4 }}>リモコンが、ない</div>
      <svg viewBox="0 0 1100 460" width={1100} height={460}>
        <Remote x={550} y={240} s={1.4} line={line} rotate={-14} />
        {[
          [300, 170, 120],
          [800, 150, 100],
          [860, 360, 80],
        ].map(([x, y, sz], i) => (
          <text key={i} x={x} y={y} fontSize={sz} fontWeight={800} fill={style.colors.accent} textAnchor="middle" fontFamily={fontFamily}>
            ？
          </text>
        ))}
      </svg>
    </Card>
  );
};

/** ソファー（横から見た形）と、その下のすき間。found のときは、すき間から出てきた物を並べる */
export const SofaBoard: React.FC<{ style: Style; found: boolean; reveal?: number }> = ({ style, found, reveal = 1 }) => {
  const line = style.colors.frame;
  const items: { label: string; draw: React.ReactNode }[] = [
    { label: "リモコン", draw: <Remote x={0} y={0} s={0.55} line={line} rotate={80} /> },
    { label: "ペン", draw: <g transform="rotate(-20)"><rect x={-80} y={-9} width={150} height={18} rx={8} fill="#4a7bd1" stroke={line} strokeWidth={5} /><path d="M70 -9 L100 0 L70 9 Z" fill="#f2d7a6" stroke={line} strokeWidth={5} /></g> },
    { label: "十円玉", draw: <g><circle r={42} fill="#c77b3a" stroke={line} strokeWidth={6} /><text y={14} fontSize={38} fontWeight={800} textAnchor="middle" fill="#fff" fontFamily={fontFamily}>10</text></g> },
    { label: "くつした", draw: <path d="M-30 -60 h50 v70 q0 30 -30 40 l-50 10 q-30 0 -25 -25 q5 -20 30 -25 l25 -5 Z" fill="#e57fa7" stroke={line} strokeWidth={6} /> },
  ];
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 64, marginBottom: 4 }}>{found ? "ソファーの下から出てきた物" : "ソファーの下"}</div>
      <svg viewBox="0 0 1100 520" width={1100} height={520}>
        {/* 床とソファー（脚が短く、下にすき間がある） */}
        <line x1={20} y1={470} x2={1080} y2={470} stroke={line} strokeWidth={8} />
        <rect x={180} y={170} width={740} height={210} rx={40} fill="#6f8fc9" stroke={line} strokeWidth={8} />
        <rect x={140} y={110} width={110} height={270} rx={40} fill="#5f7fb9" stroke={line} strokeWidth={8} />
        <rect x={850} y={110} width={110} height={270} rx={40} fill="#5f7fb9" stroke={line} strokeWidth={8} />
        <rect x={210} y={380} width={26} height={90} fill={line} />
        <rect x={864} y={380} width={26} height={90} fill={line} />
        <rect x={250} y={390} width={600} height={74} rx={10} fill="none" stroke={style.colors.accent} strokeWidth={7} strokeDasharray="20 12" />
        {found ? (
          items.map((it, i) => {
            const a = Math.min(1, Math.max(0, reveal * items.length - i));
            const x = 160 + i * 260;
            return (
              <g key={it.label} opacity={a} transform={`translate(${x} ${135 + (1 - a) * 60})`}>
                <circle r={112} fill="#fff7ea" stroke={line} strokeWidth={6} />
                {it.draw}
                <text y={160} fontSize={40} fontWeight={800} textAnchor="middle" fill={line} fontFamily={fontFamily}>
                  {it.label}
                </text>
              </g>
            );
          })
        ) : (
          <text x={550} y={445} fontSize={60} fontWeight={800} textAnchor="middle" fill={style.colors.accent} fontFamily={fontFamily}>
            ？？？
          </text>
        )}
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
