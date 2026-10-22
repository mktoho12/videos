/**
 * 段階3「アニマティック」。atarimae の Animatic.tsx を複製したもの（元はプリン裁判。omoikomi で画角と背景の切り替えを足した）。
 * 四角とテキストだけで、台詞の音声を乗せてタイミングを確認する。見た目の作り込みはしない。
 * 画角・登場・場所の文字・名札・テロップは src/shots.ts の表に従う。寄りは話す人の四角を大きく、差し込みは図の名前の箱を出して話す人を右下に小さく。
 * hitorigoto では、字幕を吹き出しの積み上げ（声の進みに合わせて1行ずつ足す）にしたので、その出方もここで確かめる。
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
import { captionLines, stackStarts } from "./Caption";
import { BACKGROUND_LABELS, backgroundOf, INSERT_LABELS, NAME_TAGS, PLACE_LABELS, presentAt, shotOf, TELOPS } from "./shots";
import { styleDefaults } from "./style";
import { layout, PlacedLine, PlacedScene, Speaker, timingDefaults, timingSchema } from "./timeline";

export const animaticSchema = timingSchema.extend({
  showHud: z.boolean(),
  /** 場所の文字・名札・テロップを出しておく秒数 */
  labelSec: z.number().min(0).max(10),
});

export type AnimaticProps = z.infer<typeof animaticSchema>;

export const animaticDefaults: AnimaticProps = {
  ...timingDefaults,
  showHud: true,
  labelSec: 3,
};

export const calculateAnimaticMetadata: CalculateMetadataFunction<AnimaticProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, layout(props).total),
  width: 1920,
  height: 1080,
});

const NAMES: Record<Speaker, string> = { zundamon: "ずんだもん", metan: "めたん", tsumugi: "つむぎ" };
const COLORS: Record<Speaker, string> = { zundamon: "#5cbf2a", metan: "#e0508f", tsumugi: "#e8a91c" };

/** 立ち位置（スタイルフレームと同じ） */
const POSITIONS: Record<Speaker, number> = { zundamon: 0.21, metan: 0.5, tsumugi: 0.82 };

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

/** 吹き出しの積み上げ（簡易版）。声の進みに合わせて1行ずつ足し、上限を超えたら古い行を押し出す */
const StackLines: React.FC<{ line: PlacedLine; insert: boolean }> = ({ line, insert }) => {
  const frame = useCurrentFrame();
  const { caption } = styleDefaults;
  const lines = captionLines(line.text, caption.maxLineChars);
  const starts = stackStarts(lines);
  const progress = frame / Math.max(1, line.frames);
  const shown = Math.max(1, starts.filter((s) => s <= progress).length);
  const max = insert ? caption.stackMaxInsert : caption.stackMax;
  const from = Math.max(0, shown - max);
  const side = insert ? 0.5 : POSITIONS[line.speaker];
  const left = side < 0.34 ? "6%" : side > 0.66 ? "50%" : "28%";
  return (
    <div style={{ position: "absolute", left, width: "44%", bottom: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {lines.slice(from, shown).map((t, i) => (
        <div
          key={from + i}
          style={{
            transform: `translateX(${caption.stackShift[(from + i) % caption.stackShift.length]}px)`,
            padding: "10px 32px",
            border: `6px solid ${COLORS[line.speaker]}`,
            backgroundColor: "#111",
            fontSize: 50,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
};

/** 画角に合わせた四角の並び。台詞の合間（次の台詞までの間）は、直前の台詞の画角のまま */
const Stage: React.FC<{ lines: PlacedLine[]; sceneFrom: number; sceneId: string }> = ({ lines, sceneFrom, sceneId }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const inScene = lines.filter((l) => l.scene === sceneId);
  const now = [...inScene].reverse().find((l) => frame >= l.from) ?? inScene[0];
  if (!now) {
    // 台詞のないシーン（S2 タイトル）
    return (
      <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", fontSize: 96 }}>
        イヤホンの向こうは、まわりに聞こえないのだ（仮）
      </div>
    );
  }
  const speaking = (s: Speaker) => frame >= now.from && frame < now.from + now.frames && now.speaker === s;
  const bg = backgroundOf(now.scene, now.index);
  const shot = shotOf(now.index);
  const present = presentAt(now.index);
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
        {shot.kind === "wide" ? "引き" : shot.kind === "closeUp" ? `寄り：${NAMES[now.speaker]}` : "差し込み"}
      </div>
      {shot.kind === "wide"
        ? present.map((s) => <Figure key={s} name={NAMES[s]} x={POSITIONS[s]} speaking={speaking(s)} />)
        : null}
      {shot.kind === "closeUp" ? <Figure name={NAMES[now.speaker]} x={0.5} speaking top={120} scale={1.7} /> : null}
      {shot.kind === "insert" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 200,
              right: 360,
              top: 150,
              height: 500,
              border: "6px dashed #8ab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 40,
              fontSize: 56,
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

/** 場所の文字・名札・テロップ（その台詞の頭から labelSec 秒） */
const Labels: React.FC<{ lines: PlacedLine[]; labelSec: number }> = ({ lines, labelSec }) => {
  const { fps } = useVideoConfig();
  const at = (n: number) => lines[n - 1].from;
  const dur = Math.round(labelSec * fps);
  return (
    <>
      {PLACE_LABELS.map((p) => (
        <Sequence key={`place-${p.line}`} from={at(p.line)} durationInFrames={dur} name={`場所 ${p.detail}`}>
          <div style={{ position: "absolute", left: "50%", top: 140, transform: "translateX(-50%)", fontSize: 44, padding: "8px 26px", border: "5px solid #eee", backgroundColor: "#222" }}>
            {p.place}｜{p.detail}
          </div>
        </Sequence>
      ))}
      {NAME_TAGS.map((t) => (
        <Sequence key={`tag-${t.who}`} from={at(t.line)} durationInFrames={dur} name={`名札 ${NAMES[t.who]}`}>
          <div
            style={{
              position: "absolute",
              left: `calc(${POSITIONS[t.who] * 100}% + ${POSITIONS[t.who] < 0.5 ? 330 : POSITIONS[t.who] > 0.5 ? -330 : 0}px)`,
              top: POSITIONS[t.who] === 0.5 ? 220 : 520,
              transform: "translateX(-50%)",
              fontSize: 40,
              padding: "6px 22px",
              border: `5px solid ${COLORS[t.who]}`,
              backgroundColor: "#222",
            }}
          >
            名札：{NAMES[t.who]}（{t.role}）
          </div>
        </Sequence>
      ))}
      {TELOPS.map((t) => (
        <Sequence key={`telop-${t.line}`} from={at(t.line)} durationInFrames={dur} name={`テロップ ${t.text}`}>
          <div style={{ position: "absolute", left: 60, top: 140, fontSize: 64, color: "#fd8" }}>{t.text}</div>
        </Sequence>
      ))}
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
      <Labels lines={lines} labelSec={props.labelSec} />
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} name={`${line.index} ${line.text.slice(0, 12)}`}>
          <StackLines line={line} insert={shotOf(line.index).kind === "insert"} />
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
