// https://www.remotion.dev/docs/config
import path from "path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// 書き出しの既定（docs/workflow.md 段階6）。
// Remotion の既定のピクセル形式は yuvj420p（フルレンジ）で、テレビなどで色がずれることがあるため指定する。
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");

// 制作中は motion-kit を file: で symlink 参照する。symlink の実体（motion-kit）側から
// remotion / react を解決すると motion-kit の node_modules の別インスタンスを掴むので、
// この動画の node_modules に寄せる。タグ固定（git+file:）後も害はないので残してよい。
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
