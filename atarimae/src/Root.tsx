import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Animatic, animaticDefaults, animaticSchema, calculateAnimaticMetadata } from "./Animatic";
import { Atarimae, atarimaeDefaults, atarimaeSchema, calculateAtarimaeMetadata } from "./Atarimae";
import { Styleframe, styleframeScenes, styleframeSchema } from "./Styleframe";
import { Thumb } from "./Thumb";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Atarimae"
        component={Atarimae}
        schema={atarimaeSchema}
        defaultProps={atarimaeDefaults}
        calculateMetadata={calculateAtarimaeMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Atarimae-Animatic"
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
        {(["S1", "S3", "S7"] as const).map((scene) => (
          <Still
            key={scene}
            id={`Atarimae-SF-${scene}`}
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
