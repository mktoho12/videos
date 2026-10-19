import React from "react";
import { Folder, Still } from "remotion";
import { Styleframe, styleframeScenes, styleframeSchema } from "./Styleframe";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
