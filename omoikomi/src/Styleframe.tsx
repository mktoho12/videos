/**
 * 段階2 スタイルフレーム。構成案A の代表シーンを、画角の違う3枚の静止画として組む。
 * - S1: 話す人への寄り（ずんだもん「今すぐ業者を呼ぶのだ！」）
 * - S3: 差し込み場面（網戸の断面図。背景をぼかし、説明するめたんを右下に小さく残す）
 * - S7: 3人の引き（アパートの玄関ホールに乾燥機を描き足した場所）
 * 動きはまだ入れない（段階3 アニマティック・段階4 本実装で扱う）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { Caption } from "./Caption";
import { DryerOnRack, ScreenDoorDiagram } from "./Panels";
import { MANIFESTS, Tachie } from "./Tachie";
import { styleDefaults, styleSchema } from "./style";

const characterSchema = z.enum(["zundamon", "metan", "tsumugi"]);
const slotSchema = z.enum(["trioLeft", "center", "trioRight", "laundryLeft", "laundryCenter", "laundryRight", "nookLeft", "nookCenter", "nookRight", "endLeft", "endCenter", "endRight"]);

const castSchema = z.object({
  character: characterSchema,
  /** 立ち位置（style.tachieCenterX のどれを使うか） */
  slot: slotSchema,
  /** 左右反転（相手や物の方を向かせるため） */
  flip: z.boolean(),
  pick: z.record(z.string(), z.string()),
  toggles: z.record(z.string(), z.boolean()),
});

export const styleframeSchema = z.object({
  scene: z.enum(["S1", "S3", "S7", "S7B"]),
  style: styleSchema,
  /** 背景（public/bg のファイル名） */
  background: z.string(),
  cast: z.array(castSchema),
  speaker: characterSchema,
  caption: z.string(),
  /** 画角: wide＝引き、closeUp＝話す人への寄り、insert＝差し込み場面（図が主役） */
  shot: z.enum(["wide", "closeUp", "insert"]),
  /** 背景に描き足す物 */
  prop: z.enum(["none", "dryer"]),
  /** 差し込み場面の図 */
  insert: z.enum(["none", "screenDoor"]),
});

export type StyleframeProps = z.infer<typeof styleframeSchema>;
type Slot = z.infer<typeof slotSchema>;

const living = { style: styleDefaults, background: "living_night_on.jpg", prop: "none" as const, insert: "none" as const };

// 3人がリビングにいるときの並び（S1・S3 で共通）
const livingCast = (zu: Record<string, string>, m: Record<string, string>, t: Record<string, string>) => [
  { character: "zundamon" as const, slot: "trioLeft" as const, flip: true, pick: zu, toggles: {} },
  { character: "metan" as const, slot: "center" as const, flip: false, pick: m, toggles: {} },
  { character: "tsumugi" as const, slot: "trioRight" as const, flip: false, pick: t, toggles: {} },
];

/** シーンごとの既定値（Root で scene ごとに渡す） */
const baseScenes: Record<"S1" | "S3" | "S7", StyleframeProps> = {
  // S1: 網戸に穴。あわてるずんだもんに寄る
  S1: {
    ...living,
    scene: "S1",
    shot: "closeUp",
    cast: livingCast(
      { 眉: "困り眉", 目: "><", 口: "うわー", 右腕: "手を挙げる", 左腕: "手を挙げる" },
      { 眉: "こまり", 口: "む", 右腕: "普通", 左腕: "普通" },
      { まゆ: "困り眉", 口: "お", 右腕: "基本", 左腕: "基本" },
    ),
    speaker: "zundamon",
    caption: "今すぐ業者を呼ぶのだ！",
  },
  // S3: めたんが網戸の張り替えを説明する。図が主役で、めたんは右下に小さく
  S3: {
    ...living,
    scene: "S3",
    shot: "insert",
    insert: "screenDoor",
    cast: livingCast(
      { 眉: "基本眉", 目: "基本目", 口: "ほあ", 右腕: "基本", 左腕: "基本" },
      { 眉: "ごきげん", 口: "ほほえみ", 右腕: "指差す", 左腕: "普通" },
      { まゆ: "普通眉", 口: "ほほえみ", 右腕: "基本", 左腕: "基本" },
    ),
    speaker: "metan",
    caption: "ゴムで溝に押し込むだけよ",
  },
  // S7: 乾燥機をつなぎ終えて、ずんだもんがおどろく（S0 で先出しする一瞬）
  S7: {
    style: styleDefaults,
    background: "hallway_on.jpg",
    scene: "S7",
    shot: "wide",
    prop: "dryer",
    insert: "none",
    cast: [
      { character: "metan", slot: "laundryLeft", flip: true, pick: { 眉: "ごきげん", 口: "ほほえみ", 右腕: "普通", 左腕: "普通" }, toggles: {} },
      { character: "tsumugi", slot: "laundryCenter", flip: true, pick: { まゆ: "普通眉", 口: "む", 右腕: "基本", 左腕: "基本" }, toggles: {} },
      {
        character: "zundamon",
        slot: "laundryRight",
        flip: true,
        pick: { 眉: "上がり眉", 目: "〇〇", 口: "ほあー", 右腕: "横", 左腕: "横" },
        toggles: {},
      },
    ],
    speaker: "zundamon",
    caption: "えっ……これだけ、なのだ！？",
  },
};

