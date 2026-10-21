/**
 * 画面に出す図と、背景に描き足す物（段階2）。見た目は前の2本にそろえる（白い角丸のパネル、字幕と同じ書体、太い線）。
 * omoikomi の Panels.tsx を複製し、図をこの動画のもの（玄関の今と昔・冷蔵庫の棚・気力のゲージ・波の線・靴下）に描き直した。
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

/** 靴（横から見た運動靴）。原点はかかとの下 */
const Shoe: React.FC<{ x: number; y: number; color: string; rotate?: number; scale?: number; line: string }> = ({
  x,
  y,
  color,
  rotate = 0,
  scale = 1,
  line,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path d="M0 -10 Q0 -38 18 -40 L48 -52 Q62 -56 66 -42 L96 -30 Q112 -24 112 -12 L112 -10 Z" fill={color} stroke={line} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-2} y={-12} width={116} height={12} rx={6} fill="#f4f1ea" stroke={line} strokeWidth={4} />
  </g>
);

const SHOE_COLORS = ["#5cbf2a", "#e0508f", "#e8a91c", "#4a7bd0", "#8a5a2b", "#3a3a3a", "#c94a3a", "#7d5bbf", "#2fa39a", "#d9d2c5"];

/** 靴箱（扉を外した正面）。棚ごとに入れる靴の数を指定する。空いた所は破線で囲む */
const ShoeRack: React.FC<{ x: number; y: number; filled: number[]; perShelf: number; line: string; accent: string; showGaps: boolean }> = ({
  x,
  y,
  filled,
  perShelf,
  line,
  accent,
  showGaps,
}) => {
  const cellW = 66;
  const cellH = 62;
  const w = cellW * perShelf + 24;
  const h = cellH * filled.length + 24;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#e2b98a" stroke={line} strokeWidth={5} />
      {filled.map((n, row) => (
        <g key={row} transform={`translate(12 ${12 + row * cellH})`}>
          <rect x={0} y={0} width={cellW * perShelf} height={cellH} fill="#c99868" stroke={line} strokeWidth={3} />
          {Array.from({ length: perShelf }, (_, i) =>
            i < n ? (
              <Shoe key={i} x={i * cellW + 6} y={cellH - 6} color={SHOE_COLORS[(row * 3 + i) % SHOE_COLORS.length]} scale={0.48} line={line} />
            ) : showGaps ? (
              <rect key={i} x={i * cellW + 5} y={6} width={cellW - 10} height={cellH - 12} rx={6} fill="none" stroke={accent} strokeWidth={4} strokeDasharray="10 6" />
            ) : null,
          )}
        </g>
      ))}
    </g>
  );
};

/** 玄関の正面図（土間・上がり框・靴箱）。before＝靴があふれて土間が見えない、after＝靴箱に空きがあり、土間に1足だけ */
const EntranceScene: React.FC<{ style: Style; before: boolean }> = ({ style, before }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  // あふれた靴（位置・向き・色を固定。毎フレーム同じ絵になるよう乱数は使わない）
  const pile = [
    [70, 330, -8], [180, 340, 12], [300, 325, -20], [400, 345, 6], [500, 330, 18], [120, 380, 4], [240, 390, -14], [360, 385, 10],
    [470, 395, -6], [560, 380, 22], [60, 430, 16], [170, 440, -4], [290, 435, 8], [410, 440, -18], [520, 445, 4], [220, 300, 30],
    [440, 300, -26], [350, 290, 170], [130, 290, 190],
  ];
  return (
    <svg viewBox="0 0 640 470" width={560} height={411}>
      {/* 壁と廊下 */}
      <rect x={0} y={0} width={640} height={250} fill="#f3e6d3" />
      <rect x={0} y={250} width={640} height={30} fill="#d9a066" stroke={line} strokeWidth={4} />
      {/* 土間 */}
      <rect x={0} y={280} width={640} height={190} fill="#9fb7bf" stroke={line} strokeWidth={4} />
      {[110, 220, 330, 440, 550].map((gx) => (
        <line key={gx} x1={gx} y1={280} x2={gx} y2={470} stroke="#7f979f" strokeWidth={3} />
      ))}
      <line x1={0} y1={375} x2={640} y2={375} stroke="#7f979f" strokeWidth={3} />
      {/* 靴箱 */}
      <ShoeRack
        x={20}
        y={18}
        filled={before ? [6, 6, 6] : [4, 3, 2]}
        perShelf={6}
        line={line}
        accent={accent}
        showGaps={!before}
      />
      {before ? (
        pile.map(([sx, sy, r], i) => <Shoe key={i} x={sx} y={sy} rotate={r} color={SHOE_COLORS[i % SHOE_COLORS.length]} scale={0.95} line={line} />)
      ) : (
        <>
          <Shoe x={300} y={400} color={SHOE_COLORS[0]} line={line} />
          <Shoe x={330} y={430} color={SHOE_COLORS[0]} line={line} />
        </>
      )}
    </svg>
  );
};

