import React from "react";
import { Composition } from "remotion";
import { calculateYattoitaMetadata, Yattoita, yattoitaDefaults, yattoitaSchema } from "./Yattoita";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Yattoita"
    component={Yattoita}
    schema={yattoitaSchema}
    defaultProps={yattoitaDefaults}
    calculateMetadata={calculateYattoitaMetadata}
    durationInFrames={1}
    fps={30}
    width={1080}
    height={1920}
  />
);
