/**
 * 見た目の調整値（段階2）。色・配置・大きさは props で変えられるように zod スキーマにしておく。
 * 前のショート nabe の縦長の配置（上にタイトル、真ん中に図、下半分に3人、字幕は3人の胸のあたり）に、本編 omoikomi の寄りの画角を足した。
 * ショートの画面は、下の約 400px（タイトル・チャンネル名・関連動画のリンク）と右の約 140px（ボタン）に YouTube の表示が重なる。
 */
import { z } from "zod";

const perCharacter = <T extends z.ZodTypeAny>(t: T) => z.object({ zundamon: t, metan: t, tsumugi: t });

export const styleSchema = z.object({
  colors: z.object({
    captionFill: z.string(),
    captionText: z.string(),
    zundamon: z.string(),
    metan: z.string(),
    tsumugi: z.string(),
    /** 画面のまわりの枠、図の線 */
    frame: z.string(),
    /** 図で「動き・注目」を示す色（矢印など） */
    accent: z.string(),
  }),
  /** 立ち絵の倍率（PSD 原寸に対して） */
  tachieScale: perCharacter(z.number()),
  /** 立ち絵の上端（px） */
  tachieTop: perCharacter(z.number()),
  /** 立ち絵の横の中心（画面幅に対する割合） */
  tachieCenterX: perCharacter(z.number()),
  /** 立ち絵の顔の中心の高さ（PSD 原寸の px、絵の上端から） */
  faceY: perCharacter(z.number()),
  /** 話す人への寄り。倍率と、寄ったときに顔を置く画面の位置（px） */
  camera: z.object({ closeUpScale: z.number(), faceToX: z.number(), faceToY: z.number() }),
  /** 真ん中の図（本編の図は幅 1240px で描いてあるので縮めて置く）。上端（px）と倍率 */
  board: z.object({ top: z.number(), scale: z.number() }),
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
  /** 画面のまわりの枠 */
  frame: z.object({ width: z.number(), radius: z.number() }),
  /** 上のタイトル帯 */
  title: z.object({ top: z.number(), fontSize: z.number() }),
  /** 下の関連動画のリンクを指す札の上端（px）。本編の札のすぐ下。画面の下 約400px は YouTube の表示（関連動画のリンク・タイトル）と重なるので避ける */
  hint: z.object({ top: z.number() }),
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
  // 立ち絵の大きさと並びは前のショート nabe と同じ
  tachieScale: { zundamon: 0.72, metan: 0.62, tsumugi: 0.66 },
  tachieTop: { zundamon: 930, metan: 900, tsumugi: 960 },
  tachieCenterX: { zundamon: 0.2, metan: 0.5, tsumugi: 0.8 },
  faceY: { zundamon: 390, metan: 410, tsumugi: 410 },
  camera: { closeUpScale: 1.6, faceToX: 540, faceToY: 820 },
  board: { top: 300, scale: 0.8 },
  caption: { fontSize: 60, border: 7, radius: 22, paddingX: 36, paddingY: 20, bottom: 470, regionRatio: 0.86, margin: 40 },
  frame: { width: 14, radius: 26 },
  title: { top: 120, fontSize: 70 },
  hint: { top: 950 },
};
