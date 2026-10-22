/**
 * 画面に出す図と、背景に描き足す物（段階2）。見た目は前の2本にそろえる（白い角丸のパネル、字幕と同じ書体、太い線）。
 * atarimae の Panels.tsx を複製し、図と描き足す物をこの動画のもの（場所の文字・名札・ヘッドセット・聞こえ方の図・リビングの図）に描き直した。
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
    ["音声", "VOICEVOX:ずんだもん　VOICEVOX:四国めたん\nVOICEVOX:春日部つむぎ"],
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
const Bubble: React.FC<{ text: string; color: string; faded?: boolean; size?: number }> = ({ text, color, faded = false, size = 40 }) => (
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

/** S3: 聞こえ方の図。左＝ずんだもんの耳（仲間の声と自分の声）、右＝リビング（ずんだもんの声だけ。仲間の声は聞こえない）。
 * reveal は右側を出す割合（0〜1。台詞に合わせて右を後から出す） */
export const HearingDiagram: React.FC<{ style: Style; reveal?: number }> = ({ style, reveal = 1 }) => {
  const friend = "#7a8699";
  const zunda = style.colors.zundamon;
  const side = (title: string, sub: string, inside: boolean) => (
    <Card style={style} css={{ width: 760, height: 640, padding: "26px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontSize: 50 }}>{title}</div>
      <div style={{ fontSize: 32, color: "#666", marginTop: -10 }}>{sub}</div>
      <div style={{ position: "relative", flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <Bubble text={"右から来てる！"} color={friend} faded={!inside} size={34} />
          <Bubble text={"ナイス！"} color={friend} faded={!inside} size={34} />
        </div>
        <Bubble text={"撃つのだー！"} color={zunda} size={52} />
        <div style={{ display: "flex", gap: 14 }}>
          <Bubble text={"いけいけ！"} color={friend} faded={!inside} size={34} />
          <Bubble text={"回復して！"} color={friend} faded={!inside} size={34} />
        </div>
      </div>
      <div style={{ fontSize: 34, color: inside ? friend : style.colors.accent }}>{inside ? "仲間4人の声＋自分の声" : "聞こえるのは、ずんだもんの声だけ"}</div>
    </Card>
  );
  return (
    <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
      {side("ずんだもんの耳", "ヘッドホンの中", true)}
      <div style={{ opacity: reveal }}>{side("リビング", "つむぎに聞こえる音", false)}</div>
    </div>
  );
};

/** S7: リビングの図（間取りを上から見た形）。真ん中がリビング、まわりに4つの部屋。
 * open＝だれかがくつろいでいると、扉が開いて人が出てくる（矢印）。closed＝ひとりが叫んでいて、扉は閉まったまま。
 * t は人が出てくる進み（0〜1。open のときだけ使う） */
export const LivingDiagram: React.FC<{ style: Style; mode: "open" | "closed"; t?: number }> = ({ style, mode, t = 1 }) => {
  const line = style.colors.frame;
  const open = mode === "open";
  const W = 1100;
  const H = 600;
  const living = { x: 330, y: 150, w: 440, h: 300 };
  // 部屋（左上・右上・左下・右下）と、リビングへの扉の位置
  const rooms = [
    { x: 40, y: 30, door: { x: 330, y: 200 }, color: style.colors.metan },
    { x: 790, y: 30, door: { x: 770, y: 200 }, color: style.colors.tsumugi },
    { x: 40, y: 330, door: { x: 330, y: 400 }, color: "#4a7bd0" },
    { x: 790, y: 330, door: { x: 770, y: 400 }, color: "#8a5a2b" },
  ];
  const ease = (v: number) => 1 - (1 - v) * (1 - v);
  return (
    <Card style={style} css={{ width: W + 60, padding: "24px 30px 18px" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* 部屋 */}
        {rooms.map((r, i) => (
          <g key={i}>
            <rect x={r.x} y={r.y} width={270} height={240} rx={18} fill={open ? "#fff7e8" : "#d9d9de"} stroke={line} strokeWidth={6} />
            {/* 扉（開くと線が斜めになる） */}
            <line x1={r.door.x} y1={r.door.y - 36} x2={r.door.x} y2={r.door.y + 36} stroke={open ? "#fff7e8" : "#555"} strokeWidth={14} />
            {open ? <line x1={r.door.x} y1={r.door.y - 36} x2={r.door.x + (r.door.x < 550 ? -46 : 46)} y2={r.door.y - 6} stroke={line} strokeWidth={6} /> : null}
            {!open ? <text x={r.x + 135} y={r.y + 200} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={34} fill="#777">……</text> : null}
          </g>
        ))}
        {/* リビング */}
        <rect x={living.x} y={living.y} width={living.w} height={living.h} rx={20} fill={open ? "#fff3c4" : "#f1f1f4"} stroke={line} strokeWidth={8} />
        <text x={living.x + living.w / 2} y={living.y + 50} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={42} fill={line}>リビング</text>
        {/* ソファー */}
        <rect x={living.x + 120} y={living.y + 190} width={200} height={70} rx={20} fill="#7d9fd6" stroke={line} strokeWidth={5} />
        {/* ずんだもん（緑の丸）。closed では叫んでいる（声の波） */}
        <circle cx={living.x + 220} cy={living.y + 160} r={34} fill={style.colors.zundamon} stroke={line} strokeWidth={5} />
        {/* 住人（丸）。open では部屋から扉を通って、リビングのソファーのまわりへ歩いてくる */}
        {rooms.map((r, i) => {
          const k = open ? ease(Math.min(1, Math.max(0, t * 1.4 - i * 0.12))) : 0;
          const home = { x: r.x + 135, y: r.y + 120 };
          const seat = [
            { x: living.x + 70, y: living.y + 130 },
            { x: living.x + 370, y: living.y + 130 },
            { x: living.x + 70, y: living.y + 235 },
            { x: living.x + 370, y: living.y + 235 },
          ][i];
          // 前半で扉まで、後半でソファーのまわりへ
          const via = k < 0.5 ? home : r.door;
          const to = k < 0.5 ? r.door : seat;
          const u = k < 0.5 ? k * 2 : (k - 0.5) * 2;
          return <circle key={i} cx={via.x + (to.x - via.x) * u} cy={via.y + (to.y - via.y) * u} r={30} fill={r.color} stroke={line} strokeWidth={5} />;
        })}
        {open ? (
          <text x={living.x + 290} y={living.y + 130} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#8a6">♪</text>
        ) : (
          [0, 1, 2].map((i) => (
            <path key={i} d={`M ${living.x + 270 + i * 28} ${living.y + 120} q 22 40 0 80`} fill="none" stroke={style.colors.accent} strokeWidth={7} strokeLinecap="round" />
          ))
        )}
      </svg>
      <div style={{ fontSize: 44, marginTop: 8, color: open ? style.colors.captionText : style.colors.accent }}>
        {open ? "だれかがくつろいでいると、みんな出てくる" : "ひとりで叫んでいると、扉が閉まったまま"}
      </div>
    </Card>
  );
};
