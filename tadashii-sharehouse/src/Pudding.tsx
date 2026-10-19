/**
 * 段階4 本実装。アニマティックと同じ時間軸（src/timeline.ts）に、立ち絵・字幕・背景・図を乗せる。
 * 見た目は styleframe.md、表情・立ち位置・図は演出表（src/direction.ts）に従う。
 * 前作 kaji-to-kenryoku の Kaji.tsx を複製し、3人目（つむぎ）・めたんの登場・この動画の図に合わせて変えた。
 * 動きの所要時間・イージング・距離は motion-kit のトークンを既定値にした props（motion）で持つ。
 * 音: 台詞（public/voice）、BGM（public/bgm、段階6）、効果音（public/se、演出表の SE_CUES、段階6）。
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
import { distance, duration, easing, stagger, toFrames } from "motion-kit/src/tokens";
import { Caption } from "./Caption";
import {
  BACKGROUND_FROM_LINE,
  BLINK,
  BLINK_OFFSET,
  COUNTER_PARALLEL_FROM_LINE,
  expressionAt,
  Formation,
  FORMATION_FROM_LINE,
  HOUSES_REVEAL,
  MESSAGE_REVEAL,
  METAN_ENTERS_AT_LINE,
  MOUTH_GROUP,
  NEXT_DAY_LINE,
  PANELS,
  SE_CUES,
} from "./direction";
import { Counter, Credits, Fridge, Houses, Message, NOTES, Pudding as PuddingPanel, Rule, Telop, Title } from "./Panels";
import { MANIFESTS, Tachie } from "./Tachie";
import { layout, MOUTH_FPS, PlacedLine, Speaker, timingDefaults, timingSchema } from "./timeline";
import { styleDefaults, styleSchema } from "./style";

/** 音量（0〜1）と、BGM の頭と終わりのフェード（秒） */
const audioSchema = z.object({
  bgmVolume: z.number().min(0).max(1),
  seVolume: z.number().min(0).max(1),
  bgmFadeInSec: z.number().min(0).max(10),
  bgmFadeOutSec: z.number().min(0).max(10),
});

export const puddingSchema = timingSchema.extend({
  style: styleSchema,
  audio: audioSchema,
  motion: z.object({
    /** 字幕の箱の出入り（不透明度だけ） */
    captionFadeSec: z.number().min(0).max(2),
    /** 図の入り・出 */
    panelInSec: z.number().min(0).max(3),
    panelOutSec: z.number().min(0).max(3),
    /** 図が下から入ってくる距離（px） */
    panelDistance: z.number().min(0).max(300),
    /** 図の中身を段階的に見せるとき（往復の数・家・まとめの行）の切り替え */
    revealSec: z.number().min(0).max(2),
    /** 貼り紙が1枚ずつ増える間隔 */
    noteStaggerSec: z.number().min(0).max(2),
    /** 背景が変わるときのクロスフェード */
    sceneFadeSec: z.number().min(0).max(3),
    /** めたんの登場: 2人の立ち位置が3人並びに移る時間と、めたんが右から入ってくる距離（px） */
    enterSec: z.number().min(0).max(3),
    enterDistance: z.number().min(0).max(600),
    /** まばたきの間隔と、目を閉じている長さ */
    blinkEverySec: z.number().min(0.5).max(20),
    blinkSec: z.number().min(0).max(1),
    /** 字幕1枚あたりの最大文字数（長い台詞は句読点で区切って順に出す） */
    captionMaxChars: z.number().int().min(6).max(60),
    captionMinChars: z.number().int().min(1).max(30),
    /** 図の大きさ（倍率） */
    panelScale: z.number().min(0.3).max(2),
  }),
});

export type PuddingProps = z.infer<typeof puddingSchema>;

