/**
 * 画面に出す図（段階4）。見た目はスタイルフレームにそろえる（白い角丸のパネル、字幕と同じ書体）。
 * 動き（出入り・段階的に見せる）は Pudding.tsx 側で付ける。ここは見た目だけで、見せる量は props で受け取る。
 */
import React from "react";
import { fontFamily } from "./font";
import { Style } from "./style";

const Card: React.FC<{ style: Style; children: React.ReactNode; css?: React.CSSProperties }> = ({ style, children, css }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.94)",
      border: `${style.caption.border}px solid ${style.colors.frame}`,
      borderRadius: style.caption.radius,
      fontFamily,
      fontWeight: 800,
      color: style.colors.captionText,
      textAlign: "center",
      ...css,
    }}
  >
    {children}
  </div>
);

/** 白抜きの大きなテロップ */
export const Telop: React.FC<{ style: Style; text: string; color: string; fontSize?: number }> = ({ style, text, color, fontSize = 92 }) => (
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

/** S2: タイトル（顔にかからないよう、画面の上に置く） */
export const Title: React.FC<{ style: Style; text: string }> = ({ style, text }) => (
  <div
    style={{
      padding: `${style.title.fontSize * 0.3}px ${style.title.fontSize * 0.7}px`,
      background: style.colors.captionFill,
      border: `${style.caption.border * 1.5}px solid ${style.colors.frame}`,
      borderRadius: style.caption.radius * 1.5,
      fontFamily,
      fontWeight: 800,
      fontSize: style.title.fontSize,
      whiteSpace: "nowrap",
      color: style.colors.captionText,
      boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
    }}
  >
    {text}
  </div>
);

/** プリンのカップ（S1 の空のカップ、S5 の名前と日付を書いたカップで使う） */
const PuddingCup: React.FC<{ style: Style; empty: boolean; label?: string[] }> = ({ style, empty, label }) => (
  <svg viewBox="0 0 260 240" width={260} height={240}>
    {/* カップ */}
    <path d="M40 60 L220 60 L196 220 L64 220 Z" fill="#fdfdfd" stroke={style.colors.frame} strokeWidth={7} strokeLinejoin="round" />
    {empty ? (
      // 底にカラメルが少しだけ残っている
      <path d="M62 205 L198 205 L196 220 L64 220 Z" fill="#8a4b16" />
    ) : (
      <>
        <path d="M44 80 L216 80 L198 214 L62 214 Z" fill="#f6d36b" />
        <path d="M44 80 L216 80 L212 104 L48 104 Z" fill="#8a4b16" />
      </>
    )}
    {/* ふちとスプーン（空のときだけ） */}
    <rect x={30} y={48} width={200} height={18} rx={8} fill="#fdfdfd" stroke={style.colors.frame} strokeWidth={7} />
    {empty ? <path d="M150 30 L210 -10" stroke={style.colors.frame} strokeWidth={10} strokeLinecap="round" /> : null}
    {label ? (
      <g transform="rotate(-6 130 150)">
        <rect x={70} y={112} width={120} height={78} rx={6} fill="#fff" stroke={style.colors.tsumugi} strokeWidth={5} />
        {label.map((t, i) => (
          <text key={t} x={130} y={144 + i * 32} fontSize={26} textAnchor="middle" fill={style.colors.captionText}>
            {t}
          </text>
        ))}
      </g>
    ) : null}
  </svg>
);

/** S1: 空になったプリンのカップ */
export const Pudding: React.FC<{ style: Style }> = ({ style }) => (
  <Card style={style} css={{ padding: "18px 40px 10px" }}>
    <PuddingCup style={style} empty />
    <div style={{ fontSize: 40, marginTop: 4 }}>あーしのプリン……</div>
  </Card>
);

/** S3: 言い合いの往復カウンター。parallel で「平行線……」を出す */
export const Counter: React.FC<{ style: Style; count: number; parallel: boolean }> = ({ style, count, parallel }) => (
  <div style={{ textAlign: "center" }}>
    <Card style={style} css={{ padding: "14px 36px", display: "inline-flex", alignItems: "center", gap: 20, fontSize: 44 }}>
      <span style={{ color: style.colors.zundamon }}>期限切れ</span>
      <span style={{ fontSize: 56 }}>⇄</span>
      <span style={{ color: style.colors.tsumugi }}>勝手に</span>
      <span style={{ marginLeft: 12, padding: "4px 18px", borderRadius: 14, background: style.colors.frame, color: "#fff" }}>
        {count}往復
      </span>
    </Card>
    <div style={{ marginTop: 26, opacity: parallel ? 1 : 0 }}>
      <Telop style={style} text="平行線……" color={style.colors.frame} />
    </div>
  </div>
);

/** S5: 名前と日付を書いたプリン */
export const Rule: React.FC<{ style: Style }> = ({ style }) => (
  <Card style={style} css={{ padding: "6px 40px 6px 20px", display: "flex", alignItems: "center", gap: 20 }}>
    <PuddingCup style={style} empty={false} label={["つむぎ", "10/19"]} />
    <div style={{ fontSize: 50, textAlign: "left", lineHeight: 1.4 }}>
      <div style={{ fontSize: 38, opacity: 0.7 }}>次からは</div>
      名前と日付を書く
    </div>
  </Card>
);

/** S6: 家ごとの冷蔵庫のルール。count 軒目までを見せる */
const HOUSES: { label: string; color: string }[] = [
  { label: "名前を書く家", color: "#fff6a8" },
  { label: "誰が食べてもいい家", color: "#c9f0ff" },
  { label: "1人1段の家", color: "#d6f5c8" },
];
const MiniFridge: React.FC<{ style: Style; kind: number }> = ({ style, kind }) => (
  <svg viewBox="0 0 160 220" width={160} height={220}>
    <rect x={14} y={8} width={132} height={204} rx={16} fill="#f4f6f7" stroke={style.colors.frame} strokeWidth={6} />
    <line x1={14} y1={78} x2={146} y2={78} stroke={style.colors.frame} strokeWidth={6} />
    {kind === 0 ? (
      // 名前のシールを貼った箱
      <>
        <rect x={34} y={100} width={44} height={36} rx={4} fill="#f6d36b" stroke={style.colors.frame} strokeWidth={3} />
        <rect x={84} y={150} width={44} height={36} rx={4} fill="#ffd1dc" stroke={style.colors.frame} strokeWidth={3} />
        <rect x={40} y={110} width={32} height={14} fill="#fff" />
        <rect x={90} y={160} width={32} height={14} fill="#fff" />
      </>
    ) : kind === 1 ? (
      // 誰でもどうぞ（ハート）
      <path d="M80 175 C40 145 40 110 64 108 C74 108 80 116 80 122 C80 116 86 108 96 108 C120 110 120 145 80 175 Z" fill="#ff8fa3" stroke={style.colors.frame} strokeWidth={3} />
    ) : (
      // 段ごとに色の違う棚
      <>
        <rect x={24} y={92} width={112} height={30} fill="#fff6a8" />
        <rect x={24} y={130} width={112} height={30} fill="#c9f0ff" />
        <rect x={24} y={168} width={112} height={30} fill="#ffd1dc" />
      </>
    )}
  </svg>
);
export const Houses: React.FC<{ style: Style; count: number }> = ({ style, count }) => (
  <Card style={style} css={{ padding: "18px 30px 16px" }}>
    <div style={{ fontSize: 42, marginBottom: 10 }}>冷蔵庫のルールは、家ごとに違っていい</div>
    <div style={{ display: "flex", gap: 26, justifyContent: "center" }}>
      {HOUSES.map((h, i) => (
        <div key={h.label} style={{ opacity: i < count ? 1 : 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <MiniFridge style={style} kind={i} />
          <div style={{ fontSize: 30, padding: "4px 12px", marginTop: 6, background: h.color, borderRadius: 8 }}>{h.label}</div>
        </div>
      ))}
    </div>
  </Card>
);

/** S7: 貼り紙だらけの冷蔵庫。shown 枚目までを見せる（1枚ずつ増やすのは呼び出し側） */
export const NOTES: [string, number, number, number, string][] = [
  // 文言, x, y, 傾き（度）, 色
  ["名前は油性ペン", 20, 40, -6, "#fff6a8"],
  ["日付は西暦から", 150, 130, 5, "#c9f0ff"],
  ["ドアは3秒以内", 60, 270, -3, "#ffd1dc"],
  ["開けたら閉める", 20, 380, 7, "#d6f5c8"],
  ["1人1段", 270, 360, -8, "#fff6a8"],
  ["夜10時以降は静かに", 60, 470, 4, "#c9f0ff"],
  ["ルール違反は報告", 210, 560, -5, "#ffd1dc"],
  ["貼り紙をはがさない", 20, 640, 3, "#d6f5c8"],
];
export const Fridge: React.FC<{ style: Style; shown: number }> = ({ style, shown }) => (
  <div style={{ position: "relative", width: 440, height: 800 }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#f4f6f7",
        border: `${style.caption.border}px solid ${style.colors.frame}`,
        borderRadius: 30,
      }}
    />
    {/* 冷凍室との境目と取っ手 */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, height: style.caption.border, background: style.colors.frame }} />
    <div style={{ position: "absolute", right: 26, top: 120, width: 14, height: 100, borderRadius: 7, background: style.colors.frame }} />
    <div style={{ position: "absolute", right: 26, top: 300, width: 14, height: 160, borderRadius: 7, background: style.colors.frame }} />
    {NOTES.slice(0, shown).map(([text, x, y, rot, color]) => (
      <div
        key={text}
        style={{
          position: "absolute",
          left: x,
          top: y,
          padding: "14px 18px",
          background: color,
          transform: `rotate(${rot}deg)`,
          boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
          fontFamily,
          fontWeight: 800,
          fontSize: 34,
          color: style.colors.captionText,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    ))}
  </div>
);

/** S8: まとめ。count 行目までを見せる */
export const Message: React.FC<{ style: Style; count: number }> = ({ style, count }) => {
  const rows: [string, string][] = [
    ["2人だけだと", style.colors.frame],
    ["＋ もう1人に入ってもらう", style.colors.metan],
    ["＋「次からどうするか」を話す", style.colors.zundamon],
  ];
  return (
    <Card style={style} css={{ padding: "22px 44px", textAlign: "left", fontSize: 50, lineHeight: 1.6 }}>
      {rows.map(([text, color], i) => (
        <div key={text} style={{ color, opacity: i < count ? 1 : 0 }}>
          {text}
        </div>
      ))}
    </Card>
  );
};

/** S9: クレジット */
export const Credits: React.FC<{ style: Style }> = ({ style }) => {
  const rows: [string, string][] = [
    ["音声", "VOICEVOX:ずんだもん　VOICEVOX:四国めたん\nVOICEVOX:春日部つむぎ"],
    ["立ち絵", "坂本アヒル"],
    ["背景", "みんちりえ"],
    ["BGM", "自宅にて / KK（OpenTracks）"],
    ["効果音", "効果音ラボ"],
  ];
  return (
    <div style={{ fontFamily, fontWeight: 800, color: "#fff", fontSize: 50, lineHeight: 1.6 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 48, marginBottom: 18 }}>
          <span style={{ width: 220, textAlign: "right", opacity: 0.6 }}>{k}</span>
          <span style={{ whiteSpace: "pre" }}>{v}</span>
        </div>
      ))}
      <div style={{ height: 8, background: style.colors.tsumugi, marginTop: 24, borderRadius: 4 }} />
    </div>
  );
};
