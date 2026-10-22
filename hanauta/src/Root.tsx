import React from "react";
import { Composition } from "remotion";
import { calculateHanautaMetadata, Hanauta, hanautaDefaults, hanautaSchema } from "./Hanauta";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Hanauta"
    component={Hanauta}
    schema={hanautaSchema}
    defaultProps={hanautaDefaults}
    calculateMetadata={calculateHanautaMetadata}
    durationInFrames={1}
    fps={30}
    width={1080}
    height={1920}
  />
);
