/**
 * 段階2 スタイルフレーム。構成案A の代表シーンを、画角の違う3枚の静止画として組む。
 * - S1: 話す人への寄り（玄関。ずんだもん「最近、みんな厳しいのだ！」）
 * - S3: 差し込み場面（前の玄関と今の玄関を並べた図。背景をぼかし、説明するめたんを右下に小さく残す）
 * - S7: 3人の引き（ずんだもんの部屋。床に靴下が1つ）
 * 動きはまだ入れない（段階3 アニマティック・段階4 本実装で扱う）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { Caption } from "./Caption";
import { EntranceBeforeAfter, SockOnFloor } from "./Panels";
import { MANIFESTS, Tachie } from "./Tachie";
import { styleDefaults, styleSchema } from "./style";

const characterSchema = z.enum(["zundamon", "metan", "tsumugi"]);
const slotSchema = z.enum(["trioLeft", "center", "trioRight", "roomLeft", "roomCenter", "roomRight", "endLeft", "endCenter", "endRight"]);

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
  scene: z.enum(["S1", "S3", "S7"]),
  style: styleSchema,
  /** 背景（public/bg のファイル名） */
  background: z.string(),
  cast: z.array(castSchema),
  speaker: characterSchema,
  caption: z.string(),
  /** 画角: wide＝引き、closeUp＝話す人への寄り、insert＝差し込み場面（図が主役） */
  shot: z.enum(["wide", "closeUp", "insert"]),
  /** 背景に描き足す物。sock の位置は画面の座標（px） */
  prop: z.enum(["none", "sock"]),
  propX: z.number(),
  propY: z.number(),
  /** 差し込み場面の図 */
  insert: z.enum(["none", "entrance"]),
});

export type StyleframeProps = z.infer<typeof styleframeSchema>;
type Slot = z.infer<typeof slotSchema>;

const entrance = { style: styleDefaults, background: "house_hallway_3.jpg", prop: "none" as const, propX: 0, propY: 0, insert: "none" as const };

// 3人が玄関にいるときの並び（S1・S3 で共通）。ずんだもんは帰ってきたところで土間の側（左）
const entranceCast = (zu: Record<string, string>, m: Record<string, string>, t: Record<string, string>) => [
  { character: "zundamon" as const, slot: "trioLeft" as const, flip: true, pick: zu, toggles: {} },
  { character: "metan" as const, slot: "center" as const, flip: false, pick: m, toggles: {} },
  { character: "tsumugi" as const, slot: "trioRight" as const, flip: false, pick: t, toggles: {} },
];

/** シーンごとの既定値（Root で scene ごとに渡す） */
export const styleframeScenes: Record<StyleframeProps["scene"], StyleframeProps> = {
  // S1: 靴をしまってと言われて、ずんだもんが叫ぶ
  S1: {
    ...entrance,
    scene: "S1",
    shot: "closeUp",
    cast: entranceCast(
      { 眉: "怒り眉", 目: "><", 口: "うわー", 右腕: "手を挙げる", 左腕: "手を挙げる" },
      { 眉: "こまり", 口: "む", 右腕: "普通", 左腕: "普通" },
      { まゆ: "困り眉", 口: "お", 右腕: "基本", 左腕: "基本" },
    ),
    speaker: "zundamon",
    caption: "最近、みんな厳しいのだ！",
  },
  // S3: めたんが前の玄関と今の玄関を並べて見せる。図が主役で、めたんは右下に小さく
  S3: {
    ...entrance,
    scene: "S3",
    shot: "insert",
    insert: "entrance",
    cast: entranceCast(
      { 眉: "基本眉", 目: "基本目", 口: "ほあ", 右腕: "基本", 左腕: "基本" },
      { 眉: "ごきげん", 口: "ほほえみ", 右腕: "指差す", 左腕: "普通" },
      { まゆ: "普通眉", 口: "ほほえみ", 右腕: "基本", 左腕: "基本" },
    ),
    speaker: "metan",
    caption: "しまえる場所があるから、「しまって」って言えるようになったのよ",
  },
  // S7: 片付けた部屋の床に靴下が1つ。ずんだもんが犯人を探す（自分の靴下だとはまだ気づいていない）
  S7: {
    style: styleDefaults,
    background: "single_room3_3.jpg",
    scene: "S7",
    shot: "wide",
    prop: "sock",
    propX: 990,
    propY: 1022,
    insert: "none",
    cast: [
      { character: "zundamon", slot: "roomLeft", flip: true, pick: { 眉: "怒り眉", 目: "基本目", 口: "うわー", 右腕: "指差し横", 左腕: "腰" }, toggles: {} },
      { character: "tsumugi", slot: "roomCenter", flip: false, pick: { まゆ: "困り眉", 口: "む", 右腕: "基本", 左腕: "基本" }, toggles: {} },
      { character: "metan", slot: "roomRight", flip: false, pick: { 眉: "こまり", 口: "ほほえみ", 右腕: "普通", 左腕: "普通" }, toggles: {} },
    ],
    speaker: "zundamon",
    caption: "だれなのだ！ボクの部屋に、靴下を置いていったのは！",
  },
};

export const styleframeDefaults = styleframeScenes.S1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const Styleframe: React.FC<StyleframeProps> = (props) => {
  const { style, background, cast, speaker, caption, shot, prop, propX, propY, insert } = props;
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
      {prop === "sock" ? <SockOnFloor x={propX} y={propY} scale={1.2} /> : null}
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
        {insert === "entrance" ? (
          <div style={{ position: "absolute", left: "50%", top: 36, transform: "translateX(-50%)" }}>
            <EntranceBeforeAfter style={style} />
          </div>
        ) : null}
        {corner}
        <Caption style={style} speaker={speaker} side={shot === "insert" ? "center" : captionSide} text={caption} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
