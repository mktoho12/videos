/**
 * 画面に出す図と、背景に描き足す物（段階2）。見た目は前の2本にそろえる（白い角丸のパネル、字幕と同じ書体、太い線）。
 * hitorigoto の Panels.tsx を複製し、図をこの動画のもの（割り振り表・見え方の図・割り振り表の図・ナレーションの字幕）に描き直した。
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

/** S2: タイトル */
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
      whiteSpace: "pre",
      textAlign: "center",
      lineHeight: 1.3,
      color: style.colors.captionText,
      boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
    }}
  >
    {text}
  </div>
);

/** 縁取りの文字（「数日後」など、時間や場所が飛んだことを示す） */
export const Telop: React.FC<{ style: Style; text: string; color: string; fontSize?: number }> = ({ style, text, color, fontSize = 72 }) => (
  <div
    style={{
      fontFamily,
      fontWeight: 800,
      fontSize,
      lineHeight: 1.2,
      color: "#fff",
      WebkitTextStroke: `${style.caption.border * 2}px ${color}`,
      paintOrder: "stroke fill",
      textShadow: "0 8px 0 rgba(0,0,0,0.25)",
      whiteSpace: "pre",
    }}
  >
    {text}
  </div>
);

/** 終了画面の12秒に、左下に小さく出すクレジット */
export const Credits: React.FC<{ style: Style; bgm: string }> = ({ style, bgm }) => {
  const rows: [string, string][] = [
    ["企画・原案", "EngineMaker新宿"],
    ["音声", "VOICEVOX:ずんだもん　VOICEVOX:四国めたん\nVOICEVOX:春日部つむぎ　AquesTalk"],
    ["立ち絵", "坂本アヒル"],
    ["背景", "みんちりえ"],
    ["BGM", bgm],
    ["効果音", "効果音ラボ"],
  ];
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 800,
        color: "#fff",
        fontSize: 26,
        lineHeight: 1.45,
        padding: "14px 22px",
        background: "rgba(0,0,0,0.55)",
        borderRadius: 14,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 18 }}>
          <span style={{ width: 130, textAlign: "right", opacity: 0.65 }}>{k}</span>
          <span style={{ whiteSpace: "pre" }}>{v}</span>
        </div>
      ))}
    </div>
  );
};

/** 場所の文字（決め事「毎回、初めて見る人にも舞台と関係が分かるようにする」）。最初の場面の上の真ん中に2〜3秒（左上だとヘッドセットのずんだもんに重なる） */
export const PlaceLabel: React.FC<{ style: Style; place: string; detail: string }> = ({ style, place, detail }) => (
  <div style={{ position: "absolute", left: "50%", top: 40, transform: "translateX(-50%)", display: "flex", alignItems: "stretch", fontFamily, fontWeight: 800, boxShadow: "0 8px 0 rgba(0,0,0,0.2)", borderRadius: style.caption.radius }}>
    <div style={{ background: style.colors.frame, color: "#fff", fontSize: 44, padding: "14px 26px", borderRadius: `${style.caption.radius}px 0 0 ${style.caption.radius}px` }}>{place}</div>
    <div style={{ background: style.colors.captionFill, color: style.colors.captionText, fontSize: 44, padding: "14px 30px", border: `${style.caption.border}px solid ${style.colors.frame}`, borderLeft: "none", borderRadius: `0 ${style.caption.radius}px ${style.caption.radius}px 0` }}>{detail}</div>
  </div>
);

/** 名札（それぞれ初めて出てきたときに2〜3秒）。名前と役割。x・y は札の中心の画面座標 */
export const NameTag: React.FC<{ style: Style; name: string; role: string; color: string; x: number; y: number }> = ({ style, name, role, color, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily, fontWeight: 800 }}>
    <div style={{ background: color, color: "#fff", fontSize: 30, padding: "4px 22px", borderRadius: 999, marginBottom: -10, zIndex: 1, border: `5px solid ${style.colors.frame}` }}>{role}</div>
    <div style={{ background: style.colors.captionFill, color: style.colors.captionText, fontSize: 50, padding: "12px 34px 8px", borderRadius: style.caption.radius, border: `${style.caption.border}px solid ${color}`, boxShadow: "0 6px 0 rgba(0,0,0,0.2)" }}>{name}</div>
  </div>
);

/** ゲーム用のヘッドセット（耳あて2つ＋頭のバンド＋口元のマイク）。x・y は頭のてっぺんの中心、width は耳あての外側どうしの幅。
 * flip のときはマイクを反対側に出す（立ち絵を反転したとき） */
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

