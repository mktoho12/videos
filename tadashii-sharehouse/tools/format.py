"""ElevenLabs Scribe の結果（JSON）を「[分:秒] 話者: 発言」の行にする。
使い方: python3 format.py result.json > transcript.txt
同じ話者の発言が続く間は1行にまとめ、話者が替わったら行を改める。
"""
import json
import sys

data = json.load(open(sys.argv[1]))
rows = []  # [話者, 開始秒, 文字列]
for w in data["words"]:
    if w.get("type") == "audio_event":
        continue
    spk = w.get("speaker_id") or "?"
    if rows and rows[-1][0] == spk:
        rows[-1][2] += w["text"]
    elif w.get("type") == "spacing":
        if rows:
            rows[-1][2] += w["text"]
    else:
        rows.append([spk, w.get("start") or 0, w["text"]])

for spk, start, text in rows:
    m, s = divmod(int(start), 60)
    print(f"[{m:02d}:{s:02d}] {spk}: {text.strip()}")
