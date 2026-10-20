/**
 * 画面に出す図と、背景に描き足す物（段階2）。見た目は前の2本にそろえる（白い角丸のパネル、字幕と同じ書体、太い線）。
 * 背景に描き足す物（乾燥機）は、みんちりえの背景になじむよう、線を描かずに面のグラデーションと影で描く。
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
 * S7：背景（アパートの玄関ホール）の右手前の洗濯機の上に置く、ラックと乾燥機。
 * 座標は背景の画像（1920x1080）にそろえてある。洗濯機と同じく、少し左を向いた面を見せる。
 * fresh: 新しい乾燥機（白くつやがある）。false なら古い乾燥機（くすんだ色）
 */
export const DryerOnRack: React.FC<{ fresh?: boolean }> = ({ fresh = true }) => {
  const body = fresh ? ["#fbfaf7", "#e9e5dc", "#cfc9bd"] : ["#efe7d3", "#d9cfb6", "#b9ad92"];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="dryerFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.6" stopColor={body[1]} />
          <stop offset="1" stopColor={body[2]} />
        </linearGradient>
        <linearGradient id="dryerTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={body[1]} />
        </linearGradient>
        <linearGradient id="dryerDoor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fresh ? "#f4f1ea" : "#e8dcc0"} />
          <stop offset="1" stopColor={fresh ? "#d8d2c5" : "#c4b48f"} />
        </linearGradient>
        <linearGradient id="pole" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6f6f6" />
          <stop offset="1" stopColor="#bdbdbd" />
        </linearGradient>
        <radialGradient id="warmLight" cx="0.15" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#ffe7c7" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffe7c7" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {/* 壁に落ちる影 */}
      <path d="M1475 150 L1905 170 L1905 500 L1475 488 Z" fill="#7a5a3a" opacity={0.22} filter="url(#soft)" transform="translate(18 14)" />
      {/* ラックの柱（洗濯機の左右から立ち上がる） */}
      <rect x={1428} y={110} width={16} height={970} fill="url(#pole)" />
      <rect x={1888} y={120} width={16} height={960} fill="url(#pole)" />
      {/* 棚板 */}
      <path d="M1420 476 L1910 492 L1910 506 L1420 490 Z" fill="#e4e4e4" />
      <path d="M1420 490 L1910 506 L1910 512 L1420 496 Z" fill="#a9a9a9" />
      {/* 乾燥機の上面 */}
      <path d="M1462 140 L1880 152 L1900 132 L1490 122 Z" fill="url(#dryerTop)" />
      {/* 乾燥機の前面 */}
      <path d="M1462 140 L1880 152 L1880 478 L1462 466 Z" fill="url(#dryerFront)" stroke="#a79f90" strokeWidth={3} strokeLinejoin="round" />
      {/* 前面の下側を少し暗く（床からの照り返しがない） */}
      <path d="M1462 380 L1880 392 L1880 478 L1462 466 Z" fill="#6b5a44" opacity={0.12} />
      {/* 上の角のつや */}
      <path d="M1470 146 L1872 157" stroke="#ffffff" strokeWidth={5} opacity={0.8} strokeLinecap="round" />
      {/* 右の側面（少しだけ見える） */}
      <path d="M1880 152 L1900 132 L1900 460 L1880 478 Z" fill={body[2]} />
      {/* 扉 */}
      <rect x={1510} y={172} width={290} height={234} rx={26} fill="url(#dryerDoor)" stroke="#b8b0a0" strokeWidth={4} transform="skewY(1.6) translate(0 -42)" />
      {/* 扉の中の窓（中の洗濯物が少し見える） */}
      <rect x={1560} y={210} width={190} height={150} rx={20} fill="#c9c2b3" opacity={0.55} transform="skewY(1.6) translate(0 -43)" />
      {/* 扉の取っ手 */}
      <path d="M1772 250 L1792 251 L1792 330 L1772 329 Z" fill="#9c9486" />
      {/* 操作パネル */}
      <path d="M1500 420 L1846 429 L1846 458 L1500 449 Z" fill="#d8d3c8" />
      <path d="M1700 426 L1770 428 L1770 448 L1700 446 Z" fill="#6f8f80" />
      <circle cx={1795} cy={442} r={9} fill="#8f8a80" />
      <circle cx={1822} cy={443} r={9} fill="#8f8a80" />
      {/* 天井の照明が当たる、ふんわりした光 */}
      <path d="M1462 140 L1880 152 L1880 478 L1462 466 Z" fill="url(#warmLight)" />
      {/* 下の洗濯機とのすき間の影 */}
      <path d="M1440 500 L1905 515 L1905 545 L1440 530 Z" fill="#5a4630" opacity={0.18} filter="url(#soft)" />
    </svg>
  );
};

