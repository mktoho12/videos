/**
 * 段階4 本実装。アニマティックと同じ時間軸（src/timeline.ts）に、立ち絵・字幕・背景・図を乗せる。
 * 見た目は styleframe.md、表情・効果音・図は演出表（src/direction.ts）に従う。
 * 本編 tadashii-sharehouse の Pudding.tsx を、縦長（ショート）とこの動画の図に合わせて組み直した。
 * ループのつなぎ: S1 は大鍋の寄りから引いて3人を見せ、最後は大鍋に寄って、背景・汚れ・取っ手も S1 の状態に戻して止める。
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
import {
  BLINK,
  BLINK_OFFSET,
  DAY_SE,
  DAYS,
  DAYS_BEFORE_LINE,
  expressionAt,
  KNOB_SHINES_AT_LINE,
  MOUTH_GROUP,
  MULTIPLIER_LINES,
  OPEN_SE,
  SE_CUES,
} from "./direction";
import { Sink, Telop, TitleBand } from "./Panels";
import { MANIFESTS, Tachie } from "./Tachie";
import { layout, MOUTH_FPS, PlacedLine, Speaker, timingDefaults, timingSchema } from "./timeline";
import { styleDefaults, styleSchema } from "./style";

/** 音量（0〜1）と、BGM の頭と終わりのフェード（秒）。ループでつながるので、フェードは短くする */
const audioSchema = z.object({
  bgmVolume: z.number().min(0).max(1),
  seVolume: z.number().min(0).max(1),
  bgmFadeInSec: z.number().min(0).max(10),
  bgmFadeOutSec: z.number().min(0).max(10),
});

export const nabeSchema = timingSchema.extend({
  style: styleSchema,
  audio: audioSchema,
  /** 上のタイトル帯の文言 */
  title: z.string(),
  /** S1 と最後の、大鍋の寄り（倍率と、寄ったときの流しの上端 px） */
  zoom: z.object({ scale: z.number().min(1).max(4), top: z.number() }),
  motion: z.object({
    /** 字幕の箱の出入り（不透明度だけ） */
    captionFadeSec: z.number().min(0).max(2),
    /** 札（日付・1.1倍）の入り・出 */
    panelInSec: z.number().min(0).max(3),
    panelOutSec: z.number().min(0).max(3),
    /** 札が下から入ってくる距離（px） */
    panelDistance: z.number().min(0).max(300),
    /** 背景が変わるときのクロスフェード */
    sceneFadeSec: z.number().min(0).max(3),
    /** 大鍋の寄りから引く・寄る時間。3人もこの間に出入りする */
    zoomSec: z.number().min(0).max(3),
    /** まばたきの間隔と、目を閉じている長さ */
    blinkEverySec: z.number().min(0.5).max(20),
    blinkSec: z.number().min(0).max(1),
    /** 字幕1枚あたりの最大文字数（長い台詞は句読点で区切って順に出す） */
    captionMaxChars: z.number().int().min(6).max(60),
    captionMinChars: z.number().int().min(1).max(30),
  }),
});

export type NabeProps = z.infer<typeof nabeSchema>;

export const nabeDefaults: NabeProps = {
  ...timingDefaults,
  style: styleDefaults,
  // 本編で人が書き出しを聞いて決めた音量。フェードはループの切れ目が目立たない程度に短く
  audio: { bgmVolume: 0.12, seVolume: 0.5, bgmFadeInSec: duration.base, bgmFadeOutSec: duration.base },
  title: "みんな自分の分は完璧",
  zoom: { scale: 1.7, top: 380 },
  motion: {
    captionFadeSec: duration.fast,
    panelInSec: duration.base,
    panelOutSec: duration.fast,
    panelDistance: distance.small,
    sceneFadeSec: duration.slow,
    zoomSec: duration.slow,
    // まばたきの間隔は motion-kit にトークンがない（本編と同じ値）
    blinkEverySec: 3.5,
    blinkSec: duration.instant,
    // 字幕の箱1行に収まる文字数（60px、画面幅の86%）に合わせた
    captionMaxChars: 14,
    captionMinChars: 5,
  },
};

