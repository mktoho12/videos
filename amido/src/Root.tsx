import React from "react";
import { Composition } from "remotion";
import { Amido, amidoDefaults, amidoSchema, calculateAmidoMetadata } from "./Amido";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Amido"
    component={Amido}
    schema={amidoSchema}
    defaultProps={amidoDefaults}
    calculateMetadata={calculateAmidoMetadata}
    durationInFrames={1}
    fps={30}
    width={1080}
    height={1920}
  />
);
