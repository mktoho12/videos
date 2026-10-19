import React from "react";
import { Composition, Folder, Still } from "remotion";
import { calculateNabeMetadata, Nabe, nabeDefaults, nabeSchema } from "./Nabe";
import { Animatic, animaticDefaults, animaticSchema, calculateAnimaticMetadata } from "./Animatic";
import { Styleframe, styleframeScenes, styleframeSchema } from "./Styleframe";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Nabe"
        component={Nabe}
        schema={nabeSchema}
        defaultProps={nabeDefaults}
        calculateMetadata={calculateNabeMetadata}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Nabe-Animatic"
        component={Animatic}
        schema={animaticSchema}
        defaultProps={animaticDefaults}
        calculateMetadata={calculateAnimaticMetadata}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Styleframes">
        {(["S1", "S3", "S5"] as const).map((scene) => (
          <Still
            key={scene}
            id={`Nabe-SF-${scene}`}
            component={Styleframe}
            schema={styleframeSchema}
            defaultProps={styleframeScenes[scene]}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>
    </>
  );
};
