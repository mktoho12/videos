import React from "react";
import { Composition, Folder, Still } from "remotion";
import {
  Animatic,
  animaticDefaults,
  animaticSchema,
  calculateAnimaticMetadata,
} from "./Animatic";
import { calculateMugichaMetadata, Mugicha, mugichaDefaults, mugichaSchema } from "./Mugicha";
import { Styleframe, styleframeDefaults, styleframeSchema } from "./Styleframe";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Mugicha"
        component={Mugicha}
        schema={mugichaSchema}
        defaultProps={mugichaDefaults}
        calculateMetadata={calculateMugichaMetadata}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Mugicha-Animatic"
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
        {(["S2", "S3", "S4"] as const).map((scene) => (
          <Still
            key={scene}
            id={`Mugicha-SF-${scene}`}
            component={Styleframe}
            schema={styleframeSchema}
            defaultProps={{ ...styleframeDefaults, scene }}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>
    </>
  );
};
