/**
 * 段階4 本実装。台詞の時間軸（src/timeline.ts）に、背景・立ち絵・真ん中の図・字幕・音を乗せる。
 * 前のショート hanauta の Hanauta.tsx を複製した（ヘッドホンは外した）。配置は nabe と同じ（上にタイトル帯、真ん中に図、下半分に3人、字幕は胸のあたり）、寄りの画角・BGM の切り替えは本編と同じ作り。
 * 表情・画角・図・効果音・BGM は演出表（src/direction.ts）に従う。
 * 動きの所要時間・イージング・距離は motion-kit のトークンを既定値にした props（motion）で持つ。
 */
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Html5Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { distance, duration, easing, toFrames } from "motion-kit/src/tokens";
import { Caption } from "./Caption";
import { BGM_CUES, BLINK, BLINK_OFFSET, Board, BOARDS, CLOSE_UPS, expressionAt, MOUTH_GROUP, SE_CUES } from "./direction";
import { RemoteBoard, SofaBoard, TitleBand } from "./Panels";
import { MANIFESTS, Tachie } from "./Tachie";
import { layout, MOUTH_FPS, PlacedLine, Speaker, timingDefaults, timingSchema } from "./timeline";
import { styleDefaults, styleSchema } from "./style";

/** 音量（0〜1）と、BGM の頭・終わりのフェードと、曲の切り替えで重ねる長さ（秒） */
const audioSchema = z.object({
  bgmVolume: z.number().min(0).max(1),
  seVolume: z.number().min(0).max(1),
  bgmFadeInSec: z.number().min(0).max(10),
  bgmFadeOutSec: z.number().min(0).max(10),
  bgmCrossSec: z.number().min(0).max(10),
});

export const sofashitaSchema = timingSchema.extend({
  style: styleSchema,
  audio: audioSchema,
  /** 上のタイトル帯の文言 */
  title: z.string(),
  /** 下の関連動画のリンクを指す札の文言 */
  motion: z.object({
    /** 字幕の箱の出入り（不透明度だけ） */
    captionFadeSec: z.number().min(0).max(2),
    /** 寄り・引きの切り替え */
    cameraSec: z.number().min(0).max(3),
    /** 真ん中の図の入れ替え（入り・出） */
    boardInSec: z.number().min(0).max(3),
    boardOutSec: z.number().min(0).max(3),
    /** 図が下から入ってくる距離（px） */
    boardDistance: z.number().min(0).max(300),
    /** 関連動画のリンクを指す札がはずむ周期と幅（px） */
    /** まばたきの間隔と、目を閉じている長さ */
    blinkEverySec: z.number().min(0.5).max(20),
    blinkSec: z.number().min(0).max(1),
    /** 字幕1枚あたりの最大文字数（長い台詞は句読点で区切って順に出す） */
    captionMaxChars: z.number().int().min(6).max(60),
    captionMinChars: z.number().int().min(1).max(30),
  }),
});

export type SofashitaProps = z.infer<typeof sofashitaSchema>;

export const sofashitaDefaults: SofashitaProps = {
  ...timingDefaults,
  style: styleDefaults,
  // 音量は本編と同じ（本編で人が書き出しを聞いて決めた値）。ショートは短いので、頭と終わりのフェードは短くする
  audio: { bgmVolume: 0.12, seVolume: 0.5, bgmFadeInSec: duration.base, bgmFadeOutSec: duration.slow, bgmCrossSec: duration.deliberate },
  title: "ソファーの下から出てきたもの",
  motion: {
    captionFadeSec: duration.fast,
    cameraSec: duration.fast,
    boardInSec: duration.base,
    boardOutSec: duration.fast,
    boardDistance: distance.medium,
    // まばたきの間隔は motion-kit にトークンがない（本編と同じ値）
    blinkEverySec: 3.5,
    blinkSec: duration.instant,
    // 字幕の箱1行に収まる文字数（60px、画面幅の86%）に合わせた（nabe と同じ）
    captionMaxChars: 14,
    // 「続きは、」（4文字）を次とつなげると1行に収まらないので、nabe の 5 から 4 にした
    captionMinChars: 4,
  },
};

export const calculateSofashitaMetadata: CalculateMetadataFunction<SofashitaProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, layout(props).total),
  width: 1080,
  height: 1920,
});

/** 長い台詞を句読点の後ろで区切り、maxChars 以下のかたまりにまとめる。minChars 未満のかたまりは次とつなげる（nabe と同じ） */
const chunkText = (text: string, maxChars: number, minChars: number): string[] => {
  const pieces = text.match(/[^、。！？」]*[、。！？」]*/g)?.filter((p) => p.length > 0) ?? [text];
  const chunks: string[] = [];
  for (const p of pieces) {
    const last = chunks[chunks.length - 1];
    if (last !== undefined && (last.length + p.length <= maxChars || last.length < minChars)) {
      chunks[chunks.length - 1] = last + p;
    } else chunks.push(p);
  }
  return chunks;
};