export const puddingDefaults: PuddingProps = {
  ...timingDefaults,
  style: styleDefaults,
  // 前作で人が書き出しを聞いて決めた値（BGM は台詞が聞き取れるよう小さめ）
  audio: { bgmVolume: 0.12, seVolume: 0.5, bgmFadeInSec: 1, bgmFadeOutSec: 3 },
  motion: {
    captionFadeSec: duration.fast,
    panelInSec: duration.base,
    panelOutSec: duration.fast,
    panelDistance: distance.small,
    revealSec: duration.fast,
    // 貼り紙は1枚ずつ数えられる程度にゆっくり増やす（stagger.base の 0.08秒では一瞬で全部出てしまう）。notes.md に理由
    noteStaggerSec: stagger.base * 5,
    sceneFadeSec: duration.slow,
    enterSec: duration.base,
    enterDistance: distance.medium,
    // まばたきの間隔は motion-kit にトークンがない（前作の notes.md の motion-kit への提案）
    blinkEverySec: 3.5,
    blinkSec: duration.instant,
    // 字幕の箱1行に収まる文字数（58px、画面幅の58%）に合わせた
    captionMaxChars: 18,
    captionMinChars: 6,
    panelScale: 0.85,
  },
};

export const calculatePuddingMetadata: CalculateMetadataFunction<PuddingProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, layout(props).total),
  width: 1920,
  height: 1080,
});

/** 長い台詞を句読点の後ろで区切り、maxChars 以下のかたまりにまとめる。minChars 未満のかたまりは次とつなげる */
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

/** 3人並びで出す図のおおよその高さ（px、倍率をかける前）。めたんの顔にかからない倍率を決めるのに使う */
const RULE_HEIGHT = 200;
const HOUSES_HEIGHT = 340;
const MESSAGE_HEIGHT = 300;

/** 台詞の番号の頭のフレーム */
const startOf = (lines: PlacedLine[], index: number) => lines.find((l) => l.index === index)?.from ?? 0;

/** 「その台詞から n 個見せる」表から、いま見せる数を返す */
const revealCount = (lines: PlacedLine[], table: { from: number; count: number }[], frame: number) =>
  table.reduce((n, r) => (frame >= startOf(lines, r.from) ? r.count : n), 0);

