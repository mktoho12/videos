// https://www.remotion.dev/docs/config
import path from "path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// motion-kit は file: で symlink 参照している。symlink の実体（../motion-kit）側から
// remotion / react を解決すると motion-kit の node_modules の別インスタンスを掴むので、
// こちらの node_modules に寄せる。
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      remotion: path.resolve(process.cwd(), "node_modules/remotion"),
      react: path.resolve(process.cwd(), "node_modules/react"),
      "react-dom": path.resolve(process.cwd(), "node_modules/react-dom"),
    },
  },
}));
