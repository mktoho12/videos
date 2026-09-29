/**
 * 段階4 本実装。構成案B（structure.md）に、段階2のスタイル（style.ts）と動きの文法（styleframe.md）を当てる。
 * 秒数・距離・イージング・色・サイズはすべて props。既定値は motion-kit のトークン。
 */
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { distance, duration, hold, scaleDistance, stagger, toFrames } from "motion-kit/src/tokens";
import { fontFamily } from "./font";
import { mix, progress, tweenSchema } from "./motion";
import { Glass, GLASS_VIEWBOX } from "./parts/Glass";
import { HeatWaves } from "./parts/HeatWaves";
import { Pot, POT_EXTENT, POT_VIEWBOX } from "./parts/Pot";
import { styleDefaults, styleSchema } from "./style";

export const mugichaSchema = z.object({
  fps: z.number().int().min(12).max(60),
  /** シーンの長さ（秒）。段階3で確定した値 */
  scenes: z.object({
    s1: z.number().min(0.1).max(30),
    s2: z.number().min(0.1).max(30),
    s3: z.number().min(0.1).max(30),
    s4: z.number().min(0.1).max(30),
    s5: z.number().min(0.1).max(30),
  }),
  style: styleSchema,
  caption: z.string(),
  messageLines: z.array(z.string()).min(1),
  layout: z.object({
    /** S1〜S3 のポットの幅（px） */
    potWidthLarge: z.number().min(50).max(1000),
    /** S4 のポットの幅（px） */
    potWidthSmall: z.number().min(50).max(1000),
    /** S3 でポットを上げたときの上端（px） */
    s3PotTop: z.number().min(0).max(1080),
    /** S3 の補足文とポットの間（px） */
    captionGap: z.number().min(0).max(400),
    /** S4 の左余白（px） */
    s4Left: z.number().min(0).max(1920),
    /** S4 のポット・グラスの底の位置（画面中央からの下方向 px） */
    s4Baseline: z.number().min(-540).max(540),
    glassWidth: z.number().min(20).max(800),
    /** ポットとグラスの間（px） */
    potGlassGap: z.number().min(0).max(400),
    /** グラスとメッセージの間（px） */
    glassMessageGap: z.number().min(0).max(600),
    /** 熱の波の、画面端からの始点（px） */
    wavesEdgeInset: z.number().min(0).max(900),
    /** 熱の波が止まる位置と、ポットの表面との間（px） */
    wavesGap: z.number().min(0).max(200),
    /** 熱の波の高さ（ポットの高さに対する割合） */
    wavesRows: z.array(z.number().min(0).max(1)).min(1),
  }),
  motion: z.object({
    /** 入りの移動距離（px、短辺1080基準） */
    enterDistance: z.number().min(0).max(400),
    /** S1: ポットが現れる */
    potEnter: tweenSchema,
    /** S2: 熱の波が伸びてくる（行ごとに waveStaggerSec ずつずらす） */
    wavesIn: tweenSchema,
    waveStaggerSec: z.number().min(0).max(2),
    /** 熱の波が流れる速さ（周期/秒）。linear に流れ続ける */
    wavesFlowPerSec: z.number().min(0).max(5),
    /** S3: ポットと波が上へ寄る */
    potToS3: tweenSchema,
    /** S3: 補足文が入る */
    captionEnter: tweenSchema,
    /** S4 冒頭: 補足文と熱の波が消える */
    s3Exit: tweenSchema,
    /** S4: ポットが左へ寄って小さくなる */
    potToS4: tweenSchema,
    /** S4: グラスが入る */
    glassEnter: tweenSchema,
    /** S4: メッセージが入る（行ごとに messageStaggerSec ずつずらす） */
    messageEnter: tweenSchema,
    messageStaggerSec: z.number().min(0).max(2),
    /** S5: 全体が背景だけに戻る */
    outro: tweenSchema,
  }),
});

export type MugichaProps = z.infer<typeof mugichaSchema>;

export const mugichaDefaults: MugichaProps = {
  fps: 30,
  scenes: { s1: 1.5, s2: 2.5, s3: 4.0, s4: 6.0, s5: 1.0 },
  style: styleDefaults,
  caption: "ポットが、外の熱をさえぎっている",
  messageLines: ["ここに、", "冷たい麦茶がある"],
  layout: {
    potWidthLarge: 340,
    potWidthSmall: 300,
    s3PotTop: 130,
    captionGap: 70,
    s4Left: 217,
    s4Baseline: 250,
    glassWidth: 190,
    potGlassGap: 30,
    glassMessageGap: 130,
    wavesEdgeInset: 160,
    wavesGap: 14,
    wavesRows: [0.45, 0.65, 0.85],
  },
  motion: {
    enterDistance: distance.small,
    potEnter: { delaySec: hold.beat, durSec: duration.slow, easing: "enter" },
    wavesIn: { delaySec: 0, durSec: duration.deliberate, easing: "enter" },
    waveStaggerSec: stagger.loose,
    wavesFlowPerSec: 0.5,
    potToS3: { delaySec: 0, durSec: duration.slow, easing: "standard" },
    captionEnter: { delaySec: duration.slow, durSec: duration.base, easing: "enter" },
    s3Exit: { delaySec: 0, durSec: duration.base, easing: "exit" },
    potToS4: { delaySec: 0, durSec: duration.slow, easing: "standard" },
    glassEnter: { delaySec: duration.base, durSec: duration.base, easing: "enter" },
    messageEnter: { delaySec: duration.base + stagger.loose, durSec: duration.base, easing: "enter" },
    messageStaggerSec: stagger.loose,
    outro: { delaySec: 0, durSec: duration.slow, easing: "exit" },
  },
};

