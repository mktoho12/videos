import React from "react";
import { Composition, Still } from "remotion";
import { calculateSoujibiMetadata, Soujibi, soujibiDefaults, soujibiSchema } from "./Soujibi";
import { Thumb } from "./Thumb";

// soujibi は「寝るまでに公開」（ユーザー）のため、スタイルフレームとアニマティックのコンポジションを外し、本実装の静止画と下書きの書き出しで確かめる（notes.md）
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Soujibi"
        component={Soujibi}
        schema={soujibiSchema}
        defaultProps={soujibiDefaults}
        calculateMetadata={calculateSoujibiMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Still id="Thumb" component={Thumb} width={1280} height={720} />
    </>
  );
};
