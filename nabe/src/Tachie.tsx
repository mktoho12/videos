/**
 * PSDTool 形式の立ち絵を、tools/extract_psd.py が書き出したレイヤー PNG から組み立てる。
 * - グループ名の先頭 "!" は常に表示、"*" の付いた子は同じグループ内で1つだけ表示する
 * - pick: グループ名（"!" "*" を除いた名前）→ 表示する子の名前（"*" を除く）。指定がなければ PSD の既定
 * - toggles: 印のないレイヤー（汗・涙・かげりなど）の表示を名前で上書きする
 * - 名前の末尾 ":flipx" のレイヤーは、左右反転したときに元のレイヤーの代わりに出す（PSDTool の決まり。
 *   サイドテールやほくろのように左右が非対称な部品が、反転しても正しい側に来る）
 */
import React from "react";
import { Img, staticFile } from "remotion";
import metanManifest from "../public/tachie/metan/manifest.json";
import tsumugiManifest from "../public/tachie/tsumugi/manifest.json";
import zundamonManifest from "../public/tachie/zundamon/manifest.json";

type Node = {
  name: string;
  visible: boolean;
  opacity: number;
  blend: string;
  children?: Node[];
  file?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
};
type Manifest = { width: number; height: number; nodes: Node[] };

export const MANIFESTS = {
  zundamon: zundamonManifest as Manifest,
  metan: metanManifest as Manifest,
  tsumugi: tsumugiManifest as Manifest,
};
export type Character = keyof typeof MANIFESTS;

export type TachieProps = {
  character: Character;
  /** 1 なら PSD の原寸 */
  scale: number;
  /** 左右反転 */
  flip?: boolean;
  pick?: Record<string, string>;
  toggles?: Record<string, boolean>;
  style?: React.CSSProperties;
};

const FLIPX = ":flipx";
const bare = (name: string) => name.replace(/^[!*]/, "").replace(FLIPX, "");

export const Tachie: React.FC<TachieProps> = ({ character, scale, flip = false, pick = {}, toggles = {}, style }) => {
  const manifest = MANIFESTS[character];
  const layers: React.ReactNode[] = [];

  const walk = (nodes: Node[], groupName: string) => {
    const radio = nodes.filter((n) => n.name.startsWith("*"));
    const wanted = pick[groupName];
    const chosen =
      radio.find((n) => bare(n.name) === wanted) ?? radio.find((n) => n.visible) ?? undefined;
    for (const node of nodes) {
      // 反転していないときは :flipx 版を、反転しているときは :flipx 版のある元のレイヤーを飛ばす
      const isFlipx = node.name.endsWith(FLIPX);
      if (isFlipx !== flip && (isFlipx || nodes.some((n) => n.name === node.name + FLIPX))) continue;
      let shown: boolean;
      if (node.name.startsWith("!")) shown = true;
      else if (node.name.startsWith("*")) shown = node === chosen;
      else shown = toggles[node.name] ?? node.visible;
      if (!shown) continue;
      if (node.children) {
        walk(node.children, bare(node.name));
      } else if (node.file) {
        layers.push(
          <Img
            key={node.file}
            src={staticFile(`tachie/${character}/${node.file}`)}
            style={{
              position: "absolute",
              left: node.left,
              top: node.top,
              width: node.width,
              height: node.height,
              opacity: node.opacity,
              mixBlendMode: node.blend === "multiply" ? "multiply" : undefined,
            }}
          />,
        );
      }
    }
  };
  walk(manifest.nodes, "");

  return (
    <div
      style={{
        position: "absolute",
        width: manifest.width * scale,
        height: manifest.height * scale,
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: manifest.width,
          height: manifest.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          isolation: "isolate",
        }}
      >
        {layers}
      </div>
    </div>
  );
};
