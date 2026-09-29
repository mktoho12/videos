/**
 * 段階3「アニマティック」の雛形。
 * 四角とテキストだけでシーン表のタイミングを確認する。見た目の作り込みはしない。
 *
 * 使い方（videos 側）:
 *   1. このファイルを動画のディレクトリへ複製する
 *   2. 段階1で選ばれたシーン表を animaticDefaults.scenes に写す
 *   3. Studio で再生し、人間がタイミングを評価する（props 編集で秒数をいじれる）
 */
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { toFrames } from "motion-kit/src/tokens";

export const aspectSizes = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
} as const;

const sceneSchema = z.object({
  /** シーン表の番号や短い名前 */
  id: z.string(),
  /** 画面に出す主テキスト（仮） */
  text: z.string(),
  /** シーンの長さ（秒） */
  durationSec: z.number().min(0.1).max(60),
});

export const animaticSchema = z.object({
  aspect: z.enum(["16:9", "9:16", "1:1", "4:5"]),
  fps: z.number().int().min(12).max(60),
  /** シーン名・経過時間などの補助表示を出すか */
  showHud: z.boolean(),
  scenes: z.array(sceneSchema).min(1),
});

export type AnimaticProps = z.infer<typeof animaticSchema>;

export const animaticDefaults: AnimaticProps = {
  aspect: "16:9",
  fps: 30,
  showHud: true,
  // 構成案B（structure.md）。［］は絵の説明、それ以外は画面に出す文字
  scenes: [
    { id: "S1", text: "［ポットが現れる］", durationSec: 1.5 },
    { id: "S2", text: "［熱の波が寄ってきて、ポットで止まる］", durationSec: 2.5 },
    { id: "S3", text: "ポットが、外の熱をさえぎっている", durationSec: 4.0 },
    { id: "S4", text: "ここに、冷たい麦茶がある", durationSec: 6.0 },
    { id: "S5", text: "［背景だけに戻る］", durationSec: 1.0 },
  ],
};

export const calculateAnimaticMetadata: CalculateMetadataFunction<AnimaticProps> = ({
  props,
}) => {
  const total = props.scenes.reduce((sum, s) => sum + toFrames(s.durationSec, props.fps), 0);
  return {
    fps: props.fps,
    durationInFrames: Math.max(1, total),
    ...aspectSizes[props.aspect],
  };
};

const SceneCard: React.FC<{ id: string; text: string; index: number }> = ({
  id,
  text,
  index,
}) => {
  const { width, height } = useVideoConfig();
  const unit = Math.min(width, height);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: unit * 0.6,
          height: unit * 0.35,
          border: `${unit * 0.004}px solid #888`,
          backgroundColor: index % 2 === 0 ? "#222" : "#2a2a2a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: unit * 0.02,
        }}
      >
        <div style={{ fontSize: unit * 0.03, opacity: 0.5 }}>{id}</div>
        <div style={{ fontSize: unit * 0.06 }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const unit = Math.min(width, height);
  return (
    <div
      style={{
        position: "absolute",
        left: unit * 0.03,
        bottom: unit * 0.03,
        fontSize: unit * 0.025,
        fontFamily: "monospace",
        opacity: 0.6,
      }}
    >
      {label} {(frame / fps).toFixed(2)}s / f{frame}
    </div>
  );
};

export const Animatic: React.FC<AnimaticProps> = ({ fps, showHud, scenes }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#111", color: "#eee", fontFamily: "sans-serif" }}>
      {scenes.map((scene, i) => {
        const len = toFrames(scene.durationSec, fps);
        const seq = (
          <Sequence key={`${scene.id}-${i}`} from={from} durationInFrames={len} name={scene.id}>
            <SceneCard id={scene.id} text={scene.text} index={i} />
          </Sequence>
        );
        from += len;
        return seq;
      })}
      {showHud ? <GlobalHud scenes={scenes} fps={fps} /> : null}
    </AbsoluteFill>
  );
};

/** 全体時間軸で HUD を出す（どのシーンにいるかを表示） */
const GlobalHud: React.FC<{ scenes: AnimaticProps["scenes"]; fps: number }> = ({
  scenes,
  fps,
}) => {
  const frame = useCurrentFrame();
  let acc = 0;
  let current = scenes[scenes.length - 1].id;
  for (const s of scenes) {
    acc += toFrames(s.durationSec, fps);
    if (frame < acc) {
      current = s.id;
      break;
    }
  }
  return <Hud label={current} />;
};
