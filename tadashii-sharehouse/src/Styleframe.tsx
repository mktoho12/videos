/**
 * 段階2 スタイルフレーム。構成案C の代表シーン（S3・S4・S7）を静止画として組む。
 * 動きはまだ入れない（段階3 アニマティック・段階4 本実装で扱う）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { fontFamily } from "./font";
import { Caption } from "./Caption";
import { MANIFESTS, Tachie } from "./Tachie";
import { Style, styleDefaults, styleSchema } from "./style";

const characterSchema = z.enum(["zundamon", "metan", "tsumugi"]);
const slotSchema = z.enum(["left", "center", "right", "trioLeft", "trioRight"]);

const castSchema = z.object({
  character: characterSchema,
  /** 立ち位置（style.tachieCenterX のどれを使うか） */
  slot: slotSchema,
  /** 左右反転（相手の方を向かせるため） */
  flip: z.boolean(),
  pick: z.record(z.string(), z.string()),
  toggles: z.record(z.string(), z.boolean()),
});

export const styleframeSchema = z.object({
  scene: z.enum(["S3", "S4", "S7"]),
  style: styleSchema,
  /** 背景（public/bg のファイル名）と、キャラの手前に重ねるレイヤー（なければ空） */
  background: z.string(),
  foreground: z.string(),
  cast: z.array(castSchema),
  speaker: characterSchema,
  caption: z.string(),
  /** 画面に重ねる図: S3 の往復カウンター、S7 の貼り紙だらけの冷蔵庫 */
  overlay: z.enum(["none", "counter", "fridge"]),
});

export type StyleframeProps = z.infer<typeof styleframeSchema>;
type Slot = z.infer<typeof slotSchema>;

const base = { style: styleDefaults, background: "kitchen_night.png", foreground: "" };

/** シーンごとの既定値（Root で scene ごとに渡す） */
export const styleframeScenes: Record<StyleframeProps["scene"], StyleframeProps> = {
  // S3: 言い合い。左のずんだもんと右のつむぎが、同じ所を行ったり来たりする
  S3: {
    ...base,
    scene: "S3",
    cast: [
      {
        character: "zundamon",
        slot: "left",
        flip: true,
        pick: { 眉: "怒り眉", 目: "基本目", 口: "むくー", 右腕: "腰", 左腕: "腰" },
        toggles: {},
      },
      {
        character: "tsumugi",
        slot: "right",
        flip: false,
        pick: { まゆ: "おこ眉", 目: "基本目セット", 口: "むん", 右腕: "ゆびさし", 左腕: "基本" },
        toggles: {},
      },
    ],
    speaker: "tsumugi",
    caption: "でも、勝手に食べましたよね",
    overlay: "counter",
  },
  // S4: めたんが真ん中に入ってきて、片方の言い分を認める。2人は少し冷静になる
  S4: {
    ...base,
    scene: "S4",
    cast: [
      {
        character: "zundamon",
        slot: "trioLeft",
        flip: true,
        pick: { 眉: "困り眉", 目: "基本目", 口: "んー", 右腕: "基本", 左腕: "基本" },
        toggles: {},
      },
      {
        character: "metan",
        slot: "center",
        flip: false,
        pick: { 眉: "ごきげん", 口: "ほほえみ", 右腕: "手をかざす", 左腕: "普通" },
        toggles: {},
      },
      {
        character: "tsumugi",
        slot: "trioRight",
        flip: false,
        pick: { まゆ: "困り眉", 目: "基本目セット", 口: "む", 右腕: "基本", 左腕: "基本" },
        toggles: {},
      },
    ],
    speaker: "metan",
    caption: "期限切れを置いておくのも、ちょっと困るわね",
    overlay: "none",
  },
  // S7: オチ。冷蔵庫が貼り紙だらけになり、ずんだもんがつむぎを見張る
  S7: {
    ...base,
    scene: "S7",
    cast: [
      {
        character: "zundamon",
        slot: "trioLeft",
        flip: true,
        pick: { 眉: "上がり眉", 目: "基本目", 口: "うわー", 右腕: "指差し横", 左腕: "腰" },
        toggles: {},
      },
      {
        character: "tsumugi",
        slot: "trioRight",
        flip: false,
        pick: { まゆ: "困り眉", 目: "〇〇", 口: "おあー", 右腕: "口元", 左腕: "口元" },
        toggles: { 汗: true },
      },
    ],
    speaker: "zundamon",
    caption: "いま4秒開けていたのだ！ルール違反なのだ！",
    overlay: "fridge",
  },
};

