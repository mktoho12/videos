import React from "react";
import { Composition, Still } from "remotion";
import { calculateSoujibiMetadata, Soujibi, soujibiDefaults, soujibiSchema } from "./Soujibi";
import { Thumb } from "./Thumb";
import { ThumbB, ThumbC, ThumbD } from "./ThumbVariants";

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
      <Still id="ThumbB" component={ThumbB} width={1280} height={720} />
      <Still id="ThumbC" component={ThumbC} width={1280} height={720} />
      <Still id="ThumbD" component={ThumbD} width={1280} height={720} />
    </>
  );
};