/** 吹き出し（聞こえ方の図で使う）。faded は「聞こえない」声（点線の枠で中身を薄く） */
export const Bubble: React.FC<{ text: string; color: string; faded?: boolean; size?: number }> = ({ text, color, faded = false, size = 40 }) => (
  <div
    style={{
      fontFamily,
      fontWeight: 800,
      fontSize: size,
      padding: "10px 24px",
      borderRadius: 26,
      background: faded ? "rgba(255,255,255,0.5)" : "#fff",
      border: `6px ${faded ? "dashed" : "solid"} ${color}`,
      color: faded ? "rgba(26,26,26,0.25)" : "#1a1a1a",
      whiteSpace: "pre",
    }}
  >
    {text}
  </div>
);

/** 割り振り表の1行（名前の札と、場所） */
const ChartRow: React.FC<{ style: Style; who: string; color: string; place: string; hot?: boolean; note?: string; size?: number }> = ({ style, who, color, place, hot = false, note, size = 48 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: size }}>
    <div style={{ width: size * 6, textAlign: "right", color }}>{who}</div>
    <div style={{ fontSize: size * 0.8, color: "#999" }}>▶</div>
    <div
      style={{
        minWidth: size * 4.4,
        padding: "6px 24px",
        borderRadius: 16,
        border: hot ? `6px solid ${style.colors.accent}` : "6px solid transparent",
        color: hot ? style.colors.accent : style.colors.captionText,
      }}
    >
      {place}
    </div>
    {note ? <div style={{ fontSize: size * 0.6, color: "#888" }}>{note}</div> : null}
  </div>
);

