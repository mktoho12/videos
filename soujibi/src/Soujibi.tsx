/**
 * 段階4 本実装。アニマティックと同じ時間軸（src/timeline.ts）に、立ち絵・字幕・背景・図を乗せる。
 * 見た目は styleframe.md、画角・背景・登場・場所の文字・名札・テロップは src/shots.ts（段階3 で確認した表）、
 * 表情・効果音・BGM は演出表（src/direction.ts）に従う。
 * hitorigoto の Hitorigoto.tsx を複製し、この動画に合わせた。ナレーション（台詞の話者 narrator）を足した。
 * - 立ち位置はシーンごと（shots.ts の formationOf。S5 はソファーに2人、S6 は夜中の台所にひとり）。だれが画面にいるかは presentAt で決め、出入りはふわっと見せる
 * - 時間が飛ぶ所（shots.ts の TRANSITIONS）は、画面全体を暗くして「次の日」などを真ん中に大きく出す
 * - ずんだもんは「……外したのだ」（台詞24）までヘッドセットをかぶる
 * - S6 の夜中の台所は、背景だけを暗くする（キャラクターは見やすさのため暗くしない）
 * - 字幕は吹き出しの積み上げ（Caption.tsx の StackCaption）。声の進みに合わせて1行ずつ足す
 * - 場所の文字と名札（決め事「毎回、初めて見る人にも舞台と関係が分かるようにする」）
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
import { captionLines, stackStarts, StackCaption } from "./Caption";
import { BGM_CUES, BLINK, BLINK_OFFSET, expressionAt, FLIP, MOUTH_GROUP, SE_CUES } from "./direction";
import { ChoreChart, Credits, NameTag, NarrationText, PlaceLabel, RotationDiagram, Telop, Title, ViewDiagram } from "./Panels";
import { Background, BACKGROUND_FILES, backgroundOf, Formation as SceneFormation, formationOf, Insert, NAME_TAGS, PLACE_LABELS, presentAt, Shot, shotOf, TELOPS, TRANSITIONS } from "./shots";
import { MANIFESTS, Tachie } from "./Tachie";
import { layout, MOUTH_FPS, Speaker, timingDefaults, timingSchema } from "./timeline";
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

export const soujibiSchema = timingSchema.extend({
  style: styleSchema,
  audio: audioSchema,
  motion: z.object({
    /** 字幕の吹き出しの出入り（不透明度と、下から入る距離） */
    captionFadeSec: z.number().min(0).max(2),
    captionDistance: z.number().min(0).max(100),
    /** 寄り・引きの切り替え（話す人が変わって寄り先が移るときも同じ） */
    cameraSec: z.number().min(0).max(3),
    /** 差し込み場面の出入り（背景のぼかしと図） */
    insertSec: z.number().min(0).max(3),
    /** 図が下から入ってくる距離（px） */
    panelDistance: z.number().min(0).max(300),
    /** 場所が変わるときの背景のクロスフェード */
    sceneFadeSec: z.number().min(0).max(3),
    /** 登場・退場（時間と、横から入ってくる距離 px） */
    enterSec: z.number().min(0).max(3),
    enterDistance: z.number().min(0).max(600),
    /** 本編おわりのあと、3人が左半分へ移る時間 */
    endMoveSec: z.number().min(0).max(5),
    /** 場面転換：最後の台詞のあと暗くし始めるまでの間、暗くする・明るくする時間、真ん中の文字の大きさ（px） */
    transitionLeadSec: z.number().min(0).max(3),
    transitionFadeSec: z.number().min(0).max(3),
    /** 暗転中の文字が止まってから、そのまま見せる長さ */
    transitionTextHoldSec: z.number().min(0).max(10),
    transitionFontSize: z.number().min(20).max(300),
    /** 「次の日」の札、場所の文字、名札を見せる長さ */
    telopHoldSec: z.number().min(0).max(10),
    labelHoldSec: z.number().min(0).max(10),
    /** ナレーションの字幕の下に敷く黒の濃さ（0〜1） */
    narrationDim: z.number().min(0).max(1),
    /** ナレーションの写真を、1枚の間にどれだけ寄せる・引くか（倍率の差）と、横へずらす量（px） */
    photoZoom: z.number().min(0).max(0.5),
    photoPan: z.number().min(0).max(300),
    /** まばたきの間隔と、目を閉じている長さ */
    blinkEverySec: z.number().min(0.5).max(20),
    blinkSec: z.number().min(0).max(1),
  }),
});

