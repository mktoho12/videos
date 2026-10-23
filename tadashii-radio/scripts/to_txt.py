# 使い方: to_txt.py Scribeの結果.json 出力.txt
# 話者が変わるところ、文末、1.5秒以上の無音で行を分ける
import sys, json
r = json.load(open(sys.argv[1]))
names, lines = {}, []
for w in r["words"]:
    if w.get("type") == "audio_event": continue
    sp = names.setdefault(w.get("speaker_id"), f"話者{chr(65+len(names))}")
    t = w["text"]
    if w.get("type") == "spacing":
        if lines: lines[-1][2] += t
        continue
    cur = lines[-1] if lines else None
    if cur and cur[1] == sp and w["start"] - cur[3] < 1.5 and not cur[2].rstrip().endswith(("。", "？", "！", "?", "!")):
        cur[2] += t; cur[3] = w["end"]
    else:
        lines.append([w["start"], sp, t, w["end"]])
with open(sys.argv[2], "w") as f:
    f.write("# ElevenLabs Scribe v2 の文字起こし（未修正）。話者A・B…は自動判別による登場順の仮の名前\n\n")
    for a, sp, t, _ in lines:
        f.write(f"[{int(a//3600)}:{int(a%3600//60):02d}:{int(a%60):02d}] {sp}: {t.strip()}\n")
print(f"まとめ完了 {len(lines)}行 話者={list(names.values())} 言語={r.get('language_code')}")
