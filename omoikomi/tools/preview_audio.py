# 合成した台詞を、間をあけて1本の wav につなぐ（台本の試聴・速さの聞き比べ用）
# 使い方（omoikomi/ で）: python3 -I tools/preview_audio.py <lines.json> <voice のフォルダ> <出力.wav> [行の間の秒数] [シーンの間の秒数]
import json, sys, wave

lines_path, voice_dir, out = sys.argv[1:4]
line_gap = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3
scene_gap = float(sys.argv[5]) if len(sys.argv) > 5 else 0.8
lines = json.load(open(lines_path, encoding="utf-8"))["lines"]

with wave.open(out, "wb") as o:
    prev_scene = None
    for i, l in enumerate(lines):
        with wave.open(f"{voice_dir}/{l['file']}") as w:
            if i == 0:
                o.setparams(w.getparams())
            rate, width = w.getframerate(), w.getsampwidth()
            if i > 0:
                gap = scene_gap if l["scene"] != prev_scene else line_gap
                o.writeframes(b"\0" * int(rate * gap) * width)
            o.writeframes(w.readframes(w.getnframes()))
        prev_scene = l["scene"]
print(out)
