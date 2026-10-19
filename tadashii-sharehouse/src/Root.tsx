import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Animatic, animaticDefaults, animaticSchema, calculateAnimaticMetadata } from "./Animatic";
import { calculatePuddingMetadata, Pudding, puddingDefaults, puddingSchema } from "./Pudding";
import { Styleframe, styleframeScenes, styleframeSchema } from "./Styleframe";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Pudding"
        component={Pudding}
        schema={puddingSchema}
        defaultProps={puddingDefaults}
        calculateMetadata={calculatePuddingMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Pudding-Animatic"
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
        {(["S3", "S4", "S7"] as const).map((scene) => (
          <Still
            key={scene}
            id={`Pudding-SF-${scene}`}
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
