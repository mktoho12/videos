/**
 * 画面の真ん中に出す図（段階2）。網戸の断面図・手元のアップは本編 omoikomi の Panels.tsx から複製した（幅 1240px で描いてあり、置くときに縮める）。
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

/** 図の中の見出し（左上の帯） */
const Label: React.FC<{ x: number; y: number; text: string; color: string; size?: number; anchor?: "start" | "middle" | "end" }> = ({
  x,
  y,
  text,
  color,
  size = 40,
  anchor = "middle",
}) => (
  <text x={x} y={y} fontFamily={fontFamily} fontWeight={800} fontSize={size} fill={color} textAnchor={anchor}>
    {text}
  </text>
);

/**
 * S3 の差し込み：網戸の張り替えの断面図。
 * 網戸の枠の溝の上に網をのせ、ゴムをローラーで溝に押し込む。下に3つの手順を並べ、3つ目を強調する。
 */
export const ScreenDoorDiagram: React.FC<{ style: Style; step?: number }> = ({ style, step = 3 }) => {
  const line = style.colors.frame;
  const sw = style.caption.border;
  const accent = style.colors.accent;
  const steps = ["古い網を外す", "新しい網をのせる", "ゴムで溝に押し込む"];
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 52, marginBottom: 4 }}>網戸の張り替え（断面）</div>
      <svg viewBox="0 0 1100 440" width={1100} height={440}>
        {/* 網戸の枠（アルミ）。上に溝がある */}
        <path
          d="M120 300 L460 300 L460 230 L520 230 L520 330 L600 330 L600 230 L660 230 L660 300 L980 300 L980 420 L120 420 Z"
          fill="#d4d9de"
          stroke={line}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <Label x={560} y={395} text="溝" color={line} size={44} />
        {/* 網（溝の上を横切り、溝の中に少し沈む） */}
        <path
          d="M80 222 L470 222 Q560 312 650 222 L1020 222"
          fill="none"
          stroke="#6b7b8c"
          strokeWidth={6}
          strokeDasharray="14 8"
        />
        <Label x={900} y={200} text="網" color="#4c5a68" size={44} />
        {/* ゴム（溝に入っていく丸いひも） */}
        <circle cx={560} cy={282} r={30} fill="#3a3a3a" stroke={line} strokeWidth={sw - 2} />
        <line x1={592} y1={290} x2={760} y2={330} stroke={line} strokeWidth={4} />
        <Label x={772} y={348} text="ゴム" color={line} size={44} anchor="start" />
        {/* ローラー（ゴムを上から押し込む） */}
        <path d="M560 182 L330 70" stroke={line} strokeWidth={22} strokeLinecap="round" />
        <path d="M330 70 L250 32" stroke="#8a5a2b" strokeWidth={34} strokeLinecap="round" />
        <circle cx={560} cy={190} r={58} fill="#f2c94c" stroke={line} strokeWidth={sw} />
        <circle cx={560} cy={190} r={14} fill={line} />
        <Label x={220} y={140} text="ローラー" color={line} size={44} />
        {/* 押し込む向き（ローラーの上から下へ） */}
        <path d="M700 40 L700 170" stroke={accent} strokeWidth={14} strokeLinecap="round" />
        <path d="M668 138 L700 182 L732 138" fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <Label x={735} y={110} text="押し込むだけ" color={accent} size={50} anchor="start" />
      </svg>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
        {steps.map((s, i) => {
          const on = i + 1 === step;
          return (
            <div
              key={s}
              style={{
                flex: 1,
                padding: "12px 10px",
                borderRadius: 16,
                fontSize: 34,
                whiteSpace: "nowrap",
                background: on ? accent : "#eeeeee",
                color: on ? "#fff" : "#8a8a8a",
              }}
            >
              {`${i + 1}. ${s}`}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/**
 * S3 の差し込み：網戸の手元のアップ。網の端を、ローラーで溝に押し込んでいるところ。
 * wrinkled: 端がよれている（1回目）。false なら、網を引っぱりながら押し込んでいて、ぴんと張っている（2回目）
 */
export const ScreenDoorHands: React.FC<{ style: Style; wrinkled: boolean }> = ({ style, wrinkled }) => {
  const line = style.colors.frame;
  const sw = style.caption.border;
  const accent = style.colors.accent;
  // 網の目（よれているときは、右下の端が波打つ）
  const meshPath = wrinkled
    ? "M140 120 L900 120 L900 300 Q860 330 900 360 Q850 390 900 420 L900 470 L140 470 Z"
    : "M140 120 L900 120 L900 470 L140 470 Z";
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 52, marginBottom: 4 }}>{wrinkled ? "端っこが、よれる……" : "引っぱりながら、押し込む"}</div>
      <svg viewBox="0 0 1100 540" width={1100} height={540}>
        <defs>
          <pattern id="mesh" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 0 L18 0 M0 0 L0 18" stroke="#6b7b8c" strokeWidth={2} />
          </pattern>
        </defs>
        {/* 網戸の枠（L字に見える角） */}
        <path d="M100 80 L1000 80 L1000 510 L100 510 Z" fill="none" stroke="#c3c9cf" strokeWidth={40} />
        <path d="M100 80 L1000 80 L1000 510 L100 510 Z" fill="none" stroke={line} strokeWidth={sw} />
        {/* 溝（枠の内側の線） */}
        <path d="M130 110 L970 110 L970 480 L130 480 Z" fill="none" stroke="#555" strokeWidth={6} strokeDasharray="2 10" strokeLinecap="round" />
        {/* 網 */}
        <path d={meshPath} fill="url(#mesh)" stroke="#6b7b8c" strokeWidth={4} />
        {wrinkled ? (
          <>
            {/* よれて、しわが寄っている所 */}
            <path d="M780 330 Q820 360 790 400 M820 300 Q860 340 830 390 M740 360 Q770 390 750 430" fill="none" stroke={accent} strokeWidth={8} strokeLinecap="round" />
            <text x={560} y={430} fontFamily={fontFamily} fontWeight={800} fontSize={48} fill={accent}>
              よれた！
            </text>
          </>
        ) : (
          <>
            {/* 網を引っぱる向き */}
            <path d="M560 300 L330 300" stroke={accent} strokeWidth={14} strokeLinecap="round" />
            <path d="M370 266 L322 300 L370 334" fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            <text x={360} y={260} fontFamily={fontFamily} fontWeight={800} fontSize={48} fill={accent}>
              引っぱる
            </text>
          </>
        )}
        {/* ゴム（上の辺はもう入っている） */}
        <path d="M130 110 L970 110 L970 240" fill="none" stroke="#2f2f2f" strokeWidth={12} strokeLinecap="round" />
        {/* ローラー（右の辺の溝を下へ進む） */}
        <path d="M970 250 L1060 40" stroke="#8a5a2b" strokeWidth={30} strokeLinecap="round" />
        <circle cx={970} cy={260} r={42} fill="#f2c94c" stroke={line} strokeWidth={sw} />
        <circle cx={970} cy={260} r={10} fill={line} />
        <path d="M1030 300 L1030 400" stroke={accent} strokeWidth={12} strokeLinecap="round" />
        <path d="M1005 372 L1030 408 L1055 372" fill="none" stroke={accent} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Card>
  );
};


/** S1・S2：網戸に穴があいて、蚊が入ってくる */
export const ScreenDoorHole: React.FC<{ style: Style }> = ({ style }) => {
  const line = style.colors.frame;
  const sw = style.caption.border;
  const accent = style.colors.accent;
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 60, marginBottom: 4 }}>網戸に、穴！</div>
      <svg viewBox="0 0 1100 540" width={1100} height={540}>
        <defs>
          <pattern id="holeMesh" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 0 L18 0 M0 0 L0 18" stroke="#6b7b8c" strokeWidth={2} />
          </pattern>
        </defs>
        {/* 夜の外 */}
        <rect x={100} y={60} width={900} height={460} fill="#1f2a44" />
        {/* 網 */}
        <rect x={100} y={60} width={900} height={460} fill="url(#holeMesh)" />
        {/* 穴（ぎざぎざに破れて、網の端がめくれている） */}
        <path
          d="M560 210 L610 190 L640 230 L700 220 L690 280 L730 320 L670 340 L660 400 L600 370 L550 400 L540 340 L480 330 L520 280 L490 230 Z"
          fill="#1f2a44"
          stroke="#6b7b8c"
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {/* 網戸の枠 */}
        <rect x={100} y={60} width={900} height={460} fill="none" stroke="#c3c9cf" strokeWidth={40} />
        <rect x={80} y={40} width={940} height={500} fill="none" stroke={line} strokeWidth={sw} />
        {/* 穴から入ってくる蚊と、その通り道 */}
        <path d="M600 300 Q760 200 860 260 T1000 200" fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
        <g transform="translate(1000 196)">
          <ellipse cx={0} cy={0} rx={22} ry={9} fill="#2b2b2b" />
          <ellipse cx={-8} cy={-16} rx={16} ry={8} fill="rgba(255,255,255,0.8)" stroke={line} strokeWidth={3} />
          <ellipse cx={10} cy={-16} rx={16} ry={8} fill="rgba(255,255,255,0.8)" stroke={line} strokeWidth={3} />
          <path d="M-22 0 L-48 6" stroke={line} strokeWidth={4} strokeLinecap="round" />
          <path d="M-6 8 L-18 30 M6 8 L2 32 M16 6 L24 28" stroke={line} strokeWidth={3} strokeLinecap="round" />
        </g>
        <text x={880} y={330} fontFamily={fontFamily} fontWeight={800} fontSize={56} fill={accent}>
          プ〜ン
        </text>
      </svg>
    </Card>
  );
};

/** S5：本編の札（本編のサムネイル） */
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
