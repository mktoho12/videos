/**
 * 段階3「アニマティック」。本編 tadashii-sharehouse の Animatic.tsx を縦長（1080x1920）に組み直したもの。
 * 四角とテキストだけで、台詞の音声を乗せてタイミングを確認する。見た目の作り込みはしない。
 * シーンの長さは台詞の長さから組み立てる（src/timeline.ts）。
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
import { toFrames } from "motion-kit/src/tokens";
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
  width: 1080,
  height: 1920,
});

const Box: React.FC<{ label: string; style: React.CSSProperties; lit?: boolean }> = ({ label, style, lit = false }) => (
  <div
    style={{
      position: "absolute",
      border: "6px solid #888",
      backgroundColor: lit ? "#555" : "#262626",
      color: lit ? "#fff" : "#999",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 44,
      textAlign: "center",
      whiteSpace: "pre",
      ...style,
    }}
  >
    {label}
  </div>
);

const LineCard: React.FC<{ line: Line }> = ({ line }) => (
  <div
    style={{
      position: "absolute",
      left: 80,
      right: 80,
      bottom: 470,
      padding: "20px 32px",
      border: "6px solid #ccc",
      backgroundColor: "#111",
      fontSize: 52,
      lineHeight: 1.35,
      textAlign: "center",
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
    <div style={{ position: "absolute", left: 30, top: 30, fontSize: 32, fontFamily: "monospace", opacity: 0.7 }}>
      全体 {(frame / fps).toFixed(2)}s　{scene.id} +{((frame - scene.from) / fps).toFixed(2)}s　f{frame}
    </div>
  );
};

/** 画面の中身。S1 と最後の止めは「大鍋の寄り」（ループのつなぎ）、それ以外は流し＋3人 */
const Stage: React.FC<AnimaticProps & { scenes: PlacedScene[]; lines: PlacedLine[] }> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scenes, lines } = props;
  const s1End = scenes[0].from + scenes[0].frames;
  const last = lines[lines.length - 1];
  const holdFrom = last.from + last.frames;
  if (frame < s1End || frame >= holdFrom) {
    return <Box label={"大鍋の寄り\n（最初と最後は同じ絵）"} style={{ left: 60, right: 60, top: 300, height: 1000 }} />;
  }
  const now = lines.find((l) => frame >= l.from && frame < l.from + l.frames);
  // 日付の札: 台詞 9 の前の間を3等分して「1日目」「2日目」「3日目」
  const dayPause = props.pauses.find((p) => p.beforeLine === 9);
  const line9 = lines.find((l) => l.index === 9);
  let day: string | null = null;
  if (dayPause && line9) {
    const start = line9.from - toFrames(dayPause.sec, fps);
    const step = Math.max(1, Math.round(toFrames(dayPause.sec, fps) / 3));
    if (frame >= start && frame < line9.from + line9.frames) day = `${Math.min(3, 1 + Math.floor((frame - start) / step))}日目`;
  }
  const washPause = props.pauses.find((p) => p.beforeLine === 14);
  const line14 = lines.find((l) => l.index === 14);
  const washing = washPause && line14 && frame >= line14.from - toFrames(washPause.sec, fps) && frame < line14.from;
  return (
    <>
      <Box label="タイトル帯" style={{ left: 200, right: 200, top: 110, height: 100 }} />
      <Box label={washing ? "流しと大鍋\n（取っ手を洗う）" : "流しと大鍋"} style={{ left: 60, right: 60, top: 300, height: 600 }} lit={!!washing} />
      {day ? <Box label={day} style={{ left: 40, top: 250, width: 260, height: 110 }} lit /> : null}
      <Box label="ずんだもん" style={{ left: 30, top: 980, width: 300, height: 700 }} lit={now?.speaker === "zundamon"} />
      <Box label="めたん" style={{ left: 390, top: 940, width: 300, height: 700 }} lit={now?.speaker === "metan"} />
      <Box label="つむぎ" style={{ left: 750, top: 1000, width: 300, height: 700 }} lit={now?.speaker === "tsumugi"} />
    </>
  );
};

export const Animatic: React.FC<AnimaticProps> = (props) => {
  const { scenes, lines } = layout(props);
  return (
    <AbsoluteFill style={{ backgroundColor: "#111", color: "#eee", fontFamily: "sans-serif" }}>
      <Stage {...props} scenes={scenes} lines={lines} />
      {scenes.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.frames} name={`${scene.id} ${scene.label}`} layout="none">
          <div style={{ position: "absolute", top: 1720, width: "100%", textAlign: "center", fontSize: 48, opacity: 0.6 }}>
            {scene.id} {scene.label}
          </div>
        </Sequence>
      ))}
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} name={line.text.slice(0, 12)} layout="none">
          <LineCard line={line} />
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      {props.showHud ? <Hud scenes={scenes} /> : null}
    </AbsoluteFill>
  );
};
