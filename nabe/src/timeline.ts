/**
 * 台詞の時間軸。Animatic と本実装で共通に使う。本編 tadashii-sharehouse の timeline.ts をもとにした。
 * シーンの長さは台詞の長さ（src/lines.json、tools/synth_voice.py が作る）から組み立てる。
 * 人が調整できるのは、台詞と台詞の間・シーンの切れ目の間・シーンの最低の長さ・特定の台詞の前の間・最後の止め（props）。
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
  /** シーンの最低の長さ（秒）。台詞のないシーン（S1）に使う */
  minSec: z.number().min(0).max(60),
});

export const timingSchema = z.object({
  fps: z.number().int().min(12).max(60),
  /** 同じシーンの中の、台詞と台詞の間（秒） */
  lineGapSec: z.number().min(0).max(3),
  /** シーンの切れ目の間（秒）。次のシーンの頭に入れる */
  sceneGapSec: z.number().min(0).max(5),
  /** 特定の台詞（通し番号、1 始まり）の前に足す間（秒）。日付の札や、取っ手を洗う所作を見せる */
  pauses: z.array(z.object({ beforeLine: z.number().int().min(1), sec: z.number().min(0).max(10) })),
  /** 最後の台詞のあと、大鍋に寄って止めるまでの長さ（秒）。ループで S1 につなぐ */
  endHoldSec: z.number().min(0).max(10),
  scenes: z.array(sceneSchema).min(1),
});
export type Timing = z.infer<typeof timingSchema>;

export const timingDefaults: Timing = {
  fps: 30,
  lineGapSec: hold.beat,
  sceneGapSec: hold.beat,
  pauses: [
    // 「1日目 → 2日目 → 3日目」の札を見せる。1日あたり hold.medium（1.5秒、短いテキストを読ませる hold）。v1 の 1.5秒（3枚 × 0.5秒）は
    // 「早すぎて時の流れを感じにくい」とユーザーの指摘（notes.md）
    { beforeLine: 9, sec: hold.medium * 3 },
    // ずんだもんが取っ手だけ洗う所作
    { beforeLine: 14, sec: hold.short },
  ],
  endHoldSec: hold.medium,
  scenes: script.scenes.map((s) => ({
    id: s.id,
    label: s.label,
    // S1 は台詞なしで大鍋を見せる時間（構成で決めた 2秒）
    minSec: s.id === "S1" ? s.targetSec : 0,
  })),
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
  timing.scenes.forEach((scene, i) => {
    const start = t;
    let cursor = start + (i === 0 ? 0 : toFrames(sceneGapSec, fps));
    LINES.forEach((line, k) => {
      if (line.scene !== scene.id) return;
      if (lines.length > 0 && lines[lines.length - 1].scene === scene.id) cursor += toFrames(lineGapSec, fps);
      const pause = timing.pauses.find((p) => p.beforeLine === k + 1);
      if (pause) cursor += toFrames(pause.sec, fps);
      const frames = toFrames(line.durationSec, fps);
      lines.push({ ...line, index: k + 1, from: cursor, frames });
      cursor += frames;
    });
    if (i === timing.scenes.length - 1) cursor += toFrames(timing.endHoldSec, fps);
    const frames = Math.max(cursor - start, toFrames(scene.minSec, fps));
    scenes.push({ ...scene, from: start, frames });
    t = start + frames;
  });
  return { scenes, lines, total: t };
};
