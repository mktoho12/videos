/**
 * 段階2 スタイルフレーム。構成案A の代表シーンを、画角の違う3枚の静止画として組む。
 * - S1: 引き（夜のリビング。ヘッドセットで叫ぶずんだもんと、入り口で固まるつむぎ。場所の文字と名札を出す）
 * - S3: 差し込み場面（聞こえ方の図。背景をぼかし、説明するめたんを右下に小さく残す）
 * - S4: 話す人への寄り（ずんだもん「リビングをまるごと使ってたのだ？」）
 * 動きはまだ入れない（段階3 アニマティック・段階4 本実装で扱う）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { Caption, captionLines, captionPages, StackCaption } from "./Caption";
import { Headset, HearingDiagram, NameTag, PlaceLabel } from "./Panels";
import { Character, MANIFESTS, Tachie } from "./Tachie";
import { styleDefaults, styleSchema } from "./style";

const characterSchema = z.enum(["zundamon", "metan", "tsumugi"]);
const slotSchema = z.enum(["trioLeft", "center", "trioRight", "endLeft", "endCenter", "endRight"]);

const castSchema = z.object({
  character: characterSchema,
  /** 立ち位置（style.tachieCenterX のどれを使うか） */
  slot: slotSchema,
  /** 左右反転（相手や物の方を向かせるため） */
  flip: z.boolean(),
  pick: z.record(z.string(), z.string()),
  toggles: z.record(z.string(), z.boolean()),
  /** ヘッドセットをかぶせる */
  headset: z.boolean(),
  /** 名札を出す（それぞれ初めて出てきたとき） */
  nameTag: z.boolean(),
});

export const styleframeSchema = z.object({
  scene: z.enum(["S1", "S3", "S4"]),
  style: styleSchema,
  /** 背景（public/bg のファイル名） */
  background: z.string(),
  cast: z.array(castSchema),
  speaker: characterSchema,
  caption: z.string(),
  /** 長い台詞を分けたときに、何枚目を出すか（0 から） */
  captionPage: z.number(),
  /** 画角: wide＝引き、closeUp＝話す人への寄り、insert＝差し込み場面（図が主役） */
  shot: z.enum(["wide", "closeUp", "insert"]),
  /** 場所の文字を出す */
  placeLabel: z.boolean(),
  /** 差し込み場面の図 */
  insert: z.enum(["none", "hearing"]),
});

export type StyleframeProps = z.infer<typeof styleframeSchema>;
type Slot = z.infer<typeof slotSchema>;

const living = { style: styleDefaults, background: "living_night_on.jpg", placeLabel: false, insert: "none" as const, captionPage: 0 };
const member = (character: Character, slot: Slot, flip: boolean, pick: Record<string, string>, extra: { headset?: boolean; nameTag?: boolean } = {}) => ({
  character,
  slot,
  flip,
  pick,
  toggles: {},
  headset: extra.headset ?? false,
  nameTag: extra.nameTag ?? false,
});

