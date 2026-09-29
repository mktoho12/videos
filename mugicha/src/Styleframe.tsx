/**
 * 段階2 スタイルフレーム。構成案B の代表シーン（S2〜S4）を静止画として組む。
 * 動きはまだ入れない（段階3 アニマティック・段階4 本実装で扱う）。
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { z } from "zod";
import { fontFamily } from "./font";
import { Glass } from "./parts/Glass";
import { HeatWaves } from "./parts/HeatWaves";
import { Pot, POT_EXTENT, POT_VIEWBOX } from "./parts/Pot";
import { styleDefaults, styleSchema } from "./style";

export const styleframeSchema = z.object({
  scene: z.enum(["S2", "S3", "S4"]),
  style: styleSchema,
  /** S3 の補足文 */
  caption: z.string(),
  /** S4 の主メッセージ（行ごと） */
  messageLines: z.array(z.string()).min(1),
});

export type StyleframeProps = z.infer<typeof styleframeSchema>;

export const styleframeDefaults: StyleframeProps = {
  scene: "S2",
  style: styleDefaults,
  caption: "ポットが、外の熱をさえぎっている",
  messageLines: ["ここに、", "冷たい麦茶がある"],
};

const POT_WIDTH = 340;
const potHeight = (w: number) => (w * POT_VIEWBOX.height) / POT_VIEWBOX.width;

/** S2・S3: ポットのまわりから熱が寄ってきて、表面で止まる */
const HeatScene: React.FC<StyleframeProps & { potTop: number; showCaption: boolean }> = ({
  style,
  caption,
  potTop,
  showCaption,
}) => {
  const { width, height } = useVideoConfig();
  const potLeft = (width - POT_WIDTH) / 2;
  const scale = POT_WIDTH / POT_VIEWBOX.width;
  const h = potHeight(POT_WIDTH);
  // 波が止まる位置: 注ぎ口・取っ手の外側に少し間をあける
  const gap = 14;
  const rows = [0.45, 0.65, 0.85].map((r) => potTop + h * r);
  return (
    <>
      <HeatWaves
        colors={style.colors}
        width={width}
        height={height}
        rows={rows}
        startLeft={160}
        startRight={width - 160}
        stopLeft={potLeft + POT_EXTENT.left * scale - gap}
        stopRight={potLeft + POT_EXTENT.right * scale + gap}
      />
      <Pot
        colors={style.colors}
        width={POT_WIDTH}
        style={{ position: "absolute", left: potLeft, top: potTop }}
      />
      {showCaption ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: potTop + h + 70,
            textAlign: "center",
            fontFamily,
            fontWeight: 500,
            fontSize: style.type.captionSize,
            letterSpacing: `${style.type.letterSpacing}em`,
            color: style.colors.textSub,
          }}
        >
          {caption}
        </div>
      ) : null}
    </>
  );
};

/** S4: ポットとグラス、主メッセージ */
const MessageScene: React.FC<StyleframeProps> = ({ style, messageLines }) => {
  const { height } = useVideoConfig();
  const potWidth = 300;
  const glassWidth = 190;
  const baseline = height / 2 + 250;
  const potLeft = 217;
  const glassLeft = potLeft + potWidth + 30;
  return (
    <>
      <Pot
        colors={style.colors}
        width={potWidth}
        style={{ position: "absolute", left: potLeft, top: baseline - potHeight(potWidth) }}
      />
      <Glass
        colors={style.colors}
        width={glassWidth}
        style={{ position: "absolute", left: glassLeft, top: baseline - (glassWidth * 240) / 180 }}
      />
      <div
        style={{
          position: "absolute",
          left: glassLeft + glassWidth + 130,
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
        {messageLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </>
  );
};

export const Styleframe: React.FC<StyleframeProps> = (props) => {
  const { height } = useVideoConfig();
  const h = potHeight(POT_WIDTH);
  return (
    <AbsoluteFill style={{ backgroundColor: props.style.colors.background }}>
      {props.scene === "S2" ? (
        <HeatScene {...props} potTop={(height - h) / 2} showCaption={false} />
      ) : null}
      {props.scene === "S3" ? <HeatScene {...props} potTop={130} showCaption /> : null}
      {props.scene === "S4" ? <MessageScene {...props} /> : null}
    </AbsoluteFill>
  );
};
