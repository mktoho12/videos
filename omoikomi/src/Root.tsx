import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Animatic, animaticDefaults, animaticSchema, calculateAnimaticMetadata } from "./Animatic";
import { calculateOmoikomiMetadata, Omoikomi, omoikomiDefaults, omoikomiSchema } from "./Omoikomi";
import { Styleframe, styleframeScenes, styleframeSchema } from "./Styleframe";
import { Thumb } from "./Thumb";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Omoikomi"
        component={Omoikomi}
        schema={omoikomiSchema}
        defaultProps={omoikomiDefaults}
        calculateMetadata={calculateOmoikomiMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Omoikomi-Animatic"
        component={Animatic}
        schema={animaticSchema}
        defaultProps={animaticDefaults}
        calculateMetadata={calculateAnimaticMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Still id="Thumb" component={Thumb} width={1280} height={720} />
      <Folder name="Styleframes">
        {(["S1", "S3", "S7", "S7B"] as const).map((scene) => (
          <Still
            key={scene}
            id={`Omoikomi-SF-${scene}`}
            component={Styleframe}
            schema={styleframeSchema}
            defaultProps={styleframeScenes[scene]}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>
    </>
  );
};