const totalSec = (s: MugichaProps["scenes"]) => s.s1 + s.s2 + s.s3 + s.s4 + s.s5;

export const calculateMugichaMetadata: CalculateMetadataFunction<MugichaProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.max(1, toFrames(totalSec(props.scenes), props.fps)),
  width: 1920,
  height: 1080,
});

const potHeight = (w: number) => (w * POT_VIEWBOX.height) / POT_VIEWBOX.width;
const glassHeight = (w: number) => (w * GLASS_VIEWBOX.height) / GLASS_VIEWBOX.width;

export const Mugicha: React.FC<MugichaProps> = ({ scenes, style, caption, messageLines, layout, motion }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const dist = scaleDistance(motion.enterDistance, { width, height });

  // シーンの開始秒
  const t2 = scenes.s1;
  const t3 = t2 + scenes.s2;
  const t4 = t3 + scenes.s3;
  const t5 = t4 + scenes.s4;

  const pPotIn = progress(frame, fps, 0, motion.potEnter);
  const pToS3 = progress(frame, fps, t3, motion.potToS3);
  const pCaption = progress(frame, fps, t3, motion.captionEnter);
  const pS3Exit = progress(frame, fps, t4, motion.s3Exit);
  const pToS4 = progress(frame, fps, t4, motion.potToS4);
  const pGlass = progress(frame, fps, t4, motion.glassEnter);
  const pOutro = progress(frame, fps, t5, motion.outro);

  // ポットの位置と大きさ: S2（中央）→ S3（上へ）→ S4（左へ寄って小さく）
  const wL = layout.potWidthLarge;
  const wS = layout.potWidthSmall;
  const baseline = height / 2 + layout.s4Baseline;
  const s2 = { x: (width - wL) / 2, y: (height - potHeight(wL)) / 2, w: wL };
  const s3 = { x: s2.x, y: layout.s3PotTop, w: wL };
  const s4 = { x: layout.s4Left, y: baseline - potHeight(wS), w: wS };
  const pot = {
    x: mix(mix(s2.x, s3.x, pToS3), s4.x, pToS4),
    y: mix(mix(s2.y, s3.y, pToS3), s4.y, pToS4) + (1 - pPotIn) * dist,
    w: mix(wL, wS, pToS4),
  };
  const potScale = pot.w / POT_VIEWBOX.width;
  const potH = potHeight(pot.w);

  // 熱の波: 行ごとにずらして伸びる。位相は linear に流れ続ける
  const reach = layout.wavesRows.map((_, i) =>
    progress(frame, fps, t2, motion.wavesIn, i * motion.waveStaggerSec),
  );
  const phase = (frame / fps) * motion.wavesFlowPerSec;

  const glassLeft = s4.x + wS + layout.potGlassGap;
  const messageLeft = glassLeft + layout.glassWidth + layout.glassMessageGap;

  return (
    <AbsoluteFill style={{ backgroundColor: style.colors.background }}>
      <AbsoluteFill style={{ opacity: 1 - pOutro }}>
        <HeatWaves
          colors={style.colors}
          width={width}
          height={height}
          rows={layout.wavesRows.map((r) => pot.y + potH * r)}
          startLeft={layout.wavesEdgeInset}
          startRight={width - layout.wavesEdgeInset}
          stopLeft={pot.x + POT_EXTENT.left * potScale - layout.wavesGap}
          stopRight={pot.x + POT_EXTENT.right * potScale + layout.wavesGap}
          reach={reach}
          phase={phase}
          opacity={1 - pS3Exit}
        />
        <Pot
          colors={style.colors}
          width={pot.w}
          style={{ position: "absolute", left: pot.x, top: pot.y, opacity: pPotIn }}
        />
        {/* S3 の補足文 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: s3.y + potHeight(wL) + layout.captionGap + (1 - pCaption) * dist,
            textAlign: "center",
            fontFamily,
            fontWeight: 500,
            fontSize: style.type.captionSize,
            letterSpacing: `${style.type.letterSpacing}em`,
            color: style.colors.textSub,
            opacity: pCaption * (1 - pS3Exit),
          }}
        >
          {caption}
        </div>
        {/* S4 のグラス */}
        <Glass
          colors={style.colors}
          width={layout.glassWidth}
          style={{
            position: "absolute",
            left: glassLeft,
            top: baseline - glassHeight(layout.glassWidth) + (1 - pGlass) * dist,
            opacity: pGlass,
          }}
        />
        {/* S4 のメッセージ */}
        <div
          style={{
            position: "absolute",
            left: messageLeft,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontFamily,
            fontWeight: 700,
            fontSize: style.type.messageSize,
            lineHeight: 1.45,
            letterSpacing: `${style.type.letterSpacing}em`,
            color: style.colors.text,
          }}
        >
          {messageLines.map((line, i) => {
            const p = progress(frame, fps, t4, motion.messageEnter, i * motion.messageStaggerSec);
            return (
              <div key={`${i}-${line}`} style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px)` }}>
                {line}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