export const calculateNabeMetadata: CalculateMetadataFunction<NabeProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, layout(props).total),
  width: 1080,
  height: 1920,
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

const lineOf = (lines: PlacedLine[], index: number) => lines.find((l) => l.index === index);

/** ずんだもんは左に立って右を向く */
const FLIP: Record<Speaker, boolean> = { zundamon: true, metan: false, tsumugi: false };

export const Nabe: React.FC<NabeProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { style, motion, zoom } = props;
  const { scenes, lines } = layout(props);
  const f = (sec: number) => toFrames(sec, fps);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  // ループのつなぎ: S1 の終わりで寄りから引き、最後の台詞のあとで寄る。寄るのと同時に、背景・汚れ・取っ手を S1 の状態に戻す
  const s1End = scenes[0].from + scenes[0].frames;
  const last = lines[lines.length - 1];
  const holdFrom = last.from + last.frames;
  const zoomOut = interpolate(frame - s1End, [0, f(motion.zoomSec)], [0, 1], { ...clamp, easing: easing("standard") });
  const zoomIn = interpolate(frame - holdFrom, [0, f(motion.zoomSec)], [0, 1], { ...clamp, easing: easing("standard") });
  const open = zoomOut * (1 - zoomIn); // 0＝大鍋の寄り、1＝流し＋3人
  const reset = zoomIn;

  // 日付: 台詞 DAYS_BEFORE_LINE の前の間を3等分して「1日目」「2日目」「3日目」。背景と汚れも日ごとに変える
  const dayLine = lineOf(lines, DAYS_BEFORE_LINE);
  const dayPause = props.pauses.find((p) => p.beforeLine === DAYS_BEFORE_LINE);
  const dayStart = dayLine && dayPause ? dayLine.from - f(dayPause.sec) : Infinity;
  const dayStep = dayPause ? Math.max(1, Math.round(f(dayPause.sec) / 3)) : 1;
  const dayAt = (i: number) => dayStart + (i - 1) * dayStep; // i 日目が始まるフレーム
  const day = frame < dayStart ? 0 : Math.min(3, 1 + Math.floor((frame - dayStart) / dayStep));
  const dayFade = day === 0 ? 1 : interpolate(frame - dayAt(day), [0, f(motion.sceneFadeSec)], [0, 1], { ...clamp, easing: easing("standard") });

  // 取っ手がピカピカになるのは、取っ手を洗う間が終わったところ
  const knobAt = lineOf(lines, KNOB_SHINES_AT_LINE)?.from ?? Infinity;

  // 表情は、いちばん最近始まった台詞のもの。話している最中なら口パクする
  const latest = [...lines].reverse().find((l) => l.from <= frame) ?? lines[0];
  const speaking = lines.find((l) => frame >= l.from && frame < l.from + l.frames);

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
    const scale = style.tachieScale[who];
    return (
      <Tachie
        key={who}
        character={who}
        scale={scale}
        flip={FLIP[who]}
        pick={pick}
        toggles={exp.toggles}
        style={{
          left: width * style.tachieCenterX[who] - (MANIFESTS[who].width * scale) / 2 - style.frame.width,
          top: style.tachieTop[who] + (1 - open) * motion.panelDistance,
          opacity: open,
        }}
      />
    );
  };

  // 字幕: 話している台詞を区切り、文字数の割合で順に出す。縦長なので話者にかかわらず中央に置く
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
    caption = <Caption style={style} speaker={speaking.speaker} side="center" text={text} opacity={opacity} />;
  }

  // 札（日付・1.1倍）の入りと出
  const card = (start: number, end: number) => {
    const enter = interpolate(frame - start, [0, f(motion.panelInSec)], [0, 1], { ...clamp, easing: easing("enter") });
    const exit = interpolate(frame - end, [0, f(motion.panelOutSec)], [1, 0], { ...clamp, easing: easing("exit") });
    return { opacity: Math.min(enter, exit), dy: (1 - enter) * motion.panelDistance };
  };
  const dayCard = dayLine && frame >= dayStart ? card(dayAt(day), dayLine.from + dayLine.frames) : null;
  const mFrom = lineOf(lines, MULTIPLIER_LINES.from);
  const mTo = lineOf(lines, MULTIPLIER_LINES.to);
  const multiplier = mFrom && mTo && frame >= mFrom.from ? card(mFrom.from, mTo.from + mTo.frames) : null;

  // 流しの位置と大きさ（寄り ⇄ 引き）
  const sinkScale = zoom.scale + (1 - zoom.scale) * open;
  const sinkTop = zoom.top + (style.sink.top - zoom.top) * open;
  const sinkAt = (children: React.ReactNode, opacity = 1) => (
    <div style={{ position: "absolute", left: "50%", top: sinkTop, opacity, transform: `translateX(-50%) scale(${sinkScale})`, transformOrigin: "top center" }}>
      {children}
    </div>
  );

  const bgNow = DAYS[day].background;
  const bgPrev = day > 0 ? DAYS[day - 1].background : null;
  const bgStyle: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", objectFit: "cover" };

  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.frame }}>
      <AbsoluteFill style={{ inset: style.frame.width, borderRadius: style.frame.radius, overflow: "hidden" }}>
        {bgPrev ? <Img src={staticFile(`bg/${bgPrev}`)} style={bgStyle} /> : null}
        <Img src={staticFile(`bg/${bgNow}`)} style={{ ...bgStyle, opacity: bgPrev ? dayFade : 1 }} />
        {reset > 0 ? <Img src={staticFile(`bg/${DAYS[0].background}`)} style={{ ...bgStyle, opacity: reset }} /> : null}
        {sinkAt(<Sink style={style} grime={DAYS[day].grime} knobShiny={frame >= knobAt} />, 1 - reset)}
        {reset > 0 ? sinkAt(<Sink style={style} grime={DAYS[0].grime} />, reset) : null}
        {/* めたんは真ん中で一歩奥に立つ（左右の2人の顔を髪で隠さないよう、先に描く） */}
        {(["metan", "zundamon", "tsumugi"] as const).map(tachieFor)}
        {dayCard && day > 0 ? (
          <div style={{ position: "absolute", left: 40, top: style.day.top, opacity: dayCard.opacity, transform: `translateY(${dayCard.dy}px)` }}>
            <Telop style={style} text={`${day}日目`} color={style.colors.frame} fontSize={style.day.fontSize} />
          </div>
        ) : null}
        {multiplier ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: style.multiplier.top,
              opacity: multiplier.opacity,
              transform: `translateY(${multiplier.dy}px)`,
            }}
          >
            <Telop style={style} text="1.1倍" color={style.colors.metan} fontSize={style.multiplier.fontSize} />
          </div>
        ) : null}
        {caption}
        <div style={{ position: "absolute", left: 0, right: 0, top: style.title.top, textAlign: "center" }}>
          <TitleBand style={style} text={props.title} />
        </div>
      </AbsoluteFill>
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} layout="none">
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      <Bgm {...props} total={layout(props).total} />
      <Sequence from={0} layout="none">
        <Html5Audio src={staticFile(`se/${OPEN_SE}`)} volume={props.audio.seVolume} />
      </Sequence>
      {dayLine
        ? [1, 2, 3].map((i) => (
            <Sequence key={`day-${i}`} from={dayAt(i)} layout="none">
              <Html5Audio src={staticFile(`se/${DAY_SE}`)} volume={props.audio.seVolume} />
            </Sequence>
          ))
        : null}
      {SE_CUES.map((cue, i) => {
        const l = lineOf(lines, cue.line);
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

/** BGM（public/bgm、OpenTracks「自宅にて」KK）。頭と終わりに短いフェード */
const Bgm: React.FC<NabeProps & { total: number }> = ({ audio, fps, total }) => (
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
