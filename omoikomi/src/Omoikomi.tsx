/**
 * 段階4 本実装。アニマティックと同じ時間軸（src/timeline.ts）に、立ち絵・字幕・背景・図を乗せる。
 * 見た目は styleframe.md、画角と背景は src/shots.ts（段階3 で確認した表）、表情・効果音は演出表（src/direction.ts）に従う。
 * プリン裁判（tadashii-sharehouse）の Pudding.tsx を複製し、画角（引き・寄り・差し込み）の切り替えを足した。
 * 動きの所要時間・イージング・距離は motion-kit のトークンを既定値にした props（motion）で持つ。
 * 音: 台詞（public/voice）、BGM（public/bgm）、効果音（public/se、演出表の SE_CUES と、本編おわりの合図）。
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
import { distance, duration, easing, hold, toFrames } from "motion-kit/src/tokens";
import { Caption } from "./Caption";
import { BGM_CUES, BLINK, BLINK_OFFSET, expressionAt, FLIP, INSERT_STEPS, METAN_ENTERS_AT_LINE, MOUTH_GROUP, SE_CUES, TELOPS } from "./direction";
import { Credits, DrainDiagram, ManualPage, ProOrSelf, ScreenDoorDiagram, ScreenDoorHands, Telop, Title } from "./Panels";
import { Background, BACKGROUND_FILES, backgroundOf, Insert, Shot, shotOf } from "./shots";
import { MANIFESTS, Tachie } from "./Tachie";
import { layout, MOUTH_FPS, PlacedLine, Speaker, timingDefaults, timingSchema } from "./timeline";
import { Style, styleDefaults, styleSchema } from "./style";

/** 音量（0〜1）と、BGM の頭と終わりのフェード（秒） */
const audioSchema = z.object({
  bgmVolume: z.number().min(0).max(1),
  seVolume: z.number().min(0).max(1),
  bgmFadeInSec: z.number().min(0).max(10),
  bgmFadeOutSec: z.number().min(0).max(10),
  /** シーンで曲が変わるときのクロスフェード（秒） */
  bgmCrossSec: z.number().min(0).max(10),
  /** あいさつの曲を、本編おわりの合図からどれだけ遅らせて始めるか（秒） */
  outroBgmDelaySec: z.number().min(0).max(10),
});

export const omoikomiSchema = timingSchema.extend({
  style: styleSchema,
  audio: audioSchema,
  motion: z.object({
    /** 字幕の箱の出入り（不透明度だけ） */
    captionFadeSec: z.number().min(0).max(2),
    /** 寄り・引きの切り替え（話す人が変わって寄り先が移るときも同じ） */
    cameraSec: z.number().min(0).max(3),
    /** 差し込み場面の出入り（背景のぼかしと図） */
    insertSec: z.number().min(0).max(3),
    /** 図が下から入ってくる距離（px） */
    panelDistance: z.number().min(0).max(300),
    /** 図の大きさ（倍率） */
    panelScale: z.number().min(0.3).max(2),
    /** 場所が変わるときの背景のクロスフェード */
    sceneFadeSec: z.number().min(0).max(3),
    /** めたんが見回りに来るときの入り（時間と、右から入ってくる距離 px） */
    enterSec: z.number().min(0).max(3),
    enterDistance: z.number().min(0).max(600),
    /** 本編おわりのあと、3人が左半分へ移る時間 */
    endMoveSec: z.number().min(0).max(5),
    /** 「数日後」の札を見せる長さ */
    telopHoldSec: z.number().min(0).max(10),
    /** まばたきの間隔と、目を閉じている長さ */
    blinkEverySec: z.number().min(0.5).max(20),
    blinkSec: z.number().min(0).max(1),
    /** 字幕1枚あたりの最大文字数（長い台詞は句読点で区切って順に出す） */
    captionMaxChars: z.number().int().min(6).max(60),
    captionMinChars: z.number().int().min(1).max(30),
  }),
});

export type OmoikomiProps = z.infer<typeof omoikomiSchema>;

