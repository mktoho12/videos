/**
 * 見た目の調整値（段階2）。色・配置・大きさは props で変えられるように zod スキーマにしておく。
 * プリン裁判（tadashii-sharehouse）の style.ts を複製し、カメラ（寄り）と差し込み場面の値を足した。
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
    /** 画面のまわりの枠、図の線 */
    frame: z.string(),
    /** 図で「動き・注目」を示す色（矢印など） */
    accent: z.string(),
  }),
  /** 立ち絵の倍率（PSD 原寸に対して）。PSD ごとに絵の大きさが違うので、キャラごとに持つ */
  tachieScale: perCharacter(z.number()),
  /** 立ち絵の上端（px）。キャラごとに PSD の余白が違うので別に持つ */
  tachieTop: perCharacter(z.number()),
  /** 立ち絵の横の中心（画面幅に対する割合）。3人並び（左・真ん中・右）、S7 の乾燥機を右に空けた並び（laundry）、S7 案B の洗濯機置き場を真ん中に空けた並び（nook）、終了画面の左半分の並び（end） */
  tachieCenterX: z.object({
    trioLeft: z.number(),
    center: z.number(),
    trioRight: z.number(),
    laundryLeft: z.number(),
    laundryCenter: z.number(),
    laundryRight: z.number(),
    nookLeft: z.number(),
    nookCenter: z.number(),
    nookRight: z.number(),
    /** 終了画面（右半分を空ける）の3人並び */
    endLeft: z.number(),
    endCenter: z.number(),
    endRight: z.number(),
  }),
  /** 終了画面の並びで立ち絵を小さくする倍率（左半分に3人を収める） */
  endScale: z.number(),
  /** 話す人への寄り。倍率と、立ち絵の上端から顔の中心までの高さ（px、画面の座標） */
  camera: z.object({ closeUpScale: z.number(), faceOffsetY: z.number() }),
  /** 差し込み場面：背景を暗く・ぼかす量と、端に小さく残すキャラの倍率 */
  insert: z.object({ dim: z.number(), blur: z.number(), cornerScale: z.number() }),
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
    accent: "#e8532c",
  },
  tachieScale: { zundamon: 0.85, metan: 0.8, tsumugi: 0.8 },
  tachieTop: { zundamon: 60, metan: 150, tsumugi: 150 },
  tachieCenterX: { trioLeft: 0.21, center: 0.5, trioRight: 0.82, laundryLeft: 0.16, laundryCenter: 0.38, laundryRight: 0.6, nookLeft: 0.1, nookCenter: 0.68, nookRight: 0.9, endLeft: 0.1, endCenter: 0.25, endRight: 0.4 },
  endScale: 0.72,
  camera: { closeUpScale: 1.7, faceOffsetY: 330 },
  insert: { dim: 0.45, blur: 8, cornerScale: 0.45 },
  caption: { fontSize: 58, border: 7, radius: 22, paddingX: 40, paddingY: 22, bottom: 150, regionRatio: 0.58, margin: 40 },
  frame: { width: 14, radius: 26 },
  title: { top: 24, fontSize: 80 },
};