// S7 案B: ユーザーの写真を ChatGPT で絵に寄せた洗濯機置き場（貼り紙・メモ・洗剤の箱も ChatGPT で消した）。入れ替え前・外した後・新品の3枚があり、ここでは新品の版
export const styleframeScenes: Record<StyleframeProps["scene"], StyleframeProps> = {
  ...baseScenes,
  S7B: {
  ...baseScenes.S7,
  scene: "S7B",
  background: "laundry_new.png",
  prop: "none",
  cast: [
    { character: "metan", slot: "nookLeft", flip: true, pick: { 眉: "ごきげん", 口: "ほほえみ", 右腕: "普通", 左腕: "普通" }, toggles: {} },
    {
      character: "zundamon",
      slot: "nookCenter",
      flip: false,
      pick: { 眉: "上がり眉", 目: "〇〇", 口: "ほあー", 右腕: "横", 左腕: "横" },
      toggles: {},
    },
    { character: "tsumugi", slot: "nookRight", flip: false, pick: { まゆ: "普通眉", 口: "む", 右腕: "基本", 左腕: "基本" }, toggles: {} },
  ],
  },
};

export const styleframeDefaults = styleframeScenes.S1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const Styleframe: React.FC<StyleframeProps> = (props) => {
  const { style, background, cast, speaker, caption, shot, prop, insert } = props;
  const { width, height } = useVideoConfig();
  const centerX = (slot: Slot) => width * style.tachieCenterX[slot];
  const speakerCast = cast.find((c) => c.character === speaker);
  const speakerX = speakerCast ? style.tachieCenterX[speakerCast.slot] : 0.5;
  const captionSide = speakerX < 0.34 ? "left" : speakerX > 0.66 ? "right" : "center";

  // 寄り：話す人の顔が画面の真ん中より少し上に来るように拡大する。背景の外が見えないよう、ずらす量を画面内に収める
  let stageTransform: string | undefined;
  if (shot === "closeUp" && speakerCast) {
    const s = style.camera.closeUpScale;
    const fx = centerX(speakerCast.slot);
    const fy = style.tachieTop[speaker] + style.camera.faceOffsetY;
    const tx = clamp(width / 2 - fx * s, width - width * s, 0);
    const ty = clamp(height * 0.42 - fy * s, height - height * s, 0);
    stageTransform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  const stage = (
    <AbsoluteFill style={{ transform: stageTransform, transformOrigin: "0 0" }}>
      <Img src={staticFile(`bg/${background}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {prop === "dryer" ? <DryerOnRack /> : null}
      {shot !== "insert"
        ? cast.map((c) => (
            <Tachie
              key={c.character}
              character={c.character}
              scale={style.tachieScale[c.character]}
              flip={c.flip}
              pick={c.pick}
              toggles={c.toggles}
              style={{
                left: centerX(c.slot) - (MANIFESTS[c.character].width * style.tachieScale[c.character]) / 2,
                top: style.tachieTop[c.character],
              }}
            />
          ))
        : null}
    </AbsoluteFill>
  );

  // 差し込み場面では、話す人だけを右下に小さく残す
  const cornerScale = style.tachieScale[speaker] * style.insert.cornerScale;
  const corner = shot === "insert" && speakerCast ? (
    <Tachie
      character={speaker}
      scale={cornerScale}
      flip={speakerCast.flip}
      pick={speakerCast.pick}
      toggles={speakerCast.toggles}
      style={{ left: width - MANIFESTS[speaker].width * cornerScale + 40, top: height - 560 }}
    />
  ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.frame }}>
      <AbsoluteFill style={{ inset: style.frame.width, borderRadius: style.frame.radius, overflow: "hidden" }}>
        <AbsoluteFill style={{ filter: shot === "insert" ? `blur(${style.insert.blur}px)` : undefined }}>{stage}</AbsoluteFill>
        {shot === "insert" ? <AbsoluteFill style={{ background: `rgba(0,0,0,${style.insert.dim})` }} /> : null}
        {insert === "screenDoor" ? (
          <div style={{ position: "absolute", left: "50%", top: 36, transform: "translateX(-50%)" }}>
            <ScreenDoorDiagram style={style} />
          </div>
        ) : null}
        {corner}
        <Caption style={style} speaker={speaker} side={shot === "insert" ? "center" : captionSide} text={caption} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
