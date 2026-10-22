import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Animatic, animaticDefaults, animaticSchema, calculateAnimaticMetadata } from "./Animatic";
import { calculateHitorigotoMetadata, Hitorigoto, hitorigotoDefaults, hitorigotoSchema } from "./Hitorigoto";
import { Styleframe, styleframeScenes, styleframeSchema } from "./Styleframe";
import { Thumb } from "./Thumb";
import { ThumbA, ThumbB } from "./ThumbAB";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Hitorigoto"
        component={Hitorigoto}
        schema={hitorigotoSchema}
        defaultProps={hitorigotoDefaults}
        calculateMetadata={calculateHitorigotoMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Hitorigoto-Animatic"
        component={Animatic}
        schema={animaticSchema}
        defaultProps={animaticDefaults}
        calculateMetadata={calculateAnimaticMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Styleframes">
        {(["S1", "S3", "S4"] as const).map((scene) => (
          <Still
            key={scene}
            id={`Hitorigoto-SF-${scene}`}
            component={Styleframe}
            schema={styleframeSchema}
            defaultProps={styleframeScenes[scene]}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>
      <Still id="Thumb" component={Thumb} width={1280} height={720} />
      <Still id="ThumbA" component={ThumbA} width={1280} height={720} />
      <Still id="ThumbB" component={ThumbB} width={1280} height={720} />
    </>
  );
};
