/**
 * 画面の真ん中に出す図（段階2）。網戸のショート amido の Panels.tsx を複製し、図をこの動画のもの（洗濯機の中の洗濯物・かごに出した洗濯物）に描き直した。
 * 幅 1240px で描いてあり、置くときに縮める。
 */
import React from "react";
import { Img } from "remotion";
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

/** 洗濯物（丸めた服）。原点は真ん中 */
const Cloth: React.FC<{ x: number; y: number; r: number; color: string; line: string; rotate?: number }> = ({ x, y, r, color, line, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path
      d={`M${-r} 0 Q${-r} ${-r * 0.8} ${-r * 0.2} ${-r * 0.7} Q${r * 0.3} ${-r} ${r * 0.8} ${-r * 0.5} Q${r * 1.1} 0 ${r * 0.7} ${r * 0.5} Q0 ${r * 0.8} ${-r * 0.6} ${r * 0.5} Z`}
      fill={color}
      stroke={line}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d={`M${-r * 0.4} ${-r * 0.2} Q0 ${r * 0.1} ${r * 0.4} ${-r * 0.1}`} fill="none" stroke={line} strokeWidth={4} strokeLinecap="round" />
  </g>
);
const CLOTHES = ["#5cbf2a", "#7fb3e6", "#f2c94c", "#e88aa8", "#ffffff", "#9b8bd6"];

/** S1・S2：洗濯機（ドラム式）の中に、洗い終わった洗濯物が入れっぱなし */
export const WasherFull: React.FC<{ style: Style }> = ({ style }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 60, marginBottom: 4 }}>洗濯物、入れっぱなし！</div>
      <svg viewBox="0 0 1100 560" width={1100} height={560}>
        {/* 本体 */}
        <rect x={250} y={30} width={600} height={510} rx={40} fill="#f1f3f5" stroke={line} strokeWidth={8} />
        <rect x={250} y={30} width={600} height={90} rx={40} fill="#dde2e7" stroke={line} strokeWidth={8} />
        <circle cx={760} cy={75} r={22} fill="#fff" stroke={line} strokeWidth={5} />
        <rect x={300} y={60} width={160} height={30} rx={8} fill="#2b3a4a" />
        <text x={380} y={84} fontFamily={fontFamily} fontWeight={800} fontSize={26} fill="#7fe0a0" textAnchor="middle">
          終了
        </text>
        {/* 扉の窓と、中の洗濯物 */}
        <circle cx={550} cy={330} r={170} fill="#c9d6e2" stroke={line} strokeWidth={10} />
        <clipPath id="drum">
          <circle cx={550} cy={330} r={150} />
        </clipPath>
        <g clipPath="url(#drum)">
          <rect x={380} y={160} width={340} height={340} fill="#9fb3c6" />
          {[
            [480, 410, 70, 0],
            [600, 420, 80, 30],
            [540, 350, 75, -20],
            [450, 320, 60, 40],
            [640, 330, 65, 10],
            [560, 270, 55, -30],
          ].map(([x, y, r, rot], i) => (
            <Cloth key={i} x={x} y={y} r={r} rotate={rot} color={CLOTHES[i % CLOTHES.length]} line={line} />
          ))}
        </g>
        <circle cx={550} cy={330} r={150} fill="rgba(255,255,255,0.18)" stroke={line} strokeWidth={6} />
        {/* 「いつから？」の札 */}
        <g transform="translate(900 200) rotate(8)">
          <rect x={-95} y={-50} width={240} height={100} rx={16} fill="#fff" stroke={accent} strokeWidth={7} />
          <text x={25} y={15} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill={accent} textAnchor="middle">
            きのうから
          </text>
        </g>
      </svg>
    </Card>
  );
};

/** S3：洗濯物を、かごに出しておいた（「やっといた」） */
export const LaundryBasket: React.FC<{ style: Style }> = ({ style }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 60, marginBottom: 4 }}>かごに、出しておきました</div>
      <svg viewBox="0 0 1100 560" width={1100} height={560}>
        {/* 中身（かごの縁からのぞく洗濯物） */}
        {[
          [400, 250, 80, -10],
          [520, 230, 90, 20],
          [650, 250, 85, -25],
          [470, 300, 75, 35],
          [600, 300, 80, 5],
          [720, 290, 60, -15],
        ].map(([x, y, r, rot], i) => (
          <Cloth key={i} x={x} y={y} r={r} rotate={rot} color={CLOTHES[i % CLOTHES.length]} line={line} />
        ))}
        {/* かご */}
        <path d="M280 300 L820 300 L770 520 L330 520 Z" fill="#f2d39a" stroke={line} strokeWidth={8} strokeLinejoin="round" />
        {[360, 440, 520, 600, 680, 760].map((x) => (
          <line key={x} x1={x} y1={300} x2={x - (x - 550) * 0.08} y2={520} stroke="#c9a35e" strokeWidth={6} />
        ))}
        {[360, 420, 480].map((y) => (
          <line key={y} x1={280 + (y - 300) * 0.23} y1={y} x2={820 - (y - 300) * 0.23} y2={y} stroke="#c9a35e" strokeWidth={6} />
        ))}
        <rect x={262} y={284} width={576} height={34} rx={14} fill="#e8c27c" stroke={line} strokeWidth={8} />
        {/* ことわりの札 */}
        <g transform="translate(900 150) rotate(-6)">
          <rect x={-110} y={-55} width={230} height={110} rx={16} fill="#fff" stroke={accent} strokeWidth={7} />
          <text x={5} y={15} fontFamily={fontFamily} fontWeight={800} fontSize={44} fill={accent} textAnchor="middle">
            やっといた
          </text>
        </g>
      </svg>
    </Card>
  );
};

/** S4：本編の札（本編のサムネイル） */
export const MainVideoCard: React.FC<{ style: Style; src: string }> = ({ style, src }) => (
  <Card style={style} css={{ width: 1240, padding: "26px 40px 34px" }}>
    <div style={{ fontSize: 60, marginBottom: 14 }}>続きは本編で！</div>
    <Img src={src} style={{ width: 1100, height: 619, borderRadius: 16, border: `${style.caption.border}px solid ${style.colors.frame}`, display: "block", margin: "0 auto" }} />
  </Card>
);

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
