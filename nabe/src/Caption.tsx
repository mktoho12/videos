import React from "react";
import { fontFamily } from "./font";
import { Character } from "./Tachie";
import { Style } from "./style";

/** 字幕: 話者の側の範囲（画面幅の regionRatio）に収め、その中で中央に寄せる。長ければ折り返す。
 * side が center のときは、画面の中央に同じ幅の範囲を取る（3人並びの真ん中の話者） */
export const Caption: React.FC<{
  style: Style;
  speaker: Character;
  side: "left" | "right" | "center";
  text: string;
  opacity?: number;
}> = ({ style, speaker, side, text, opacity = 1 }) => {
  const { caption, colors } = style;
  return (
    <div
      style={{
        position: "absolute",
        bottom: caption.bottom,
        ...(side === "center" ? { left: `${(1 - caption.regionRatio) * 50}%` } : { [side]: caption.margin }),
        width: `${caption.regionRatio * 100}%`,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          background: colors.captionFill,
          color: colors.captionText,
          border: `${caption.border}px solid ${colors[speaker]}`,
          borderRadius: caption.radius,
          padding: `${caption.paddingY}px ${caption.paddingX}px`,
          fontFamily,
          fontWeight: 800,
          fontSize: caption.fontSize,
          lineHeight: 1.25,
          textAlign: "center",
          boxShadow: "0 6px 0 rgba(0,0,0,0.18)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
