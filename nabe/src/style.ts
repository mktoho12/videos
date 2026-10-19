/**
 * 見た目の調整値（段階2）。色・配置・大きさは props で変えられるように zod スキーマにしておく。
 * 本編 tadashii-sharehouse の style.ts をもとに、縦長（1080x1920、ショート）の配置に作り直した。
 * 縦の割り振り: 上にタイトル、その下に流し（大鍋）、下半分に3人。字幕は3人の胸のあたり。
 * ショートの画面は、下の約 400px（タイトル・チャンネル名）と右の約 140px（ボタン）に YouTube の表示が重なる。
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
    frame: z.string(),
  }),
  /** 立ち絵の倍率（PSD 原寸に対して） */
  tachieScale: perCharacter(z.number()),
  /** 立ち絵の上端（px） */
  tachieTop: perCharacter(z.number()),
  /** 立ち絵の横の中心（画面幅に対する割合） */
  tachieCenterX: perCharacter(z.number()),
  /** 流しの図の上端（px）と幅（px） */
  sink: z.object({ top: z.number(), width: z.number() }),
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
  /** 「1日目」などの日付の札（流しの図の上に重ねる） */
  day: z.object({ top: z.number(), fontSize: z.number() }),
  /** 「1.1倍」のテロップ（流しの図の上に重ねる） */
  multiplier: z.object({ top: z.number(), fontSize: z.number() }),
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
  tachieScale: { zundamon: 0.72, metan: 0.62, tsumugi: 0.66 },
  tachieTop: { zundamon: 930, metan: 900, tsumugi: 960 },
  tachieCenterX: { zundamon: 0.2, metan: 0.5, tsumugi: 0.8 },
  sink: { top: 300, width: 960 },
  caption: { fontSize: 60, border: 7, radius: 22, paddingX: 36, paddingY: 20, bottom: 470, regionRatio: 0.86, margin: 40 },
  frame: { width: 14, radius: 26 },
  title: { top: 120, fontSize: 70 },
  day: { top: 250, fontSize: 96 },
  multiplier: { top: 470, fontSize: 200 },
};