export const omoikomiDefaults: OmoikomiProps = {
  ...timingDefaults,
  style: styleDefaults,
  // 前の2本で人が書き出しを聞いて決めた値（BGM は台詞が聞き取れるよう小さめ）
  // outroBgmDelaySec は効果音「ちゃんちゃん♪1」の長さ（1.7秒）。トークンではなく素材の長さ
  audio: { bgmVolume: 0.12, seVolume: 0.5, bgmFadeInSec: 1, bgmFadeOutSec: 3, bgmCrossSec: duration.deliberate, outroBgmDelaySec: 1.7 },
  motion: {
    captionFadeSec: duration.fast,
    cameraSec: duration.fast,
    insertSec: duration.base,
    panelDistance: distance.small,
    panelScale: 0.9,
    sceneFadeSec: duration.slow,
    enterSec: duration.base,
    enterDistance: distance.medium,
    endMoveSec: duration.slow,
    telopHoldSec: hold.long,
    // まばたきの間隔は motion-kit にトークンがない（前作の notes.md の motion-kit への提案）
    blinkEverySec: 3.5,
    blinkSec: duration.instant,
    // 字幕の箱1行に収まる文字数（58px、画面幅の58%）に合わせた。前の2本の 18 では「……」付きの台詞が2行に折り返した
    captionMaxChars: 16,
    captionMinChars: 6,
  },
};