/**
 * S3 の差し込み：前の玄関と今の玄関を左右に並べる。
 * 前は靴が土間を埋めていて、靴箱もいっぱい（しまう場所がない）。今は靴箱に空き（破線）があり、土間には1足だけ。
 * reveal: 右（今の玄関）の出かた。0 なら左だけ、1 なら左右（台詞に合わせて右を出す）
 */
export const EntranceBeforeAfter: React.FC<{ style: Style; reveal?: number }> = ({ style, reveal = 1 }) => {
  const accent = style.colors.accent;
  const panel = (title: string, before: boolean, note: string, color: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 48 }}>{title}</div>
      <div style={{ border: `${style.caption.border - 2}px solid ${style.colors.frame}`, borderRadius: 14, overflow: "hidden", lineHeight: 0 }}>
        <EntranceScene style={style} before={before} />
      </div>
      <div style={{ fontSize: 42, color }}>{note}</div>
    </div>
  );
  return (
    <Card style={style} css={{ padding: "24px 40px 26px", display: "flex", gap: 48 }}>
      {panel("前の玄関", true, "しまう場所がない", style.colors.captionText)}
      <div style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 30}px)` }}>{panel("今の玄関", false, "空きがある", accent)}</div>
    </Card>
  );
};

/** S7 の背景に描き足す：床に落ちた靴下（ずんだ餅のがら）。原点は靴下の中心 */
export const SockOnFloor: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <svg style={{ position: "absolute", left: x - 90 * scale, top: y - 60 * scale, overflow: "visible" }} width={180 * scale} height={120 * scale} viewBox="0 0 180 120">
    <ellipse cx={92} cy={104} rx={84} ry={12} fill="rgba(0,0,0,0.25)" />
    <path
      d="M20 18 L78 10 L84 60 Q88 78 108 80 L150 78 Q172 80 170 96 Q168 108 148 108 L96 110 Q52 112 44 80 Z"
      fill="#7cc84a"
      stroke="#3f7a22"
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path d="M18 18 L78 10 L80 26 L22 34 Z" fill="#f4f1ea" stroke="#3f7a22" strokeWidth={4} strokeLinejoin="round" />
    {/* ずんだ餅のがら（白いお餅に緑のあん） */}
    {[
      [52, 56],
      [70, 88],
      [112, 94],
      [146, 92],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={9} fill="#f7f3e3" />
        <circle cx={cx} cy={cy - 2} r={5} fill="#5cbf2a" />
      </g>
    ))}
  </svg>
);

/** 図の見出し（パネルの上に大きく） */
const Heading: React.FC<{ text: string }> = ({ text }) => <div style={{ fontSize: 52, marginBottom: 10 }}>{text}</div>;

/** ソースの瓶（原点は底の真ん中） */
const Sauce: React.FC<{ x: number; y: number; rotate?: number; line: string }> = ({ x, y, rotate = 0, line }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M-26 0 L-26 -86 Q-26 -110 -12 -120 L-12 -150 L12 -150 L12 -120 Q26 -110 26 -86 L26 0 Z" fill="#5a2e1a" stroke={line} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-14} y={-168} width={28} height={20} rx={4} fill="#c94a3a" stroke={line} strokeWidth={5} />
    <rect x={-22} y={-78} width={44} height={44} rx={6} fill="#f2e3c4" stroke={line} strokeWidth={4} />
  </g>
);

/**
 * S5 の差し込み：冷蔵庫の共有の棚。before＝ソースが何本も転がっている、after＝片付いた棚にソースが1本だけ（オレンジの丸で囲む）
 */
export const FridgeShelf: React.FC<{ style: Style; before: boolean }> = ({ style, before }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  const shelf = (y: number) => <rect x={40} y={y} width={920} height={14} rx={6} fill="#dfe8ee" stroke={line} strokeWidth={4} />;
  return (
    <Card style={style} css={{ padding: "24px 40px 26px" }}>
      <Heading text={before ? "前の冷蔵庫の棚" : "今の冷蔵庫の棚"} />
      <svg viewBox="0 0 1000 470" width={1000} height={470}>
        <rect x={20} y={10} width={960} height={450} rx={24} fill="#f4f8fb" stroke={line} strokeWidth={6} />
        {shelf(170)}
        {shelf(330)}
        {/* 上の段：だれのものでもない、片付いた共有の物（牛乳・卵のケース） */}
        <rect x={110} y={60} width={90} height={110} rx={8} fill="#fff" stroke={line} strokeWidth={5} />
        <rect x={250} y={120} width={200} height={50} rx={10} fill="#f2e3c4" stroke={line} strokeWidth={5} />
        {before ? (
          <>
            {[
              [520, 170, -6], [600, 170, 8], [700, 170, 0], [820, 170, -12],
              [180, 330, 70], [330, 330, -8], [470, 330, 96], [640, 330, 4], [800, 330, -84],
            ].map(([x, y, r], i) => <Sauce key={i} x={x} y={y} rotate={r} line={line} />)}
          </>
        ) : (
          <>
            <Sauce x={640} y={330} line={line} />
            <circle cx={640} cy={250} r={110} fill="none" stroke={accent} strokeWidth={9} strokeDasharray="22 12" />
          </>
        )}
        {/* 下の段 */}
        <rect x={120} y={370} width={260} height={70} rx={12} fill="#cfe6c4" stroke={line} strokeWidth={5} />
      </svg>
    </Card>
  );
};

/**
 * S5 の差し込み：気力（MP）のゲージ。drain＝散らかりで少しずつ減っていく、recover＝散らかりがなくなって戻り、余った分ができる。
 * t: 台詞の進み（0〜1）。減る・戻るの量と、横の札が順に出るのに使う
 */
export const MpGauge: React.FC<{ style: Style; mode: "drain" | "recover"; t: number }> = ({ style, mode, t }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  const drains = ["靴を探す", "物をどかす", "散らかりを見る"];
  const level = mode === "drain" ? 1 - 0.6 * Math.min(1, t * 1.2) : 0.4 + 0.6 * Math.min(1, t * 1.4);
  const W = 940;
  return (
    <Card style={style} css={{ padding: "24px 40px 30px", width: 1240 }}>
      <Heading text="気力（MP）" />
      <svg viewBox={`0 0 ${W + 170} 150`} width={W + 170} height={150}>
        <rect x={60} y={30} width={W} height={90} rx={45} fill="#e6e1d6" stroke={line} strokeWidth={6} />
        <rect x={66} y={36} width={(W - 12) * level} height={78} rx={39} fill="#4a7bd0" />
        {mode === "recover" && t > 0.55 ? (
          <text x={60 + W * 0.7} y={92} fontFamily={fontFamily} fontWeight={800} fontSize={44} fill="#fff" textAnchor="middle">
            余った分
          </text>
        ) : null}
        <text x={60 + W + 20} y={92} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill={line}>
          {Math.round(level * 100)}
        </text>
      </svg>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 12, minHeight: 70 }}>
        {mode === "drain"
          ? drains.map((d, i) => (
              <div
                key={d}
                style={{
                  fontSize: 40,
                  padding: "6px 22px",
                  borderRadius: 40,
                  border: `5px solid ${accent}`,
                  color: accent,
                  opacity: t > i * 0.25 ? 1 : 0,
                }}
              >
                {`${d} −MP`}
              </div>
            ))
          : (
              <div style={{ fontSize: 44, color: accent, opacity: t > 0.55 ? 1 : 0 }}>余った MP で、ほかのことに目が向く</div>
            )}
      </div>
    </Card>
  );
};

/**
 * S6 の差し込み：きれいさの波。上がったり下がったりしながら続く線を、左から描いていく（t: 0〜1）
 */
export const WaveLine: React.FC<{ style: Style; t: number }> = ({ style, t }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  const pts = [
    [0, 300], [120, 240], [220, 170], [320, 200], [420, 130], [520, 220], [600, 260], [700, 180], [800, 120], [900, 170], [1000, 140],
  ];
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x + 60} ${y}` : `L${x + 60} ${y}`)).join(" ");
  const len = 1400;
  return (
    <Card style={style} css={{ padding: "24px 40px 26px", width: 1240 }}>
      <Heading text="きれいさには、波がある" />
      <svg viewBox="0 0 1120 360" width={1120} height={360}>
        <line x1={60} y1={330} x2={1080} y2={330} stroke={line} strokeWidth={5} />
        <line x1={60} y1={330} x2={60} y2={30} stroke={line} strokeWidth={5} />
        <text x={80} y={50} fontFamily={fontFamily} fontWeight={800} fontSize={34} fill={line}>きれいさ</text>
        <text x={1070} y={318} fontFamily={fontFamily} fontWeight={800} fontSize={34} fill={line} textAnchor="end">時間</text>
        <path d={d} fill="none" stroke={style.colors.zundamon} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
        {t > 0.5 ? (
          <text x={60 + 540} y={290} fontFamily={fontFamily} fontWeight={800} fontSize={38} fill={accent} textAnchor="middle">
            忙しい時期は下がる
          </text>
        ) : null}
      </svg>
    </Card>
  );
};

/** S7 の差し込み：きれいな床に靴下が1つ（大きく） */
export const SockCloseUp: React.FC<{ style: Style }> = ({ style }) => (
  <Card style={style} css={{ padding: 0, overflow: "hidden", width: 1100, height: 560, position: "relative", background: "linear-gradient(#c58a55, #a86b3c)" }}>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 96 + 40, height: 4, background: "rgba(80,40,10,0.25)" }} />
    ))}
    <SockOnFloor x={550} y={300} scale={2.6} />
  </Card>
);
