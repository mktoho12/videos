/**
 * 見た目の調整値（段階2）。色・配置・大きさは props で変えられるように zod スキーマにしておく。
 * 非公開の試作の style.ts を複製し、3人目（つむぎ）と3人並びの配置を足した。
 */
import { z } from "zod";

const perCharacter = <T extends z.ZodTypeAny>(t: T) => z.object({ zundamon: t, metan: t, tsumugi: t });

export const styleSchema = z.object({
  colors: z.object({
    /** 字幕の箱の地 */
    captionFill: z.string(),
    /** 字幕の文字 */
    captionText: z.string(),
    /** 話者ごとの字幕の枠の色 */
    zundamon: z.string(),
    metan: z.string(),
    tsumugi: z.string(),
    /** 画面のまわりの枠 */
    frame: z.string(),
  }),
  /** 立ち絵の倍率（PSD 原寸に対して）。PSD ごとに絵の大きさが違うので、キャラごとに持つ */
  tachieScale: perCharacter(z.number()),
  /** 立ち絵の上端（px）。キャラごとに PSD の余白が違うので別に持つ */
  tachieTop: perCharacter(z.number()),
  /** 立ち絵の横の中心（画面幅に対する割合）。2人のときは left / right、3人のときは left / center / right */
  tachieCenterX: z.object({ left: z.number(), center: z.number(), right: z.number(), trioLeft: z.number(), trioRight: z.number() }),
  /** S7 の冷蔵庫の図があるときの立ち位置と、冷蔵庫の図の横の中心（画面幅に対する割合） */
  fridgeLayout: z.object({ zundamon: z.number(), metan: z.number(), tsumugi: z.number(), fridge: z.number() }),
  /** 3人並びのとき、真ん中のめたんの顔にかからないよう、図の下端をここまでに収める（px、画面上から） */
  trioPanelBottom: z.number(),
  caption: z.object({
    fontSize: z.number(),
    border: z.number(),
    radius: z.number(),
    paddingX: z.number(),
    paddingY: z.number(),
    /** 字幕の箱の下端（px、画面下から） */
    bottom: z.number(),
    /** 字幕を置く範囲の幅（画面幅に対する割合）と、画面の端からの余白（px） */
    regionRatio: z.number(),
    margin: z.number(),
  }),
  frame: z.object({ width: z.number(), radius: z.number() }),
  /** S2 のタイトル（顔にかからないよう、画面の上に置く） */
  title: z.object({ top: z.number(), fontSize: z.number() }),
});

export type Style = z.infer<typeof styleSchema>;

export const styleDefaults: Style = {
  colors: {
    captionFill: "#ffffff",
    captionText: "#1a1a1a",
    zundamon: "#5cbf2a",
    metan: "#e0508f",
    tsumugi: "#e8a91c",
    frame: "#2b2b2b",
  },
  tachieScale: { zundamon: 0.85, metan: 0.8, tsumugi: 0.8 },
  tachieTop: { zundamon: 60, metan: 150, tsumugi: 150 },
  tachieCenterX: { left: 0.26, center: 0.5, right: 0.76, trioLeft: 0.21, trioRight: 0.82 },
  fridgeLayout: { zundamon: 0.13, metan: 0.6, tsumugi: 0.87, fridge: 0.36 },
  trioPanelBottom: 330,
  caption: { fontSize: 58, border: 7, radius: 22, paddingX: 40, paddingY: 22, bottom: 150, regionRatio: 0.58, margin: 40 },
  frame: { width: 14, radius: 26 },
  title: { top: 24, fontSize: 80 },
};
