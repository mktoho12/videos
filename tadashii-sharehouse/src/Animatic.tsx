/**
 * 段階3「アニマティック」。motion-kit の雛形（templates/composition/Animatic.tsx）を、台詞のある動画向けに変えたもの。
 * 四角とテキストだけで、台詞の音声を乗せてタイミングを確認する。見た目の作り込みはしない。
 *
 * 雛形との違い: シーンの長さを秒で直接持たず、台詞の長さから組み立てる（src/timeline.ts）。
 */
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Html5Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { layout, Line, PlacedLine, PlacedScene, timingDefaults, timingSchema } from "./timeline";

export const animaticSchema = timingSchema.extend({
  showHud: z.boolean(),
});

export type AnimaticProps = z.infer<typeof animaticSchema>;

export const animaticDefaults: AnimaticProps = {
  ...timingDefaults,
  showHud: true,
};

export const calculateAnimaticMetadata: CalculateMetadataFunction<AnimaticProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, layout(props).total),
  width: 1920,
  height: 1080,
});

/** 立ち絵の代わりの四角。話している人を明るくする。x は四角の中心（画面幅に対する割合） */
const Figure: React.FC<{ name: string; x: number; speaking: boolean }> = ({ name, x, speaking }) => (
  <div
    style={{
      position: "absolute",
      left: `calc(${x * 100}% - 180px)`,
      top: 260,
      width: 360,
      height: 820,
      border: "6px solid #888",
      backgroundColor: speaking ? "#555" : "#262626",
      display: "flex",
      justifyContent: "center",
      paddingTop: 60,
      fontSize: 48,
      color: speaking ? "#fff" : "#888",
    }}
  >
    {name}
  </div>
);

const LineCard: React.FC<{ line: Line }> = ({ line }) => (
  <div
    style={{
      position: "absolute",
      left: 120,
      right: 120,
      bottom: 110,
      padding: "24px 40px",
      border: "6px solid #ccc",
      backgroundColor: "#111",
      fontSize: 52,
      lineHeight: 1.35,
      textAlign: line.speaker === "zundamon" ? "left" : line.speaker === "tsumugi" ? "right" : "center",
    }}
  >
    {line.text}
  </div>
);

/** 全体の時刻と、いまのシーン・シーン内の時刻（人がタイミングを指摘するときの目安） */
const Hud: React.FC<{ scenes: PlacedScene[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = scenes.find((s) => frame >= s.from && frame < s.from + s.frames) ?? scenes[scenes.length - 1];
  return (
    <div style={{ position: "absolute", left: 40, top: 30, fontSize: 34, fontFamily: "monospace", opacity: 0.7 }}>
      全体 {(frame / fps).toFixed(2)}s　{scene.id} +{((frame - scene.from) / fps).toFixed(2)}s　f{frame}
    </div>
  );
};

export const Animatic: React.FC<AnimaticProps> = (props) => {
  const { scenes, lines } = layout(props);
  return (
    <AbsoluteFill style={{ backgroundColor: "#111", color: "#eee", fontFamily: "sans-serif" }}>
      {scenes.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.frames} name={`${scene.id} ${scene.label}`}>
          <AbsoluteFill>
            <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", fontSize: 56, opacity: 0.6 }}>
              {scene.id} {scene.label}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
      {/* 台詞が流れていない間も四角は出しておく（S9 クレジットを除く） */}
      {scenes
        .filter((s) => s.id !== "S9")
        .map((scene) => (
          <Sequence key={`fig-${scene.id}`} from={scene.from} durationInFrames={scene.frames} layout="none">
            <SpeakerFigures lines={lines} sceneFrom={scene.from} trio={!TWO_SHOT_SCENES.includes(scene.id)} />
          </Sequence>
        ))}
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} name={line.text.slice(0, 12)}>
          <LineCard line={line} />
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      {props.showHud ? <Hud scenes={scenes} /> : null}
    </AbsoluteFill>
  );
};

/** めたんが入ってくる前（S1〜S3）は、ずんだもんとつむぎの2人だけ */
const TWO_SHOT_SCENES = ["S1", "S2", "S3"];

/** いま話している人を、全体の時間軸から判定して四角を明るくする。立ち位置はスタイルフレームと同じ */
const SpeakerFigures: React.FC<{ lines: PlacedLine[]; sceneFrom: number; trio: boolean }> = ({ lines, sceneFrom, trio }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const now = lines.find((l) => frame >= l.from && frame < l.from + l.frames);
  return (
    <>
      <Figure name="ずんだもん" x={trio ? 0.21 : 0.26} speaking={now?.speaker === "zundamon"} />
      {trio ? <Figure name="めたん" x={0.5} speaking={now?.speaker === "metan"} /> : null}
      <Figure name="つむぎ" x={trio ? 0.82 : 0.76} speaking={now?.speaker === "tsumugi"} />
    </>
  );
};