/** シーンごとの既定値（Root で scene ごとに渡す） */
export const styleframeScenes: Record<StyleframeProps["scene"], StyleframeProps> = {
  // S1: ソファーでヘッドセットのずんだもんが叫んでいる。つむぎが入ってきて固まる。最初の場面なので場所の文字と名札を出す
  S1: {
    ...living,
    scene: "S1",
    shot: "wide",
    placeLabel: true,
    cast: [
      member("zundamon", "trioLeft", true, { 眉: "上がり眉", 目: "><", 口: "うわー", 右腕: "手を挙げる", 左腕: "基本" }, { headset: true, nameTag: true }),
      member("tsumugi", "trioRight", false, { まゆ: "困り眉", 目: "〇〇", 口: "お", 右腕: "基本", 左腕: "基本" }, { nameTag: true }),
    ],
    speaker: "tsumugi",
    caption: "……先輩、ひとりでなにを騒いでるんですか？",
  },
  // S3: めたんが聞こえ方の図を見せる。図が主役で、めたんは右下に小さく
  S3: {
    ...living,
    scene: "S3",
    shot: "insert",
    insert: "hearing",
    cast: [
      member("zundamon", "trioLeft", true, { 眉: "基本眉", 目: "基本目", 口: "ほあ", 右腕: "基本", 左腕: "基本" }),
      member("metan", "center", false, { 眉: "ごきげん", 口: "ほほえみ", 右腕: "指差す", 左腕: "普通" }),
      member("tsumugi", "trioRight", false, { まゆ: "普通眉", 口: "ほほえみ", 右腕: "基本", 左腕: "基本" }),
    ],
    speaker: "metan",
    caption: "でも、つむぎさんに聞こえていたのは、ずんだもんの声だけなのよ",
  },
  // S4: めたんの問いかけで、ずんだもんが自分で気づく一言に寄る
  S4: {
    ...living,
    scene: "S4",
    shot: "closeUp",
    cast: [
      member("zundamon", "trioLeft", true, { 眉: "困り眉", 目: "〇〇", 口: "ほあー", 右腕: "基本", 左腕: "口元" }),
      member("metan", "center", false, { 眉: "ごきげん", 口: "ほほえみ", 右腕: "普通", 左腕: "普通" }),
      member("tsumugi", "trioRight", false, { まゆ: "普通眉", 口: "む", 右腕: "基本", 左腕: "基本" }),
    ],
    speaker: "zundamon",
    caption: "ボクは、ソファーの半分しか使ってなかったのに、リビングをまるごと使ってたのだ？",
  },
};

export const styleframeDefaults = styleframeScenes.S1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const NAMES: Record<Character, string> = { zundamon: "ずんだもん", metan: "四国めたん", tsumugi: "春日部つむぎ" };
const ROLES: Record<Character, string> = { zundamon: "住人", metan: "管理人", tsumugi: "住人・後輩" };

export const Styleframe: React.FC<StyleframeProps> = (props) => {
  const { style, background, cast, speaker, caption, captionPage, shot, placeLabel, insert } = props;
  const pages = captionPages(caption, style.caption.maxChars);
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
      {shot !== "insert"
        ? cast.map((c) => (
            <React.Fragment key={c.character}>
              <Tachie
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
              {c.headset ? (
                <Headset
                  x={centerX(c.slot) + style.headset.offsetX * (c.flip ? -1 : 1)}
                  y={style.tachieTop[c.character] + style.headset.offsetY}
                  width={style.headset.width}
                  height={style.headset.height}
                  flip={c.flip}
                />
              ) : null}
            </React.Fragment>
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
        {insert === "hearing" ? (
          <div style={{ position: "absolute", left: "45%", top: 30, transform: `translateX(-50%) scale(${style.insert.diagramScale})`, transformOrigin: "50% 0" }}>
            <HearingDiagram style={style} />
          </div>
        ) : null}
        {shot === "wide"
          ? cast
              .filter((c) => c.nameTag)
              .map((c) => (
                <NameTag
                  key={c.character}
                  style={style}
                  name={NAMES[c.character]}
                  role={ROLES[c.character]}
                  color={style.colors[c.character]}
                  x={centerX(c.slot) + style.nameTag.offsetX * (style.tachieCenterX[c.slot] < 0.5 ? 1 : -1)}
                  y={style.nameTag.y}
                />
              ))
          : null}
        {placeLabel ? <PlaceLabel style={style} place="シェアハウス" detail="夜のリビング" /> : null}
        {corner}
        {style.caption.mode === "stack" ? (
          <StackCaption style={style} speaker={speaker} side={shot === "insert" ? "center" : captionSide} lines={captionLines(caption, style.caption.maxLineChars)} visible={99} insert={shot === "insert"} />
        ) : (
          <Caption style={style} speaker={speaker} side={shot === "insert" ? "center" : captionSide} text={pages[Math.min(captionPage, pages.length - 1)]} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
