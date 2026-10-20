/**
 * 段階3「アニマティック」。プリン裁判の Animatic.tsx を複製し、画角（引き・寄り・差し込み）と背景の切り替えを足したもの。
 * 四角とテキストだけで、台詞の音声を乗せてタイミングを確認する。見た目の作り込みはしない。
 * 画角は src/shots.ts の表に従う。寄りは話す人の四角を大きく、差し込みは図の名前の箱を出して話す人を右下に小さく。
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
import { BACKGROUND_LABELS, backgroundOf, INSERT_LABELS, shotOf } from "./shots";
import { layout, Line, PlacedLine, PlacedScene, Speaker, timingDefaults, timingSchema } from "./timeline";

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

const NAMES: Record<Speaker, string> = { zundamon: "ずんだもん", metan: "めたん", tsumugi: "つむぎ" };

/** 立ち位置（スタイルフレームと同じ）。洗濯機置き場では、ずんだもんが右寄り */
const positions = (laundry: boolean): Record<Speaker, number> =>
  laundry ? { metan: 0.1, zundamon: 0.68, tsumugi: 0.9 } : { zundamon: 0.21, metan: 0.5, tsumugi: 0.82 };

/** 立ち絵の代わりの四角。話している人を明るくする。x は四角の中心（画面幅に対する割合） */
const Figure: React.FC<{ name: string; x: number; speaking: boolean; scale?: number; top?: number }> = ({
  name,
  x,
  speaking,
  scale = 1,
  top = 260,
}) => (
  <div
    style={{
      position: "absolute",
      left: `calc(${x * 100}% - ${180 * scale}px)`,
      top,
      width: 360 * scale,
      height: 820 * scale,
      border: "6px solid #888",
      backgroundColor: speaking ? "#555" : "#262626",
      display: "flex",
      justifyContent: "center",
      paddingTop: 60 * scale,
      fontSize: 48 * Math.max(1, scale * 0.8),
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
      textAlign: "center",
    }}
  >
    {line.text}
  </div>
);

/** 画角に合わせた四角の並び。台詞の合間（次の台詞までの間）は、直前の台詞の画角のまま */
const Stage: React.FC<{ lines: PlacedLine[]; sceneFrom: number; sceneId: string }> = ({ lines, sceneFrom, sceneId }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const inScene = lines.filter((l) => l.scene === sceneId);
  const now = [...inScene].reverse().find((l) => frame >= l.from) ?? inScene[0];
  if (!now) {
    // 台詞のないシーン（S2 タイトル）
    return (
      <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", fontSize: 96 }}>
        『難しそう』は、だいたい思い込み
      </div>
    );
  }
  const speaking = (s: Speaker) => frame >= now.from && frame < now.from + now.frames && now.speaker === s;
  const bg = backgroundOf(now.scene, now.index);
  const pos = positions(bg.startsWith("laundry"));
  const shot = shotOf(now.index);
  return (
    <>
      <div style={{ position: "absolute", right: 40, top: 30, fontSize: 34, opacity: 0.7 }}>背景：{BACKGROUND_LABELS[bg]}</div>
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 80,
          fontSize: 40,
          padding: "4px 18px",
          backgroundColor: shot.kind === "wide" ? "#333" : shot.kind === "closeUp" ? "#6a4a1a" : "#1a4a6a",
        }}
      >
        {shot.kind === "wide" ? "引き" : shot.kind === "closeUp" ? `寄り：${NAMES[now.speaker]}` : `差し込み：${INSERT_LABELS[shot.insert]}`}
      </div>
      {shot.kind === "wide"
        ? (Object.keys(pos) as Speaker[]).map((s) => <Figure key={s} name={NAMES[s]} x={pos[s]} speaking={speaking(s)} />)
        : null}
      {shot.kind === "closeUp" ? <Figure name={NAMES[now.speaker]} x={0.5} speaking top={120} scale={1.7} /> : null}
      {shot.kind === "insert" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 360,
              right: 360,
              top: 160,
              height: 560,
              border: "6px dashed #8ab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              color: "#bcd",
            }}
          >
            {INSERT_LABELS[shot.insert]}
          </div>
          <Figure name={NAMES[now.speaker]} x={0.9} speaking={speaking(now.speaker)} scale={0.45} top={640} />
        </>
      ) : null}
    </>
  );
};

/** 全体の時刻と、いまのシーン・シーン内の時刻・台詞の番号（人がタイミングを指摘するときの目安） */
const Hud: React.FC<{ scenes: PlacedScene[]; lines: PlacedLine[] }> = ({ scenes, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = scenes.find((s) => frame >= s.from && frame < s.from + s.frames) ?? scenes[scenes.length - 1];
  const line = [...lines].reverse().find((l) => frame >= l.from && l.scene === scene.id);
  return (
    <div style={{ position: "absolute", left: 40, top: 30, fontSize: 34, fontFamily: "monospace", opacity: 0.7 }}>
      全体 {(frame / fps).toFixed(2)}s　{scene.id} +{((frame - scene.from) / fps).toFixed(2)}s　{line ? `台詞${line.index}` : ""}
    </div>
  );
};

export const Animatic: React.FC<AnimaticProps> = (props) => {
  const { scenes, lines, outroFrom } = layout(props);
  const last = scenes[scenes.length - 1];
  const lastLine = lines[lines.length - 1];
  const endFrom = lastLine.from + lastLine.frames;
  return (
    <AbsoluteFill style={{ backgroundColor: "#111", color: "#eee", fontFamily: "sans-serif" }}>
      {scenes.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.frames} name={`${scene.id} ${scene.label}`}>
          <AbsoluteFill>
            <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", fontSize: 44, opacity: 0.6 }}>
              {scene.id} {scene.label}
            </div>
            <Stage lines={lines} sceneFrom={scene.from} sceneId={scene.id} />
          </AbsoluteFill>
        </Sequence>
      ))}
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} name={`${line.index} ${line.text.slice(0, 12)}`}>
          <LineCard line={line} />
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      {/* 本編おわりの効果音と、あいさつまでの間 */}
      <Sequence from={outroFrom} durationInFrames={lastLine.from - outroFrom} name="本編おわり">
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 140, textAlign: "center", fontSize: 48, color: "#dba" }}>
          （本編おわり：効果音「ちゃんちゃん♪」）
        </div>
        <Html5Audio src={staticFile("se/chan-chan1.mp3")} volume={0.5} />
      </Sequence>
      {/* 終了画面を置く所（右半分）と、クレジット（左下） */}
      <Sequence from={endFrom} durationInFrames={last.from + last.frames - endFrom} name="終了画面">
        <div
          style={{
            position: "absolute",
            left: 1000,
            right: 60,
            top: 160,
            bottom: 160,
            border: "6px dashed #c96",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            color: "#dba",
            backgroundColor: "#111",
          }}
        >
          YouTube の終了画面
        </div>
        <div style={{ position: "absolute", left: 60, bottom: 60, fontSize: 32, color: "#aaa", backgroundColor: "#111" }}>
          クレジット（小さく）
        </div>
      </Sequence>
      {props.showHud ? <Hud scenes={scenes} lines={lines} /> : null}
    </AbsoluteFill>
  );
};
