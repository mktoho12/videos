# PSDTool 形式の立ち絵 PSD を、レイヤーごとの PNG と manifest.json に書き出す。
# 使い方: extract_psd.py 入力.psd 出力ディレクトリ
# manifest の nodes は PSD の重なり順（下から上）。グループ名の先頭の "!" は常に表示、"*" は同じグループ内で1つだけ選ぶ（PSDTool の決まり）。
import json, os, sys
from psd_tools import PSDImage

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
psd = PSDImage.open(src)
count = 0

def walk(group):
    global count
    nodes = []
    for layer in group:
        node = {
            "name": layer.name,
            "visible": layer.visible,
            "opacity": round(layer.opacity / 255, 3),
            "blend": str(layer.blend_mode).split(".")[-1].lower(),
            "clipping": bool(layer.clipping_layer),
        }
        if layer.is_group():
            node["children"] = walk(layer)
        else:
            image = layer.topil()
            if image is None:
                continue
            count += 1
            file = f"{count:03d}.png"
            image.save(os.path.join(out, file))
            node.update(file=file, left=layer.left, top=layer.top, width=layer.width, height=layer.height)
        nodes.append(node)
    return nodes

manifest = {"width": psd.width, "height": psd.height, "nodes": walk(psd)}
with open(os.path.join(out, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=1)
print(f"{count} layers -> {out}")
