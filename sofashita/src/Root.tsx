import React from "react";
import { Composition } from "remotion";
import { calculateSofashitaMetadata, Sofashita, sofashitaDefaults, sofashitaSchema } from "./Sofashita";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Sofashita"
    component={Sofashita}
    schema={sofashitaSchema}
    defaultProps={sofashitaDefaults}
    calculateMetadata={calculateSofashitaMetadata}
    durationInFrames={1}
    fps={30}
    width={1080}
    height={1920}
  />
);