/** ずんだもんは左に立って右を向く（nabe と同じ） */
const FLIP: Record<Speaker, boolean> = { zundamon: true, metan: false, tsumugi: false };

type Camera = { s: number; tx: number; ty: number };

/** 条件に合う最後の要素の位置（なければ -1） */
const lastIndexOf = <T,>(xs: T[], ok: (x: T) => boolean) => {
  for (let i = xs.length - 1; i >= 0; i--) if (ok(xs[i])) return i;
  return -1;
};

export const Sofashita: React.FC<SofashitaProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { style, motion } = props;
  const { scenes, lines, total } = layout(props);
  const f = (sec: number) => toFrames(sec, fps);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const inset = style.frame.width;

  // 表情・画角は、いちばん最近始まった台詞のもの。話している最中なら口パクする
  const latestIdx = Math.max(0, lastIndexOf(lines, (l) => l.from <= frame));
  const latest = lines[latestIdx];
  const speaking = lines.find((l) => frame >= l.from && frame < l.from + l.frames);

  // 寄り: 話している人の顔を camera.faceTo に持ってきて拡大する。引きは等倍
  const tachieLeft = (who: Speaker) => width * style.tachieCenterX[who] - (MANIFESTS[who].width * style.tachieScale[who]) / 2 - inset;
  const cameraOf = (l: PlacedLine | undefined): Camera => {
    if (!l || !CLOSE_UPS.includes(l.index)) return { s: 1, tx: 0, ty: 0 };
    const k = style.camera.closeUpScale;
    const fx = width * style.tachieCenterX[l.speaker] - inset;
    const fy = style.tachieTop[l.speaker] + style.faceY[l.speaker] * style.tachieScale[l.speaker];
    // 背景が画面の外に出て端が見えないよう、動かす量を背景の大きさの中に収める
    const w = width - inset * 2;
    const h = height - inset * 2;
    const clampTo = (v: number, size: number) => Math.min(0, Math.max(size - k * size, v));
    return { s: k, tx: clampTo(style.camera.faceToX - inset - k * fx, w), ty: clampTo(style.camera.faceToY - inset - k * fy, h) };
  };
  const camA = cameraOf(lines[latestIdx - 1]);
  const camB = cameraOf(latest);
  const camT = latestIdx === 0 ? 1 : interpolate(frame - latest.from, [0, f(motion.cameraSec)], [0, 1], { ...clamp, easing: easing("emphasized") });
  const cam: Camera = { s: camA.s + (camB.s - camA.s) * camT, tx: camA.tx + (camB.tx - camA.tx) * camT, ty: camA.ty + (camB.ty - camA.ty) * camT };
  // 寄っている間は、真ん中の図をしまう
  const closeAmt = (cam.s - 1) / Math.max(0.001, style.camera.closeUpScale - 1);

  const tachieFor = (who: Speaker) => {
    const exp = expressionAt(who, latest.index);
    const pick = { ...exp.pick };
    let mouthOpen = false;
    if (speaking && speaking.speaker === who) {
      const i = Math.floor(((frame - speaking.from) * MOUTH_FPS) / fps);
      mouthOpen = speaking.mouth[i] === "1";
    }
    pick[MOUTH_GROUP[who]] = mouthOpen ? exp.mouthOpen : exp.mouthClosed;
    const blink = BLINK[who];
    const phase = (frame / fps / motion.blinkEverySec + BLINK_OFFSET[who]) % 1;
    if (phase * motion.blinkEverySec < motion.blinkSec && blink.blinkable(exp.pick[blink.group])) {
      pick[blink.group] = blink.closed;
    }
    return (
      <Tachie
        key={who}
        character={who}
        scale={style.tachieScale[who]}
        flip={FLIP[who]}
        pick={pick}
        toggles={exp.toggles}
        style={{ left: tachieLeft(who), top: style.tachieTop[who] }}
      />
    );
  };

  // 真ん中の図: いまの図が下から入り、前の図は消える
  const lineFrom = (index: number) => lines.find((l) => l.index === index)?.from ?? Infinity;
  const boardIdx = lastIndexOf(BOARDS, (b) => lineFrom(b.from) <= frame);
  const boardAt = (i: number) => (i >= 0 ? lineFrom(BOARDS[i].from) : 0);
  const boardView = (b: Board) => {
    switch (b) {
      case "remote":
        return <RemoteBoard style={style} />;
      case "sofa":
        return <SofaBoard style={style} found={false} />;
      case "found": {
        // 出てきた物は、ずんだもんが読み上げる台詞の長さに合わせて1つずつ出す
        const l = lines.find((x) => x.index === BOARDS.find((y) => y.board === "found")?.from);
        const reveal = l ? interpolate(frame, [l.from, l.from + l.frames * 0.9], [0.25, 1], clamp) : 1;
        return <SofaBoard style={style} found reveal={reveal} />;
      }
    }
  };
  const boardLayer = (i: number, opacity: number, dy: number) => (
    <div
      key={`board-${i}`}
      style={{
        position: "absolute",
        left: "50%",
        top: style.board.top,
        opacity: opacity * (1 - closeAmt),
        transform: `translate(-50%, ${dy}px) scale(${style.board.scale})`,
        transformOrigin: "top center",
      }}
    >
      {boardView(BOARDS[i].board)}
    </div>
  );
  const boardIn = boardIdx < 0 ? 0 : boardIdx === 0 ? 1 : interpolate(frame - boardAt(boardIdx), [0, f(motion.boardInSec)], [0, 1], { ...clamp, easing: easing("enter") });
  const prevOut = boardIdx < 1 ? 0 : interpolate(frame - boardAt(boardIdx), [0, f(motion.boardOutSec)], [1, 0], { ...clamp, easing: easing("exit") });

  // 字幕: 話している台詞を区切り、文字数の割合で順に出す。縦長なので話者にかかわらず中央に置く
  let caption: React.ReactNode = null;
  if (speaking) {
    const chunks = chunkText(speaking.text, motion.captionMaxChars, motion.captionMinChars);
    const totalChars = chunks.reduce((n, c) => n + c.length, 0);
    const t = (frame - speaking.from) / speaking.frames;
    let acc = 0;
    let text = chunks[chunks.length - 1];
    for (const c of chunks) {
      acc += c.length / totalChars;
      if (t < acc) {
        text = c;
        break;
      }
    }
    const fade = f(motion.captionFadeSec);
    const opacity = Math.min(
      interpolate(frame - speaking.from, [0, fade], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(speaking.from + speaking.frames - frame, [0, fade], [0, 1], { extrapolateRight: "clamp" }),
    );
    caption = <Caption style={style} speaker={speaking.speaker} side="center" text={text} opacity={opacity} />;
  }

  // 関連動画のリンクを指す札: 誘導の最後の台詞から出して、はずませる

  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.frame }}>
      <AbsoluteFill style={{ inset, borderRadius: style.frame.radius, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`, transformOrigin: "0 0" }}>
          <Img src={staticFile("bg/living_night_on.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          {/* めたんは真ん中で一歩奥に立つ（左右の2人の顔を髪で隠さないよう、先に描く） */}
          {(["metan", "zundamon", "tsumugi"] as const).map(tachieFor)}
        </AbsoluteFill>
        {boardIdx >= 1 && prevOut > 0 ? boardLayer(boardIdx - 1, prevOut, 0) : null}
        {boardIdx >= 0 ? boardLayer(boardIdx, boardIn, (1 - boardIn) * motion.boardDistance) : null}
        {caption}
        <div style={{ position: "absolute", left: 0, right: 0, top: style.title.top - inset, textAlign: "center" }}>
          <TitleBand style={style} text={props.title} />
        </div>
      </AbsoluteFill>
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} layout="none">
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      {BGM_CUES.map((cue, i) => {
        const from = scenes.find((x) => x.id === cue.scene)?.from;
        if (from === undefined) return null;
        const nextCue = BGM_CUES[i + 1];
        const nextFrom = nextCue ? scenes.find((x) => x.id === nextCue.scene)?.from : undefined;
        const end = nextFrom === undefined ? total : nextFrom + f(props.audio.bgmCrossSec);
        return (
          <Sequence key={`bgm-${i}`} from={from} durationInFrames={end - from} layout="none">
            <Bgm
              audio={props.audio}
              fps={fps}
              file={cue.file}
              gain={cue.gain}
              frames={end - from}
              fadeIn={i === 0 ? props.audio.bgmFadeInSec : props.audio.bgmCrossSec}
              fadeOut={nextCue ? props.audio.bgmCrossSec : props.audio.bgmFadeOutSec}
            />
          </Sequence>
        );
      })}
      {SE_CUES.map((cue, i) => {
        const l = lines.find((x) => x.index === cue.line);
        if (!l) return null;
        return (
          <Sequence key={`se-${i}`} from={cue.at === "start" ? l.from : l.from + l.frames} layout="none">
            <Html5Audio src={staticFile(`se/${cue.file}`)} volume={props.audio.seVolume} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** BGM 1曲分。gain で曲ごとの音の大きさをそろえ、頭と終わりをフェードする（本編 omoikomi と同じ） */
const Bgm: React.FC<{ audio: SofashitaProps["audio"]; fps: number; file: string; gain: number; frames: number; fadeIn: number; fadeOut: number }> = ({
  audio,
  fps,
  file,
  gain,
  frames,
  fadeIn,
  fadeOut,
}) => (
  <Html5Audio
    src={staticFile(`bgm/${file}`)}
    loop
    volume={(frame) =>
      audio.bgmVolume *
      gain *
      Math.min(
        interpolate(frame, [0, toFrames(fadeIn, fps)], [0, 1], { extrapolateRight: "clamp" }),
        interpolate(frame, [frames - toFrames(fadeOut, fps), frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      )
    }
  />
);