/** 手順の帯（今の手順をオレンジで強調する）。step が 0 なら全部を同じ色で並べる */
const Steps: React.FC<{ style: Style; steps: string[]; step: number; fontSize?: number }> = ({ style, steps, step, fontSize = 34 }) => (
  <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
    {steps.map((s, i) => {
      const on = i + 1 === step;
      const done = step === 0 || i + 1 < step;
      return (
        <div
          key={s}
          style={{
            flex: 1,
            padding: "12px 10px",
            borderRadius: 16,
            fontSize,
            whiteSpace: "nowrap",
            background: on ? style.colors.accent : "#eeeeee",
            color: on ? "#fff" : done ? style.colors.captionText : "#8a8a8a",
          }}
        >
          {`${i + 1}. ${s}`}
        </div>
      );
    })}
  </div>
);

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

/**
 * S5 の差し込み：洗面台の排水口の中（断面）。ゴミ受けを外し、その下の部品を回して外す。
 * step: 1＝ゴミ受け、2＝下の部品を回す
 */
export const DrainDiagram: React.FC<{ style: Style; step: number }> = ({ style, step }) => {
  const line = style.colors.frame;
  const sw = style.caption.border;
  const accent = style.colors.accent;
  const hi = (n: number) => (step === n ? accent : line);
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px" }}>
      <div style={{ fontSize: 52, marginBottom: 4 }}>洗面台の排水口（断面）</div>
      <svg viewBox="0 0 1100 460" width={1100} height={460}>
        {/* 洗面ボウル */}
        <path d="M60 60 Q120 210 470 220 L630 220 Q980 210 1040 60" fill="#eef3f6" stroke={line} strokeWidth={sw} strokeLinejoin="round" />
        {/* 排水口の管 */}
        <path d="M470 220 L470 430 M630 220 L630 430" stroke={line} strokeWidth={sw} />
        <rect x={470} y={220} width={160} height={210} fill="#dfe6ea" />
        {/* ゴミ受け（かご） */}
        <g stroke={hi(1)} strokeWidth={step === 1 ? 9 : 6} fill="#ffffff">
          <path d="M480 200 L620 200 L605 268 L495 268 Z" />
          <path d="M515 210 L520 260 M550 210 L550 260 M585 210 L580 260" fill="none" />
        </g>
        <text x={660} y={250} fontFamily={fontFamily} fontWeight={800} fontSize={44} fill={hi(1)}>
          ゴミ受け
        </text>
        {/* その下の部品（回して外す） */}
        <rect x={490} y={310} width={120} height={70} rx={12} fill="#c9d3da" stroke={hi(2)} strokeWidth={step === 2 ? 9 : 6} />
        <path d="M500 330 L600 330 M500 350 L600 350" stroke={hi(2)} strokeWidth={4} />
        <text x={660} y={360} fontFamily={fontFamily} fontWeight={800} fontSize={44} fill={hi(2)}>
          その下の部品
        </text>
        {step === 2 ? (
          <>
            {/* 回す向き */}
            <path d="M430 300 A80 40 0 1 0 430 390" fill="none" stroke={accent} strokeWidth={12} strokeLinecap="round" />
            <path d="M410 372 L432 394 L408 410" fill="none" stroke={accent} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            <text x={150} y={360} fontFamily={fontFamily} fontWeight={800} fontSize={48} fill={accent}>
              回して外す
            </text>
          </>
        ) : null}
      </svg>
      <Steps style={style} steps={["ゴミ受けを外す", "下の部品を回して外す"]} step={step} />
    </Card>
  );
};