export const styleframeDefaults = styleframeScenes.S3;

/** 白い角丸のパネル（前作の図と同じ見た目） */
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

/** S3: 言い合いの往復カウンターと「平行線」 */
const Counter: React.FC<{ style: Style }> = ({ style }) => (
  <div style={{ position: "absolute", left: "50%", top: 60, transform: "translateX(-50%)", textAlign: "center" }}>
    <Card style={style} css={{ padding: "14px 36px", display: "flex", alignItems: "center", gap: 20, fontSize: 44 }}>
      <span style={{ color: style.colors.zundamon }}>期限切れ</span>
      <span style={{ fontSize: 56 }}>⇄</span>
      <span style={{ color: style.colors.tsumugi }}>勝手に</span>
      <span style={{ marginLeft: 12, padding: "4px 18px", borderRadius: 14, background: style.colors.frame, color: "#fff" }}>12往復</span>
    </Card>
    <div
      style={{
        marginTop: 26,
        fontFamily,
        fontWeight: 800,
        fontSize: 92,
        color: "#fff",
        WebkitTextStroke: `${style.caption.border * 2}px ${style.colors.frame}`,
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 rgba(0,0,0,0.25)",
      }}
    >
      平行線……
    </div>
  </div>
);

/** S7: 貼り紙だらけの冷蔵庫。背景の手前のレイヤー（換気扇・カウンター）に隠れないよう、図として一番手前に出す */
const NOTES: [string, number, number, number, string][] = [
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
const Fridge: React.FC<{ style: Style }> = ({ style }) => (
  <div style={{ position: "absolute", left: "50%", top: 40, width: 440, height: 800, transform: "translateX(-50%) scale(0.8)", transformOrigin: "top center" }}>
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
    {NOTES.map(([text, x, y, rot, color]) => (
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

export const Styleframe: React.FC<StyleframeProps> = (props) => {
  const { style, background, foreground, cast, speaker, caption, overlay } = props;
  const { width } = useVideoConfig();
  const centerX = (slot: Slot) => width * style.tachieCenterX[slot];
  const speakerSlot = cast.find((c) => c.character === speaker)?.slot ?? "center";
  const captionSide = speakerSlot === "center" ? "center" : speakerSlot.toLowerCase().includes("left") ? "left" : "right";
  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.frame }}>
      <AbsoluteFill style={{ inset: style.frame.width, borderRadius: style.frame.radius, overflow: "hidden" }}>
        <Img src={staticFile(`bg/${background}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {cast.map((c) => (
          <Tachie
            key={c.character}
            character={c.character}
            scale={style.tachieScale[c.character]}
            flip={c.flip}
            pick={c.pick}
            toggles={c.toggles}
            style={{
              left: centerX(c.slot) - (MANIFESTS[c.character].width * style.tachieScale[c.character]) / 2 - style.frame.width,
              top: style.tachieTop[c.character],
            }}
          />
        ))}
        {foreground ? (
          <Img src={staticFile(`bg/${foreground}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        ) : null}
        {overlay === "counter" ? <Counter style={style} /> : null}
        {overlay === "fridge" ? <Fridge style={style} /> : null}
        <Caption style={style} speaker={speaker} side={captionSide} text={caption} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
