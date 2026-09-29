/**
 * 動きの共通部品（この動画内）。所要時間・イージングは props 経由で受け取り、既定値は motion-kit のトークン。
 */
import { interpolate } from "remotion";
import { z } from "zod";
import { easing } from "motion-kit/src/tokens";

export const easingTokenSchema = z.enum(["standard", "enter", "exit", "emphasized", "linear"]);

/** 1つの動き: シーン開始からの遅れ・所要時間・イージング */
export const tweenSchema = z.object({
  delaySec: z.number().min(0).max(10),
  durSec: z.number().min(0.01).max(10),
  easing: easingTokenSchema,
});

export type Tween = z.infer<typeof tweenSchema>;

/** シーン開始 startSec から始まる tween の進み具合（0〜1） */
export const progress = (frame: number, fps: number, startSec: number, t: Tween, extraDelaySec = 0) => {
  const from = (startSec + t.delaySec + extraDelaySec) * fps;
  const to = from + t.durSec * fps;
  return interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing(t.easing),
  });
};

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