export type SoujibiProps = z.infer<typeof soujibiSchema>;

export const soujibiDefaults: SoujibiProps = {
  ...timingDefaults,
  style: styleDefaults,
  // 前の動画で人が書き出しを聞いて決めた値（BGM は台詞が聞き取れるよう小さめ）
  // outroBgmDelaySec は効果音「ちゃんちゃん♪1」の長さ（1.7秒）。トークンではなく素材の長さ
  audio: { bgmVolume: 0.12, seVolume: 0.5, bgmFadeInSec: 1, bgmFadeOutSec: 3, bgmCrossSec: duration.deliberate, outroBgmDelaySec: 1.7 },
  motion: {
    captionFadeSec: duration.fast,
    captionDistance: distance.small,
    cameraSec: duration.fast,
    insertSec: duration.base,
    panelDistance: distance.small,
    sceneFadeSec: duration.slow,
    enterSec: duration.base,
    enterDistance: distance.medium,
    endMoveSec: duration.slow,
    // 台詞を言い終えてから一拍置いて暗くする（本実装 v2 の指摘：言い終わらないうちに暗くなった）
    transitionLeadSec: hold.short,
    transitionFadeSec: duration.slow,
    // ユーザーの指定（本実装 v3 の指摘：「文字が静止してから1.8秒くらい」）。トークン（hold.medium 1.5／long 2.5）の間の値
    transitionTextHoldSec: 1.8,
    // トークンにない値。タイトル（80px）より大きく、画面の主役にする
    transitionFontSize: 150,
    telopHoldSec: hold.long,
    // 初めて見る人が読める長さ（styleframe.md の「hold」）
    labelHoldSec: hold.long,
    // トークンにない値。写真の上でも白い文字が読める濃さ
    narrationDim: 0.55,
    // トークンにない値。7〜11秒かけて、動いていると分かるがせわしなくない量（写真は 4:3 を 16:9 に切り出して使う）
    photoZoom: 0.12,
    photoPan: 60,
    // まばたきの間隔は motion-kit にトークンがない（前作の notes.md の motion-kit への提案）
    blinkEverySec: 3.5,
    blinkSec: duration.instant,
  },
};

export const calculateSoujibiMetadata: CalculateMetadataFunction<SoujibiProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, layout(props).total),
  width: 1920,
  height: 1080,
});

/** 立ち位置の並び。本編はシーンごと（shots.ts の formationOf）、終了画面は左半分 */
type Formation = SceneFormation | "end";
const SLOTS: Record<Formation, Record<Speaker, keyof Style["tachieCenterX"]>> = {
  trio: { zundamon: "trioLeft", metan: "center", tsumugi: "trioRight" },
  sofa: { zundamon: "sofaLeft", metan: "center", tsumugi: "sofaRight" },
  solo: { zundamon: "soloLeft", metan: "soloRight", tsumugi: "trioRight" },
  end: { zundamon: "endLeft", metan: "endCenter", tsumugi: "endRight" },
};

/**
 * 画角の区切り。台詞の頭ごとに1つ（台詞の合間は直前の台詞の画角のまま）。
 * タイトル（S2）と、本編おわり以降は引き
 */
type Segment = { at: number; shot: Shot; speaker: Speaker; bg: Background; formation: Formation };

/** 寄りのカメラ（拡大と、ずらす量）。引きは { s: 1, tx: 0, ty: 0 } */
type Camera = { s: number; tx: number; ty: number };
const clampNum = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** S2 のタイトル（動画のタイトルとは別。段階5 で決める） */
export const TITLE = "掃除の日って、\n本当に必要なのだ？";

/** ナレーションの間に見せる写真（public/photo。台詞の順） */
const NARRATION_PHOTOS = ["01-dougu.jpg", "02-sink.jpg", "03-gomi.jpg", "04-shower.jpg"];
/** ナレーションの字幕の改行（意味の切れ目で折る。自動の折り返しだと「がんば／って」のように語の途中で切れた） */
const NARRATION_BREAKS = [
  "月に一度の掃除の日は、たまった汚れを、\nその日だけがんばって落とすための日ではありません。",
  "月に一度、自分がどこを汚しているかを、\n思い出すための日です。",
  "思い出すと、ふだんの使い方が、少し変わります。\nこぼさないように気をつけたり、\nもっと楽にきれいにできる工夫はないか、探してみたり。",
  "そうやって、毎日の暮らしの中で、少しずつきれいにしていく。\nそのための、月に一度なのです。",
];