/**
 * S7 の差し込み：乾燥機の説明書のページ。のせる → つなぐ → とめる の3コマ。
 * step: 今読んでいる手順（1〜3）
 */
export const ManualPage: React.FC<{ style: Style; step: number }> = ({ style, step }) => {
  const line = style.colors.frame;
  const accent = style.colors.accent;
  const frames: { title: string; draw: React.ReactNode }[] = [
    {
      title: "台にのせる",
      draw: (
        <>
          <rect x={60} y={170} width={180} height={20} fill="#bbb" stroke={line} strokeWidth={4} />
          <rect x={80} y={50} width={140} height={110} rx={10} fill="#fff" stroke={line} strokeWidth={5} />
          <circle cx={150} cy={105} r={30} fill="#eee" stroke={line} strokeWidth={4} />
          <path d="M150 10 L150 40" stroke={accent} strokeWidth={8} strokeLinecap="round" />
        </>
      ),
    },
    {
      title: "ダクトをつなぐ",
      draw: (
        <>
          <rect x={40} y={60} width={140} height={110} rx={10} fill="#fff" stroke={line} strokeWidth={5} />
          <path d="M180 100 Q230 100 240 50 L240 20" fill="none" stroke="#9aa" strokeWidth={26} />
          <path d="M180 100 Q230 100 240 50 L240 20" fill="none" stroke={line} strokeWidth={4} strokeDasharray="6 8" />
          <circle cx={182} cy={100} r={16} fill="none" stroke={accent} strokeWidth={7} />
        </>
      ),
    },
    {
      title: "ネジでとめる",
      draw: (
        <>
          <rect x={60} y={60} width={160} height={110} rx={10} fill="#fff" stroke={line} strokeWidth={5} />
          <circle cx={140} cy={115} r={22} fill="#ddd" stroke={line} strokeWidth={5} />
          <path d="M126 115 L154 115" stroke={line} strokeWidth={5} />
          <path d="M100 70 A50 50 0 0 1 185 80" fill="none" stroke={accent} strokeWidth={7} strokeLinecap="round" />
          <path d="M172 66 L188 82 L168 92" fill="none" stroke={accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
  ];
  return (
    <Card style={style} css={{ width: 1240, padding: "26px 40px 28px", background: "#fbf8ef" }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>とりつけかた</div>
      <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
        {frames.map((fr, i) => {
          const on = i + 1 === step;
          return (
            <div
              key={fr.title}
              style={{
                width: 360,
                border: `${on ? 8 : 4}px solid ${on ? accent : "#bbb"}`,
                borderRadius: 18,
                background: "#fff",
                opacity: i + 1 <= step ? 1 : 0.45,
                padding: "10px 0 14px",
              }}
            >
              <svg viewBox="0 0 280 200" width={280} height={200}>
                {fr.draw}
              </svg>
              <div style={{ fontSize: 38, color: on ? accent : style.colors.captionText }}>{`${i + 1}. ${fr.title}`}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/** S8 の差し込み：「自分でやってみる」と「プロに頼む」の2列の表 */
export const ProOrSelf: React.FC<{ style: Style }> = ({ style }) => {
  const self = ["網戸の張り替え", "排水口のそうじ", "電球の交換", "説明書どおりの取りつけ"];
  const pro = ["ガスの工事", "電気の工事（配線）", "高い所の作業"];
  const col = (title: string, items: string[], color: string) => (
    <div style={{ flex: 1, border: `6px solid ${color}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ background: color, color: "#fff", fontSize: 50, padding: "10px 0" }}>{title}</div>
      <div style={{ padding: "16px 24px", textAlign: "left" }}>
        {items.map((t) => (
          <div key={t} style={{ fontSize: 38, lineHeight: 1.7, whiteSpace: "nowrap" }}>
            {`・${t}`}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Card style={style} css={{ width: 1240, padding: "30px 40px" }}>
      <div style={{ display: "flex", gap: 32 }}>
        {col("自分でやってみる", self, style.colors.zundamon)}
        {col("プロに頼む", pro, style.colors.accent)}
      </div>
    </Card>
  );
};

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
      whiteSpace: "nowrap",
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
