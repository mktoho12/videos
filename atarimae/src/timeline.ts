/**
 * 台詞の時間軸。Animatic と本実装で共通に使う（プリン裁判の timeline.ts を複製）。
 * シーンの長さは台詞の長さ（src/lines.json、tools/synth_voice.py が作る）から組み立てる。
 * 人が調整できるのは、台詞と台詞の間・シーンの切れ目の間・シーンの最低の長さ（props）。
 */
import { z } from "zod";
import { hold, toFrames } from "motion-kit/src/tokens";
import script from "./lines.json";

export type Speaker = "zundamon" | "metan" | "tsumugi";
export type Line = {
  scene: string;
  speaker: Speaker;
  text: string;
  kana: string;
  file: string;
  durationSec: number;
  /** 口パク: 30fps の1フレームごとに "1"（開ける）か "0"（閉じる） */
  mouth: string;
};
export const LINES = script.lines as Line[];
/** lines.json の口パクを作ったときの fps（tools/synth_voice.py の FPS） */
export const MOUTH_FPS = 30;

const sceneSchema = z.object({
  id: z.string(),
  label: z.string(),
  /** シーンの最低の長さ（秒）。台詞が短いシーン（タイトル）や台詞のないシーン（クレジット）に使う */
  minSec: z.number().min(0).max(60),
});

export const timingSchema = z.object({
  fps: z.number().int().min(12).max(60),
  /** 同じシーンの中の、台詞と台詞の間（秒） */
  lineGapSec: z.number().min(0).max(3),
  /** シーンの切れ目の間（秒）。次のシーンの頭に入れる */
  sceneGapSec: z.number().min(0).max(5),
  scenes: z.array(sceneSchema).min(1),
  /** 最後の台詞のあと、終了画面（登録ボタン・次の動画）を置くために止める秒数。YouTube の終了画面は最後の 5〜20秒 */
  endScreenSec: z.number().min(0).max(20),
  /** 本編と最後のあいさつ（最後の台詞）の間（秒）。頭で「本編おわり」の効果音を鳴らす */
  outroGapSec: z.number().min(0).max(10),
});
export type Timing = z.infer<typeof timingSchema>;

export const timingDefaults: Timing = {
  fps: 30,
  lineGapSec: hold.beat,
  sceneGapSec: hold.short,
  scenes: script.scenes.map((s) => ({
    id: s.id,
    label: s.label,
    // S2 はタイトルを見せる時間（前作で決めた5秒）
    minSec: s.id === "S2" ? 5 : 0,
  })),
  // 終了画面の要素を読んで押すのに足りる長さ（styleframe.md）。トークンにない値
  endScreenSec: 12,
  // 効果音（約1.7秒）が鳴り終わってから、少し置いてあいさつに入る長さ
  outroGapSec: hold.long + hold.short,
};

export type Placed<T> = T & { from: number; frames: number };
export type PlacedScene = Placed<Timing["scenes"][number]>;
export type PlacedLine = Placed<Line> & { index: number };

/** シーンと台詞を時間軸に並べる（フレーム単位）。index は台詞の通し番号（1 始まり） */
export const layout = (timing: Timing) => {
  const { fps, lineGapSec, sceneGapSec } = timing;
  const scenes: PlacedScene[] = [];
  const lines: PlacedLine[] = [];
  let t = 0;
  /** 本編が終わって、最後のあいさつまでの間が始まるフレーム */
  let outroFrom = 0;
  timing.scenes.forEach((scene, i) => {
    const start = t;
    let cursor = start + (i === 0 ? 0 : toFrames(sceneGapSec, fps));
    LINES.forEach((line, k) => {
      if (line.scene !== scene.id) return;
      if (lines.length > 0 && lines[lines.length - 1].scene === scene.id) cursor += toFrames(lineGapSec, fps);
      if (k === LINES.length - 1) {
        outroFrom = cursor;
        cursor += toFrames(timing.outroGapSec, fps);
      }
      const frames = toFrames(line.durationSec, fps);
      lines.push({ ...line, index: k + 1, from: cursor, frames });
      cursor += frames;
    });
    const isLast = i === timing.scenes.length - 1;
    const frames = Math.max(cursor - start + (isLast ? toFrames(timing.endScreenSec, fps) : 0), toFrames(scene.minSec, fps));
    scenes.push({ ...scene, from: start, frames });
    t = start + frames;
  });
  return { scenes, lines, total: t, outroFrom };
};