const NAMES: Record<Speaker, string> = { zundamon: "ずんだもん", metan: "四国めたん", tsumugi: "春日部つむぎ" };


export const Soujibi: React.FC<SoujibiProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { style, motion } = props;
  const { scenes, lines, outroFrom, total } = layout(props);
  const f = (sec: number) => toFrames(sec, fps);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const startOf = (index: number) => lines.find((l) => l.index === index)?.from ?? 0;
  // 場面転換の台詞は、画面が真っ暗になった時点（明るくし始める所）で場面を切り替える。ほかの台詞は頭で切り替える
  const isTransitionLine = (index: number) => TRANSITIONS.some((t) => t.line === index);
  const switchAt = (l: { index: number; from: number }) => (isTransitionLine(l.index) ? l.from - f(motion.transitionFadeSec) : l.from);

  // 画角の区切りの表（台詞の頭・タイトル・本編おわり）
  const segments: Segment[] = [];
  for (const l of lines) {
    if (l.from >= outroFrom) break;
    // ナレーションの台詞は立ち絵を持たないので、画角の話者はずんだもんにしておく（ナレーションは引きのまま）
    const who: Speaker = l.speaker === "narrator" ? "zundamon" : l.speaker;
    segments.push({ at: switchAt(l), shot: shotOf(l.index), speaker: who, bg: backgroundOf(l.scene, l.index), formation: formationOf(l.scene) });
  }
  const title = scenes.find((s) => s.id === "S2");
  if (title) {
    segments.push({ at: title.from, shot: { kind: "wide" }, speaker: "zundamon", bg: "living", formation: "trio" });
  }
  segments.sort((a, b) => a.at - b.at);
  const lastSeg = segments[segments.length - 1];
  segments.push({ ...lastSeg, at: outroFrom, shot: { kind: "wide" }, formation: "end" });

  const segIdx = segments.reduce((n, s, i) => (frame >= s.at ? i : n), 0);
  const seg = segments[segIdx];
  const prevSeg = segments[Math.max(0, segIdx - 1)];

  // 表情は、いちばん最近始まった台詞のもの。話している最中なら口パクする。
  // 場面転換の台詞は、真っ暗になった時点で次の場面の表情に替える（明けてから替わると前の場面のポーズが残って見えた）
  const latest = [...lines].reverse().find((l) => switchAt(l) <= frame) ?? lines[0];
  const speaking = lines.find((l) => frame >= l.from && frame < l.from + l.frames);

  // 立ち位置（画面幅に対する中心）。終了画面へは、3人並びから左半分へ移る
  const cx = style.tachieCenterX;
  const xOf = (formation: Formation, who: Speaker) => cx[SLOTS[formation][who]];
  const endMove = interpolate(frame - outroFrom, [0, f(motion.endMoveSec)], [0, 1], { ...clamp, easing: easing("standard") });
  const centerOf = (formation: Formation, who: Speaker) =>
    formation === "end" ? xOf("trio", who) + (xOf("end", who) - xOf("trio", who)) * endMove : xOf(formation, who);

  // 登場（shots.ts の presentAt）。いるかどうかが変わった台詞の頭から、motion.enterSec でふわっと出入りする
  const presence = (who: Speaker): number => {
    let present = presentAt(1).includes(who);
    let changedAt: number | undefined;
    let changedByTransition = false;
    for (const l of lines) {
      if (switchAt(l) > frame) break;
      const now = presentAt(l.index).includes(who);
      if (now !== present) {
        present = now;
        changedAt = switchAt(l);
        changedByTransition = isTransitionLine(l.index);
      }
    }
    if (changedAt === undefined) return present ? 1 : 0;
    // 場面転換の台詞で変わるときは、暗い間に一度に切り替える（明るくなってから前の場面の人が消えていくのが残像に見えた）
    if (changedByTransition) return present ? 1 : 0;
    const t = interpolate(frame - changedAt, [0, f(motion.enterSec)], [0, 1], { ...clamp, easing: easing(present ? "enter" : "exit") });
    return present ? t : 1 - t;
  };

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
    const flip = FLIP[who];
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
    const amt = presence(who);
    if (amt <= 0) return null;
    // 入ってくる向き：左の人は左から、右と真ん中の人は右から
    const fromLeft = xOf("trio", who) < 0.5;
    const slide = (1 - amt) * motion.enterDistance * (fromLeft ? -1 : 1);
    // 終了画面へ移るときは、左半分に収まるよう小さくする
    const scale = style.tachieScale[who] * (formation === "end" ? 1 + (style.endScale - 1) * endMove : 1);
    const center = width * centerOf(formation, who);
    const top = style.tachieTop[who] + (formation === "end" ? (1 - scale / style.tachieScale[who]) * style.camera.faceOffsetY : 0);
    return (
      <Tachie
        key={who}
        character={who}
        scale={scale}
        flip={flip}
        pick={pick}
        toggles={exp.toggles}
        style={{ left: center - (MANIFESTS[who].width * scale) / 2 + slide, top, opacity: amt }}
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
  const isInsert = (s: Segment): s is Segment & { shot: { kind: "insert"; insert: Insert } } => s.shot.kind === "insert";
  const sameInsert = (a: Segment, b: Segment) => isInsert(a) && isInsert(b) && a.shot.insert === b.shot.insert;
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
  // 場面転換（画面全体が暗い間）で場所が変わるときは、重ねずに切り替える（明るくなったときに前の場所が残らないように）
  const underTransition = TRANSITIONS.some((t) => switchAt({ index: t.line, from: startOf(t.line) }) === bgNow.at);
  const bgFade = underTransition ? 1 : interpolate(frame - bgNow.at, [0, f(motion.sceneFadeSec)], [0, 1], { ...clamp, easing: easing("standard") });

  // 夜中の台所は背景だけを暗くする（本実装 v3 の指摘：キャラクターまで暗いと見づらい）
  const stageOf = (bg: Background, formation: Formation) => (
    <AbsoluteFill>
      <Img
        src={staticFile(`bg/${BACKGROUND_FILES[bg]}`)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {/* めたんは真ん中で一歩奥に立つ（左右の2人の顔を髪で隠さないよう、先に描く） */}
      {(["metan", "zundamon", "tsumugi"] as const).map((who) => tachieFor(who, formation))}
    </AbsoluteFill>
  );

  // 字幕: 話している台詞を1行の吹き出しに分け、声の進みに合わせて積み上げる。話者の立ち位置の側に置く（寄り・差し込みでは真ん中）
  let caption: React.ReactNode = null;
  if (speaking && speaking.speaker !== "narrator") {
    const capLines = captionLines(speaking.text, style.caption.maxLineChars);
    const starts = stackStarts(capLines);
    const progress = (frame - speaking.from) / speaking.frames;
    const visible = Math.max(1, starts.filter((s) => s <= progress).length);
    const fade = f(motion.captionFadeSec);
    const opacity = Math.min(
      interpolate(frame - speaking.from, [0, fade], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(speaking.from + speaking.frames - frame, [0, fade], [0, 1], { extrapolateRight: "clamp" }),
    );
    const x = centerOf(seg.formation, speaking.speaker);
    const side = seg.shot.kind !== "wide" ? "center" : x < 0.34 ? "left" : x > 0.66 ? "right" : "center";
    caption = (
      <StackCaption
        style={style}
        speaker={speaking.speaker as Speaker}
        side={side}
        lines={capLines}
        visible={visible}
        insert={insertAmt > 0}
        opacity={opacity}
        newest={{
          t: interpolate(frame - (speaking.from + starts[visible - 1] * speaking.frames), [0, fade], [0, 1], { ...clamp, easing: easing("enter") }),
          distance: motion.captionDistance,
        }}
      />
    );
  }

  // 差し込みの図
  let panel: React.ReactNode = null;
  if (insertKind && insertAmt > 0) {
    // 同じ図が続く区間（台詞をまたぐ）の中の進み（0〜1）。リビングの図で人が出てくる動きを、区間の長さに合わせる
    const runIdx = isInsert(seg) ? segIdx : segIdx - 1;
    let runStart = runIdx;
    while (runStart > 0 && sameInsert(segments[runStart - 1], segments[runIdx])) runStart--;
    let runEnd = runIdx + 1;
    while (runEnd < segments.length && sameInsert(segments[runEnd], segments[runIdx])) runEnd++;
    const runFrom = segments[runStart].at;
    const runTo = runEnd < segments.length ? segments[runEnd].at : total;
    const runT = interpolate(frame, [runFrom, runTo - f(motion.insertSec)], [0, 1], clamp);
    // 聞こえ方の図の右（リビング）は、その台詞の頭で出す
    const reveal = interpolate(frame - segments[runIdx].at, [0, f(motion.insertSec)], [0, 1], { ...clamp, easing: easing("enter") });
    let content: React.ReactNode;
    void runT;
    void reveal;
    if (insertKind === "chart") content = <ChoreChart style={style} />;
    else if (insertKind === "viewHidden") content = <ViewDiagram style={style} focus="hidden" />;
    else if (insertKind === "viewBoth") content = <ViewDiagram style={style} focus="both" />;
    else content = <RotationDiagram style={style} />;
    panel = (
      <div
        style={{
          position: "absolute",
          left: "45%",
          top: 30,
          transform: `translate(-50%, ${(1 - insertAmt) * motion.panelDistance}px) scale(${style.insert.diagramScale})`,
          transformOrigin: "top center",
          opacity: insertAmt,
        }}
      >
        {content}
      </div>
    );
  }
  const cornerVoice = insertKind && insertAmt > 0 ? (speaking?.speaker ?? latest.speaker) : undefined;
  const cornerSpeaker = cornerVoice === "narrator" ? undefined : cornerVoice;

  // ナレーション：最初のナレーションの台詞の頭から最後の台詞の終わりまで、画面全体を暗くし、真ん中に1台詞ずつ白い文字で出す
  const narr = lines.filter((l) => l.speaker === "narrator");
  let narration: React.ReactNode = null;
  if (narr.length > 0) {
    const s0 = narr[0].from;
    const e1 = narr[narr.length - 1].from + narr[narr.length - 1].frames;
    const fade = f(motion.insertSec);
    const dimA = interpolate(frame, [s0 - fade, s0, e1, e1 + fade], [0, 1, 1, 0], clamp);
    if (dimA > 0) {
      const now = speaking && speaking.speaker === "narrator" ? speaking : undefined;
      const capFade = f(motion.captionFadeSec);
      const textA = now
        ? Math.min(
            interpolate(frame - now.from, [0, capFade], [0, 1], clamp),
            interpolate(now.from + now.frames - frame, [0, capFade], [0, 1], clamp),
          )
        : 0;
      // 写真（ユーザーが撮った掃除まわりの写真を、Gemini で絵に寄せたもの）を、ナレーションの1台詞に1枚、ゆっくり寄せたり引いたりしながら見せる。
      // 次の写真は、台詞の間に motion.sceneFadeSec で重ねて入れ替える
      const xf = f(motion.sceneFadeSec);
      const photos = narr.map((l, i) => {
        const from = i === 0 ? s0 - fade : l.from - xf;
        const to = i === narr.length - 1 ? e1 + fade : narr[i + 1].from;
        const p = interpolate(frame, [from, to], [0, 1], clamp);
        const a = i === 0 ? 1 : interpolate(frame, [from, l.from], [0, 1], { ...clamp, easing: easing("standard") });
        if (frame < from || a <= 0) return null;
        // 偶数番は寄っていき、奇数番は引いていく。横へのずれも交互にする
        const zoom = 1 + motion.photoZoom * (i % 2 === 0 ? p : 1 - p);
        const pan = motion.photoPan * (i % 2 === 0 ? p - 0.5 : 0.5 - p);
        return (
          <AbsoluteFill key={l.file} style={{ opacity: a }}>
            <Img
              src={staticFile(`photo/${NARRATION_PHOTOS[i % NARRATION_PHOTOS.length]}`)}
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translateX(${pan}px) scale(${zoom})` }}
            />
          </AbsoluteFill>
        );
      });
      narration = (
        <AbsoluteFill style={{ opacity: dimA, backgroundColor: style.colors.frame }}>
          {photos}
          {now ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 70 }}>
              <div
                style={{
                  opacity: textA,
                  transform: `translateY(${(1 - textA) * motion.captionDistance}px)`,
                  background: `rgba(0,0,0,${motion.narrationDim})`,
                  borderRadius: style.caption.radius,
                  padding: "22px 44px",
                }}
              >
                <NarrationText style={style} text={NARRATION_BREAKS[narr.indexOf(now)] ?? now.text} />
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      );
    }
  }

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
        <Title style={style} text={TITLE} />
      </div>
    );
  }

  // 出てから消えるまでの濃さ（入り cameraSec、見せる holdSec、出 cameraSec）
  const envelope = (at: number, holdSec: number) =>
    interpolate(
      frame - at,
      [0, f(motion.cameraSec), f(motion.cameraSec + holdSec), f(motion.cameraSec * 2 + holdSec)],
      [0, 1, 1, 0],
      clamp,
    );

  // 「次の日」などの札
  const telops = TELOPS.map((t) => {
    const a = envelope(startOf(t.line), motion.telopHoldSec);
    if (a <= 0) return null;
    return (
      <div key={t.line} style={{ position: "absolute", left: 60, top: 40, opacity: a }}>
        <Telop style={style} text={t.text} color={style.colors.frame} />
      </div>
    );
  });

  // 場所の文字（上の真ん中、上から入る）
  const placeLabels = PLACE_LABELS.map((p) => {
    const a = envelope(startOf(p.line), motion.labelHoldSec);
    if (a <= 0) return null;
    return (
      <div key={p.line} style={{ position: "absolute", inset: 0, opacity: a, transform: `translateY(${(a - 1) * motion.panelDistance}px)` }}>
        <PlaceLabel style={style} place={p.place} detail={p.detail} />
      </div>
    );
  });

  // 名札（引きのときだけ。立ち絵の内側の胸の高さ、下から入る）
  const nameTags =
    seg.shot.kind === "wide" && insertAmt <= 0
      ? NAME_TAGS.map((t) => {
          const a = envelope(startOf(t.line), motion.labelHoldSec) * presence(t.who);
          if (a <= 0) return null;
          const x = centerOf("trio", t.who);
          return (
            <div key={t.who} style={{ position: "absolute", inset: 0, opacity: a, transform: `translateY(${(1 - a) * motion.panelDistance}px)` }}>
              <NameTag
                style={style}
                name={NAMES[t.who]}
                role={t.role}
                color={style.colors[t.who]}
                x={width * x + style.nameTag.offsetX * (x < 0.5 ? 1 : -1)}
                y={style.nameTag.y}
              />
            </div>
          );
        })
      : null;

  // 場面転換: 前のシーンの最後の台詞が終わって（次のシーンの頭）、一拍置いてから暗くし、真ん中に文字を出し、その台詞の頭で明るくし終える
  const transitions = TRANSITIONS.map((t) => {
    const lineAt = startOf(t.line);
    const scene = scenes.find((x) => x.from <= lineAt && lineAt < x.from + x.frames);
    if (!scene) return null;
    const fade = f(motion.transitionFadeSec);
    const darkFrom = scene.from + f(motion.transitionLeadSec);
    const a = interpolate(frame, [darkFrom, darkFrom + fade, lineAt - fade, lineAt], [0, 1, 1, 0], clamp);
    if (a <= 0) return null;
    // 文字は暗くなりきってから出て（fade の半分）、止まってから transitionTextHoldSec 見せ、明るくなり始める前に消える。
    // 台本の「（間 4.2秒）」は、この並び（一拍・暗くする・文字の入り・見せる・文字の出・明るくする）が収まる長さにしてある
    const textIn = darkFrom + fade;
    const textHold = textIn + Math.round(fade / 2);
    const textOut = Math.min(textHold + f(motion.transitionTextHoldSec), lineAt - fade - Math.round(fade / 2));
    const textA = interpolate(frame, [textIn, textHold, textOut, textOut + Math.round(fade / 2)], [0, 1, 1, 0], clamp);
    return (
      <AbsoluteFill key={t.line} style={{ backgroundColor: `rgba(0,0,0,${a})`, alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: textA, transform: `translateY(${(1 - textA) * motion.panelDistance}px)` }}>
          <Telop style={style} text={t.text} color={style.colors.frame} fontSize={motion.transitionFontSize} />
        </div>
      </AbsoluteFill>
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
            <AbsoluteFill style={{ opacity: bgPrev ? bgFade : 1 }}>{stageOf(bgNow.bg, seg.formation)}</AbsoluteFill>
          </AbsoluteFill>
        </AbsoluteFill>
        {insertAmt > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${style.insert.dim * insertAmt})` }} /> : null}
        {panel}
        {cornerSpeaker ? <AbsoluteFill style={{ opacity: insertAmt }}>{tachieFor(cornerSpeaker, seg.formation, { corner: true })}</AbsoluteFill> : null}
        {nameTags}
        {placeLabels}
        {titleNode}
        {telops}
        {caption}
        {narration}
        {transitions}
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
      {/* 本編おわりの合図 */}
      <Sequence from={outroFrom} layout="none">
        <Html5Audio src={staticFile("se/chan-chan1.mp3")} volume={props.audio.seVolume} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** BGM（public/bgm）の1曲分。頭でフェードイン、終わりでフェードアウトし、次の曲と重ねてつなぐ */
const Bgm: React.FC<{ audio: SoujibiProps["audio"]; fps: number; file: string; gain: number; frames: number; fadeIn: number; fadeOut: number }> = ({
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
