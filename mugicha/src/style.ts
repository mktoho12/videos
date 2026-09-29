/**
 * 麦茶の動画の見た目（段階2 スタイルフレームの案）。
 * 色・文字の大きさはすべてここの zod スキーマ経由で props にする。
 */
import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const styleSchema = z.object({
  colors: z.object({
    /** 背景。リビングの壁に馴染む、温かみのある生成り */
    background: zColor(),
    /** 文字 */
    text: zColor(),
    /** 補足文など、主メッセージより一段弱い文字 */
    textSub: zColor(),
    /** 麦茶 */
    tea: zColor(),
    /** 麦茶の液面（明るい側） */
    teaSurface: zColor(),
    /** ポットの胴（ステンレス） */
    potBody: zColor(),
    /** ポットの肩・ふた・取っ手（黒い樹脂） */
    potDark: zColor(),
    /** グラスの縁 */
    glassEdge: zColor(),
    /** 外の熱 */
    heat: zColor(),
  }),
  type: z.object({
    /** 主メッセージの文字サイズ（px） */
    messageSize: z.number().min(24).max(240),
    /** 補足文の文字サイズ（px） */
    captionSize: z.number().min(16).max(160),
    /** 字間（em） */
    letterSpacing: z.number().min(-0.1).max(0.5),
  }),
});

export type Style = z.infer<typeof styleSchema>;

export const styleDefaults: Style = {
  colors: {
    background: "#F3EEE4",
    text: "#3A332C",
    textSub: "#6E645A",
    tea: "#B06E2A",
    teaSurface: "#D59C55",
    potBody: "#B4BBC2",
    potDark: "#2A2D31",
    glassEdge: "#A9BAC6",
    heat: "#E07A5F",
  },
  type: {
    messageSize: 96,
    captionSize: 60,
    letterSpacing: 0.06,
  },
};