export const calculateOmoikomiMetadata: CalculateMetadataFunction<OmoikomiProps> = ({ props }) => ({
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

/** 立ち位置の並び。リビング・洗面台は3人並び、洗濯機置き場は真ん中を空けた並び、終了画面は左半分 */
type Formation = "living" | "laundry" | "end";
const SLOTS: Record<Formation, Record<Speaker, keyof Style["tachieCenterX"]>> = {
  living: { zundamon: "trioLeft", metan: "center", tsumugi: "trioRight" },
  laundry: { zundamon: "nookCenter", metan: "nookLeft", tsumugi: "nookRight" },
  end: { zundamon: "endLeft", metan: "endCenter", tsumugi: "endRight" },
};
const formationOf = (bg: Background): Formation => (bg.startsWith("laundry") ? "laundry" : "living");

/**
 * 画角の区切り。台詞の頭ごとに1つ（台詞の合間は直前の台詞の画角のまま）。
 * タイトル（S2）と、本編おわり以降は引き
 */
type Segment = { at: number; shot: Shot; speaker: Speaker; bg: Background; formation: Formation };

/** 寄りのカメラ（拡大と、ずらす量）。引きは { s: 1, tx: 0, ty: 0 } */
type Camera = { s: number; tx: number; ty: number };
const clampNum = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** 台詞の中で、ことば（marks）を読んだ順に手順を進める。台詞の長さに対する文字の位置で時刻を決める */
const stepAt = (line: PlacedLine | undefined, frame: number, fallback: number) => {
  if (!line) return fallback;
  const entry = INSERT_STEPS.find((s) => s.line === line.index);
  if (!entry) return fallback;
  const t = (frame - line.from) / line.frames;
  return entry.marks.reduce((n, m, i) => {
    const pos = line.text.indexOf(m) / line.text.length;
    return t >= pos ? i + 1 : n;
  }, 1);
};

export const Omoikomi: React.FC<OmoikomiProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { style, motion } = props;
  const { scenes, lines, outroFrom, total } = layout(props);
  const f = (sec: number) => toFrames(sec, fps);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const startOf = (index: number) => lines.find((l) => l.index === index)?.from ?? 0;

  // 画角の区切りの表（台詞の頭・タイトル・本編おわり）
  const segments: Segment[] = [];
  for (const l of lines) {
    if (l.from >= outroFrom) break;
    const bg = backgroundOf(l.scene, l.index);
    segments.push({ at: l.from, shot: shotOf(l.index), speaker: l.speaker, bg, formation: formationOf(bg) });
  }
  const title = scenes.find((s) => s.id === "S2");
  if (title) {
    segments.push({ at: title.from, shot: { kind: "wide" }, speaker: "zundamon", bg: "living", formation: "living" });
  }
  segments.sort((a, b) => a.at - b.at);
  const lastSeg = segments[segments.length - 1];
  segments.push({ ...lastSeg, at: outroFrom, shot: { kind: "wide" }, formation: "end" });

  const segIdx = segments.reduce((n, s, i) => (frame >= s.at ? i : n), 0);
  const seg = segments[segIdx];
  const prevSeg = segments[Math.max(0, segIdx - 1)];

  // 表情は、いちばん最近始まった台詞のもの。話している最中なら口パクする
  const latest = [...lines].reverse().find((l) => l.from <= frame) ?? lines[0];
  const speaking = lines.find((l) => frame >= l.from && frame < l.from + l.frames);

  // 立ち位置（画面幅に対する中心）。終了画面へは、3人並びから左半分へ移る
  const cx = style.tachieCenterX;
  const xOf = (formation: Formation, who: Speaker) => cx[SLOTS[formation][who]];
  const endMove = interpolate(frame - outroFrom, [0, f(motion.endMoveSec)], [0, 1], { ...clamp, easing: easing("standard") });
  const centerOf = (formation: Formation, who: Speaker) =>
    formation === "end" ? xOf("living", who) + (xOf("end", who) - xOf("living", who)) * endMove : xOf(formation, who);

  // めたんは S1 の途中で見回りに来る（それまでの S1 は2人）。S0 の先出しは S7 の一瞬なので3人いる
  const enterAt = startOf(METAN_ENTERS_AT_LINE);
  const s1 = scenes.find((s) => s.id === "S1");
  const metanIn = s1 && frame >= s1.from && frame < enterAt ? 0 : interpolate(frame - enterAt, [0, f(motion.enterSec)], [0, 1], { ...clamp, easing: easing("enter") });

  const tachieFor = (who: Speaker, formation: Formation, opts?: { corner?: boolean }) => {
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
    const flip = FLIP[formation === "laundry" ? "laundry" : "living"][who];
    if (opts?.corner) {
      // 差し込み場面: 話す人だけを右下に小さく残す（styleframe の S3）
      const scale = style.tachieScale[who] * style.insert.cornerScale;
      return (
        <Tachie
          key={`corner-${who}`}
          character={who}
          scale={scale}
          flip={flip}
          pick={pick}
          toggles={exp.toggles}
          style={{ left: width - MANIFESTS[who].width * scale + 40, top: height - 560 }}
        />
      );
    }
    const isMetan = who === "metan";
    const slideIn = isMetan ? (1 - metanIn) * motion.enterDistance : 0;
    if (isMetan && metanIn <= 0) return null;
    // 終了画面へ移るときは、左半分に収まるよう小さくする
    const scale = style.tachieScale[who] * (formation === "end" ? 1 + (style.endScale - 1) * endMove : 1);
    return (
      <Tachie
        key={who}
        character={who}
        scale={scale}
        flip={flip}
        pick={pick}
        toggles={exp.toggles}
        style={{
          left: width * centerOf(formation, who) - (MANIFESTS[who].width * scale) / 2 + slideIn,
          top: style.tachieTop[who] + (formation === "end" ? (1 - scale / style.tachieScale[who]) * style.camera.faceOffsetY : 0),
          opacity: isMetan ? metanIn : 1,
        }}
      />
    );
  };

  // 寄り：話す人の顔が画面の真ん中より少し上に来るように拡大する。背景の外が見えないよう、ずらす量を画面内に収める
  const cameraOf = (s: Segment): Camera => {
    if (s.shot.kind !== "closeUp") return { s: 1, tx: 0, ty: 0 };
    const k = style.camera.closeUpScale;
    const fx = width * xOf(s.formation, s.speaker);
    const fy = style.tachieTop[s.speaker] + style.camera.faceOffsetY;
    return {
      s: k,
      tx: clampNum(width / 2 - fx * k, width - width * k, 0),
      ty: clampNum(height * 0.42 - fy * k, height - height * k, 0),
    };
  };
  const camA = cameraOf(prevSeg);
  const camB = cameraOf(seg);
  const camT = segIdx === 0 ? 1 : interpolate(frame - seg.at, [0, f(motion.cameraSec)], [0, 1], { ...clamp, easing: easing("emphasized") });
  const cam: Camera = { s: camA.s + (camB.s - camA.s) * camT, tx: camA.tx + (camB.tx - camA.tx) * camT, ty: camA.ty + (camB.ty - camA.ty) * camT };

  // 差し込み場面の濃さ（0＝なし、1＝図が主役）。入るときも出るときも motion.insertSec
  const isInsert = (s: Segment) => s.shot.kind === "insert";
  const insertT = interpolate(frame - seg.at, [0, f(motion.insertSec)], [0, 1], clamp);
  let insertAmt = 0;
  let insertKind: Insert | undefined;
  if (isInsert(seg)) {
    insertKind = (seg.shot as { insert: Insert }).insert;
    insertAmt = isInsert(prevSeg) && segIdx > 0 ? 1 : easing("enter")(insertT);
  } else if (isInsert(prevSeg) && segIdx > 0) {
    insertKind = (prevSeg.shot as { insert: Insert }).insert;
    insertAmt = 1 - easing("exit")(insertT);
  }

  // 背景（場所）: 変わったら前の場所の上にクロスフェードで重ねる
  const bgChangeIdx = segments.reduce((n, s, i) => (i <= segIdx && i > 0 && s.bg !== segments[i - 1].bg ? i : n), 0);
  const bgNow = segments[bgChangeIdx];
  const bgPrev = bgChangeIdx > 0 ? segments[bgChangeIdx - 1] : undefined;
  const bgFade = interpolate(frame - bgNow.at, [0, f(motion.sceneFadeSec)], [0, 1], { ...clamp, easing: easing("standard") });

  const stageOf = (bg: Background, formation: Formation) => (
    <AbsoluteFill>
      <Img src={staticFile(`bg/${BACKGROUND_FILES[bg]}`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      {/* めたんは真ん中で一歩奥に立つ（左右の2人の顔を髪で隠さないよう、先に描く） */}
      {(["metan", "zundamon", "tsumugi"] as const).map((who) => tachieFor(who, formation))}
    </AbsoluteFill>
  );

  // 字幕: 話している台詞を区切り、文字数の割合で順に出す。話者の立ち位置の側に置く（寄り・差し込みでは真ん中）
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
    const x = centerOf(seg.formation, speaking.speaker);
    const side = seg.shot.kind !== "wide" ? "center" : x < 0.34 ? "left" : x > 0.66 ? "right" : "center";
    caption = <Caption style={style} speaker={speaking.speaker} side={side} text={text} opacity={opacity} />;
  }

  // 差し込みの図
  let panel: React.ReactNode = null;
  if (insertKind && insertAmt > 0) {
    const stepLine = isInsert(seg) ? latest : undefined;
    let content: React.ReactNode;
    if (insertKind === "screenDoor") content = <ScreenDoorDiagram style={style} step={stepAt(stepLine, frame, 3)} />;
    else if (insertKind === "screenDoorHands") content = <ScreenDoorHands style={style} wrinkled={latest.index < 29} />;
    else if (insertKind === "drain") content = <DrainDiagram style={style} step={stepAt(stepLine, frame, 2)} />;
    else if (insertKind === "manual") content = <ManualPage style={style} step={stepAt(stepLine, frame, 3)} />;
    else content = <ProOrSelf style={style} />;
    panel = (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 36,
          transform: `translate(-50%, ${(1 - insertAmt) * motion.panelDistance}px) scale(${motion.panelScale})`,
          transformOrigin: "top center",
          opacity: insertAmt,
        }}
      >
        {content}
      </div>
    );
  }
  const cornerSpeaker = insertKind && insertAmt > 0 ? (speaking?.speaker ?? latest.speaker) : undefined;

  // タイトル（S2）
  let titleNode: React.ReactNode = null;
  if (title && frame >= title.from && frame < title.from + title.frames) {
    const local = frame - title.from;
    const a = Math.min(
      interpolate(local, [0, f(motion.insertSec)], [0, 1], { ...clamp, easing: easing("enter") }),
      interpolate(title.frames - local, [0, f(motion.cameraSec)], [0, 1], { ...clamp, easing: easing("exit") }),
    );
    titleNode = (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: style.title.top,
          opacity: a,
          transform: `translate(-50%, ${(1 - a) * motion.panelDistance}px)`,
        }}
      >
        <Title style={style} text="「難しそう」は、だいたい思い込み" />
      </div>
    );
  }

  // 「数日後」などの札
  const telops = TELOPS.map((t) => {
    const at = startOf(t.line);
    const a = interpolate(
      frame - at,
      [0, f(motion.cameraSec), f(motion.cameraSec + motion.telopHoldSec), f(motion.cameraSec * 2 + motion.telopHoldSec)],
      [0, 1, 1, 0],
      clamp,
    );
    if (a <= 0) return null;
    return (
      <div key={t.line} style={{ position: "absolute", left: 60, top: 40, opacity: a }}>
        <Telop style={style} text={t.text} color={style.colors.frame} />
      </div>
    );
  });

  // 左半分に収まるよう、作曲者は2人ずつ改行する
  const composers = [...new Set(BGM_CUES.map((c) => c.composer))];
  const bgmCredit = `OpenTracks\n${composers.map((c, i) => c + (i % 2 === 1 ? "\n" : "　")).join("").trim()}`;

  // 終了画面の間（最後の台詞が終わってから）に、クレジットを左下に小さく出す
  const lastLine = lines[lines.length - 1];
  const endFrom = lastLine.from + lastLine.frames;
  const creditsIn = interpolate(frame - endFrom, [0, f(motion.sceneFadeSec)], [0, 1], { ...clamp, easing: easing("standard") });

  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.frame }}>
      <AbsoluteFill style={{ inset: style.frame.width, borderRadius: style.frame.radius, overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            filter: insertAmt > 0 ? `blur(${style.insert.blur * insertAmt}px)` : undefined,
          }}
        >
          <AbsoluteFill style={{ transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`, transformOrigin: "0 0" }}>
            {bgPrev && bgFade < 1 ? stageOf(bgPrev.bg, bgPrev.formation) : null}
            <AbsoluteFill style={{ opacity: bgPrev ? bgFade : 1 }}>{stageOf(bgNow.bg, seg.formation === "end" ? "end" : bgNow.formation)}</AbsoluteFill>
          </AbsoluteFill>
        </AbsoluteFill>
        {insertAmt > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${style.insert.dim * insertAmt})` }} /> : null}
        {panel}
        {cornerSpeaker ? <AbsoluteFill style={{ opacity: insertAmt }}>{tachieFor(cornerSpeaker, seg.formation, { corner: true })}</AbsoluteFill> : null}
        {titleNode}
        {telops}
        {caption}
        {creditsIn > 0 ? (
          <div style={{ position: "absolute", left: 30, bottom: 30, opacity: creditsIn }}>
            <Credits style={style} bgm={bgmCredit} />
          </div>
        ) : null}
      </AbsoluteFill>
      {lines.map((line) => (
        <Sequence key={line.file} from={line.from} durationInFrames={line.frames} layout="none">
          <Html5Audio src={staticFile(`voice/${line.file}`)} />
        </Sequence>
      ))}
      {BGM_CUES.map((cue, i) => {
        // 曲の頭: シーンの頭か、本編おわり（"outro"）の合図が鳴り終わった所
        const startAt = (c: (typeof BGM_CUES)[number]) =>
          c.scene === "outro" ? outroFrom + f(props.audio.outroBgmDelaySec) : scenes.find((x) => x.id === c.scene)?.from;
        const from = startAt(cue);
        if (from === undefined) return null;
        const nextCue = BGM_CUES[i + 1];
        // 本編の曲は、本編おわりの合図の前に消し切る（合図とあいさつを本編から切り離す）
        const end = !nextCue ? total : nextCue.scene === "outro" ? outroFrom : (startAt(nextCue) ?? total) + f(props.audio.bgmCrossSec);
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
      {/* 本編おわりの合図（アニマティック v1 の指摘） */}
      <Sequence from={outroFrom} layout="none">
        <Html5Audio src={staticFile("se/chan-chan1.mp3")} volume={props.audio.seVolume} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** BGM（public/bgm）の1曲分。頭でフェードイン、終わりでフェードアウトし、次の曲と重ねてつなぐ */
const Bgm: React.FC<{ audio: OmoikomiProps["audio"]; fps: number; file: string; gain: number; frames: number; fadeIn: number; fadeOut: number }> = ({
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