/** S1: 今月の割り振り表。ずんだもんの欄が、いつもの「玄関」ではなく「台所」 */
export const ChoreChart: React.FC<{ style: Style }> = ({ style }) => (
  <Card style={style} css={{ width: 1180, padding: "30px 50px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
    <div style={{ fontSize: 60, borderBottom: `6px solid ${style.colors.frame}`, padding: "0 30px 10px" }}>掃除の日の割り振り表（今月）</div>
    <ChartRow style={style} who="ずんだもん" color={style.colors.zundamon} place="台所" hot note="（先月：玄関）" />
    <ChartRow style={style} who="つむぎ" color={style.colors.tsumugi} place="洗面所" />
    <ChartRow style={style} who="めたん" color={style.colors.metan} place="玄関" />
    <ChartRow style={style} who="ほかの住人" color="#7a8699" place="お風呂・廊下…" size={40} />
  </Card>
);

/** 見え方の図の、台所の断面（横から見た形）。side＝use は料理しているときの目線（調理台とシンク）、clean は掃除して初めて見える所（冷蔵庫の下・コンロのすき間） */
const KitchenSection: React.FC<{ style: Style; side: "use" | "clean" }> = ({ style, side }) => {
  const line = style.colors.frame;
  const use = side === "use";
  const hl = style.colors.accent;
  return (
    <svg width={780} height={503} viewBox="0 0 620 400">
      {/* 床 */}
      <line x1={10} y1={360} x2={610} y2={360} stroke={line} strokeWidth={6} />
      {/* 調理台（コンロとシンク） */}
      <rect x={40} y={170} width={330} height={190} fill="#f3e2c9" stroke={line} strokeWidth={6} />
      <rect x={30} y={150} width={350} height={24} fill="#fff7ea" stroke={line} strokeWidth={6} />
      <rect x={70} y={136} width={110} height={14} fill="#555" />
      <path d="M250 150 v-60 h40" fill="none" stroke={line} strokeWidth={6} />
      {/* 冷蔵庫（床から少し浮いている） */}
      <rect x={430} y={40} width={150} height={305} fill="#dfe4ea" stroke={line} strokeWidth={6} />
      <line x1={430} y1={150} x2={580} y2={150} stroke={line} strokeWidth={4} />
      <rect x={440} y={345} width={12} height={15} fill={line} />
      <rect x={558} y={345} width={12} height={15} fill={line} />
      {use ? (
        <>
          {/* 料理しているときに見える所：調理台の上 */}
          <rect x={22} y={60} width={366} height={124} fill="none" stroke={hl} strokeWidth={7} strokeDasharray="18 12" rx={14} />
          <text x={205} y={50} textAnchor="middle" fontSize={34} fontWeight={800} fill={hl}>
            調理台・シンク
          </text>
        </>
      ) : (
        <>
          {/* 掃除して初めて見える所：冷蔵庫の下のミニトマトとソースのしみ、調理台と冷蔵庫のすき間のパスタ */}
          <circle cx={500} cy={346} r={14} fill="#e8402c" stroke={line} strokeWidth={3} />
          <path d="M500 333 l6 -6 M500 333 l-7 -4" stroke="#3d8b37" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={465} cy={357} rx={26} ry={5} fill="#8a5a2b" />
          <line x1={392} y1={340} x2={418} y2={250} stroke="#e9c46a" strokeWidth={6} />
          <rect x={385} y={230} width={40} height={130} fill="none" stroke={hl} strokeWidth={6} strokeDasharray="12 8" rx={8} />
          <rect x={428} y={330} width={160} height={42} fill="none" stroke={hl} strokeWidth={6} strokeDasharray="12 8" rx={8} />
          <text x={505} y={395} textAnchor="middle" fontSize={28} fontWeight={800} fill={hl}>
            冷蔵庫の下
          </text>
          <text x={340} y={215} textAnchor="middle" fontSize={28} fontWeight={800} fill={hl}>
            すき間
          </text>
        </>
      )}
    </svg>
  );
};

/** S3: 見え方の図。左＝料理しているときに見える所、右＝掃除して初めて見える所。focus が "hidden" のときは右を強め、左を薄くする */
export const ViewDiagram: React.FC<{ style: Style; focus: "hidden" | "both" }> = ({ style, focus }) => {
  const side = (title: string, s: "use" | "clean", dim: boolean) => (
    <Card style={style} css={{ width: 840, padding: "24px 30px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {/* 薄くするのは中身だけ（カードごと薄くすると後ろの絵が透ける） */}
      <div style={{ opacity: dim ? 0.35 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontSize: 50 }}>{title}</div>
        <KitchenSection style={style} side={s} />
      </div>
    </Card>
  );
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      {side("料理しているときに見える所", "use", focus === "hidden")}
      {side("掃除して初めて見える所", "clean", false)}
    </div>
  );
};

/** S6: 割り振り表の図。月ごとに、場所が入れ替わる（台所に色を付けて、だれに回るかを見せる） */
export const RotationDiagram: React.FC<{ style: Style }> = ({ style }) => {
  const months = ["今月", "来月", "再来月"];
  const people: [string, string][] = [
    ["ずんだもん", style.colors.zundamon],
    ["つむぎ", style.colors.tsumugi],
    ["めたん", style.colors.metan],
  ];
  const table = [
    ["台所", "お風呂", "洗面所"],
    ["洗面所", "台所", "お風呂"],
    ["玄関", "洗面所", "台所"],
  ];
  const cell = { width: 260, height: 110, display: "flex", alignItems: "center", justifyContent: "center" } as const;
  return (
    <Card style={style} css={{ padding: "26px 40px 34px", fontSize: 48 }}>
      <div style={{ fontSize: 56, marginBottom: 14 }}>割り振りは、毎月入れ替わる</div>
      <div style={{ display: "flex" }}>
        <div style={{ ...cell, width: 300 }} />
        {months.map((m) => (
          <div key={m} style={{ ...cell, color: "#777", fontSize: 42 }}>
            {m}
          </div>
        ))}
      </div>
      {people.map(([who, color], r) => (
        <div key={who} style={{ display: "flex", borderTop: "4px solid #ddd" }}>
          <div style={{ ...cell, width: 300, color }}>{who}</div>
          {table[r].map((place, c) => (
            <div key={c} style={cell}>
              <span
                style={{
                  padding: "4px 22px",
                  borderRadius: 14,
                  background: place === "台所" ? style.colors.accent : "transparent",
                  color: place === "台所" ? "#fff" : style.colors.captionText,
                }}
              >
                {place}
              </span>
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
};

/** ナレーションの字幕。キャラの吹き出しと分けて、暗くした画面の真ん中に、縁取りなしの白い文字で出す */
export const NarrationText: React.FC<{ style: Style; text: string }> = ({ style, text }) => (
  <div
    style={{
      maxWidth: 1760,
      fontFamily,
      fontWeight: 800,
      fontSize: 54,
      lineHeight: 1.55,
      color: "#fff",
      textAlign: "center",
      textShadow: "0 4px 18px rgba(0,0,0,0.6)",
      letterSpacing: 2,
      whiteSpace: "pre-wrap",
    }}
  >
    {text}
  </div>
);