export const Pudding: React.FC<PuddingProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { style, motion } = props;
  const { scenes, lines } = layout(props);
  const f = (sec: number) => toFrames(sec, fps);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const sceneIdx = Math.max(0, scenes.findIndex((s) => frame >= s.from && frame < s.from + s.frames));
  const scene = scenes[sceneIdx];
  const isCredits = scene.id === "S9";
  const creditsIn = interpolate(frame - scene.from, [0, f(motion.sceneFadeSec)], [0, 1], { ...clamp, easing: easing("standard") });

  // 背景: 台詞の番号で切り替え、前の背景の上にクロスフェードで重ねる
  const bgSwitches = BACKGROUND_FROM_LINE.map((b) => ({ at: startOf(lines, b.from), file: b.file }));
  const bgIdx = bgSwitches.reduce((n, b, i) => (frame >= b.at ? i : n), 0);
  const bgNow = bgSwitches[bgIdx];
  const bgPrev = bgIdx > 0 ? bgSwitches[bgIdx - 1] : undefined;
  const bgFade = interpolate(frame - bgNow.at, [0, f(motion.sceneFadeSec)], [0, 1], { ...clamp, easing: easing("standard") });

  // 表情は、いちばん最近始まった台詞のもの。話している最中なら口パクする
  const latest = [...lines].reverse().find((l) => l.from <= frame) ?? lines[0];
  const speaking = lines.find((l) => frame >= l.from && frame < l.from + l.frames);

  // 立ち位置: 台詞の番号で切り替え、前の立ち位置から移る。めたんは登場のとき右から入ってくる
  const cx = style.tachieCenterX;
  const fl = style.fridgeLayout;
  const FORMATIONS: Record<Formation, Record<Speaker, number>> = {
    two: { zundamon: cx.left, metan: cx.center, tsumugi: cx.right },
    trio: { zundamon: cx.trioLeft, metan: cx.center, tsumugi: cx.trioRight },
    fridge: { zundamon: fl.zundamon, metan: fl.metan, tsumugi: fl.tsumugi },
  };
  const fSwitches = FORMATION_FROM_LINE.map((x) => ({ at: startOf(lines, x.from), formation: x.formation }));
  const fIdx = fSwitches.reduce((n, x, i) => (frame >= x.at ? i : n), 0);
  const fNow = fSwitches[fIdx];
  const fPrev = fSwitches[Math.max(0, fIdx - 1)];
  const move = interpolate(frame - fNow.at, [0, f(motion.enterSec)], [0, 1], { ...clamp, easing: easing("standard") });
  const centerOf = (who: Speaker) => {
    const a = FORMATIONS[fPrev.formation][who];
    const b = FORMATIONS[fNow.formation][who];
    return a + (b - a) * move;
  };
  const enterAt = startOf(lines, METAN_ENTERS_AT_LINE);
  const trio = interpolate(frame - enterAt, [0, f(motion.enterSec)], [0, 1], { ...clamp, easing: easing("enter") });
  const FLIP: Record<Speaker, boolean> = { zundamon: true, metan: false, tsumugi: false };

  const tachieFor = (who: Speaker) => {
    if (who === "metan" && frame < enterAt) return null;
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
    const slideIn = who === "metan" ? (1 - trio) * motion.enterDistance : 0;
    return (
      <Tachie
        key={who}
        character={who}
        scale={style.tachieScale[who]}
        flip={FLIP[who]}
        pick={pick}
        toggles={exp.toggles}
        style={{
          left: width * centerOf(who) - (MANIFESTS[who].width * style.tachieScale[who]) / 2 - style.frame.width + slideIn,
          top: style.tachieTop[who],
          opacity: (who === "metan" ? trio : 1) * (isCredits ? 1 - creditsIn : 1),
        }}
      />
    );
  };

  // 字幕: 話している台詞を区切り、文字数の割合で順に出す。話者の立ち位置の側に置く
  let caption: React.ReactNode = null;
  if (speaking) {
    const chunks = chunkText(speaking.text, motion.captionMaxChars, motion.captionMinChars);
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const t = (frame - speaking.from) / speaking.frames;
    let acc = 0;
    let text = chunks[chunks.length - 1];
    for (const c of chunks) {
      acc += c.length / total;
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
    const side = speaking.speaker === "zundamon" ? "left" : speaking.speaker === "tsumugi" ? "right" : "center";
    caption = <Caption style={style} speaker={speaking.speaker} side={side} text={text} opacity={opacity} />;
  }

  // 図
  const panels = PANELS.map(({ from, to, panel }) => {
    const a = lines.find((l) => l.index === from);
    const b = lines.find((l) => l.index === to);
    if (!a || !b) return null;
    const start = a.from;
    const end = b.from + b.frames;
    const outFrames = f(motion.panelOutSec);
    if (frame < start || frame >= end + outFrames) return null;
    const enter = interpolate(frame - start, [0, f(motion.panelInSec)], [0, 1], { extrapolateRight: "clamp", easing: easing("enter") });
    const exit = interpolate(frame - end, [0, outFrames], [1, 0], { ...clamp, easing: easing("exit") });
    let content: React.ReactNode;
    let top = 60;
    let scale = motion.panelScale;
    let left = "50%";
    // めたんがいる間（3人並び）の図は、めたんの顔にかからないよう高さを trioPanelBottom までに収める
    const fitTrio = (heightPx: number) => {
      top = 30;
      scale = Math.min(motion.panelScale, (style.trioPanelBottom - top) / heightPx);
    };
    if (panel.kind === "pudding") {
      content = <PuddingPanel style={style} />;
    } else if (panel.kind === "title") {
      top = style.title.top;
      scale = 1;
      content = <Title style={style} text={panel.text} />;
    } else if (panel.kind === "counter") {
      // 1往復 = ずんだもんの台詞とつむぎの台詞。つむぎが言い返し終わるたびに増える
      const count = lines.filter((l) => l.index >= from && l.index <= to && l.speaker === "tsumugi" && frame >= l.from).length;
      content = <Counter style={style} count={Math.max(1, count)} parallel={frame >= startOf(lines, COUNTER_PARALLEL_FROM_LINE)} />;
    } else if (panel.kind === "rule") {
      fitTrio(RULE_HEIGHT);
      content = <Rule style={style} />;
    } else if (panel.kind === "houses") {
      fitTrio(HOUSES_HEIGHT);
      content = <Houses style={style} count={revealCount(lines, HOUSES_REVEAL, frame)} />;
    } else if (panel.kind === "fridge") {
      const shown = Math.min(NOTES.length, 1 + Math.floor((frame - start) / Math.max(1, f(motion.noteStaggerSec))));
      top = 40;
      scale = 0.8;
      left = `${style.fridgeLayout.fridge * 100}%`;
      content = <Fridge style={style} shown={shown} />;
    } else {
      fitTrio(MESSAGE_HEIGHT);
      content = <Message style={style} count={revealCount(lines, MESSAGE_REVEAL, frame)} />;
    }
    return (
      <div
        key={from}
        style={{
          position: "absolute",
          left,
          top,
          transform: `translate(-50%, ${(1 - enter) * motion.panelDistance}px) scale(${scale})`,
          transformOrigin: "top center",
          opacity: Math.min(enter, exit),
        }}
      >
        {content}
      </div>
    );
  });

  // 「翌日」の札（S7 で貼り紙だらけになる前に、時間が飛んだことを示す）
  const nextDayAt = startOf(lines, NEXT_DAY_LINE);
  const nextDay = interpolate(frame - nextDayAt, [0, f(motion.panelInSec), f(2), f(2) + f(motion.panelOutSec)], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.frame }}>
      <AbsoluteFill style={{ inset: style.frame.width, borderRadius: style.frame.radius, overflow: "hidden" }}>
        {bgPrev ? <Img src={staticFile(`bg/${bgPrev.file}`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        <Img
          src={staticFile(`bg/${bgNow.file}`)}
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: bgPrev ? bgFade : 1 }}
        />
        {/* めたんは真ん中で一歩奥に立つ（左右の2人の顔を髪で隠さないよう、先に描く） */}
        {(["metan", "zundamon", "tsumugi"] as const).map(tachieFor)}
        {panels}
        {nextDay > 0 ? (
          <div style={{ position: "absolute", left: 60, top: 40, opacity: nextDay }}>
            <Telop style={style} text="翌日" color={style.colors.frame} fontSize={72} />
          </div>
        ) : null}
        {caption}
        {isCredits ? (
          <>
            <AbsoluteFill style={{ backgroundColor: style.colors.frame, opacity: creditsIn }} />
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: creditsIn }}>
              <Credits style={style} />
            </AbsoluteFill>
          </>
        ) : null}
      </AbsoluteFill>
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} layout="none">
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      <Bgm {...props} total={layout(props).total} />
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

/** BGM（public/bgm、OpenTracks「自宅にて」KK）。頭でフェードイン、終わりでフェードアウト */
const Bgm: React.FC<PuddingProps & { total: number }> = ({ audio, fps, total }) => (
  <Html5Audio
    src={staticFile("bgm/jitaku-nite.mp3")}
    loop
    volume={(frame) =>
      audio.bgmVolume *
      Math.min(
        interpolate(frame, [0, toFrames(audio.bgmFadeInSec, fps)], [0, 1], { extrapolateRight: "clamp" }),
        interpolate(frame, [total - toFrames(audio.bgmFadeOutSec, fps), total], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      )
    }
  />
);
