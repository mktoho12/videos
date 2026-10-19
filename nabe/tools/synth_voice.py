# script.md の台詞を VOICEVOX（localhost:50021）で1行ずつ合成する。
# 出力: public/voice/NNN.wav（git に入れない）と src/lines.json（シーンと行ごとの長さ・口パク）
# 口パク: FPS ごとの区間の音量（RMS）が、その行の最大の MOUTH_THRESHOLD 倍を超えたら口を開ける（"1"）
# 使い方（nabe/ で）: python3 -I tools/synth_voice.py
import array, json, math, os, re, urllib.parse, urllib.request, wave

SPEAKERS = {"ずんだもん": ("zundamon", 3), "めたん": ("metan", 2), "つむぎ": ("tsumugi", 8)}
SCRIPT, VOICE_DIR, OUT = "script.md", "public/voice", "src/lines.json"
FPS = 30  # Animatic / 本実装のコンポジションと同じ
MOUTH_THRESHOLD = 0.2


def mouth_track(path):
    with wave.open(path) as w:
        rate, samples = w.getframerate(), array.array("h", w.readframes(w.getnframes()))
    step = rate // FPS
    rms = [math.sqrt(sum(x * x for x in samples[i:i + step]) / max(1, len(samples[i:i + step])))
           for i in range(0, len(samples), step)]
    peak = max(rms) or 1
    return "".join("1" if r > peak * MOUTH_THRESHOLD else "0" for r in rms)


def post(path, data=None):
    req = urllib.request.Request("http://localhost:50021" + path, data=data, method="POST",
                                 headers={"Content-Type": "application/json"})
    return urllib.request.urlopen(req).read()


os.makedirs(VOICE_DIR, exist_ok=True)
scenes, lines = [], []
for raw in open(SCRIPT, encoding="utf-8"):
    m = re.match(r"## (S\d+) (.+?)（目安 (\d+)秒）", raw)
    if m:
        scenes.append({"id": m.group(1), "label": m.group(2), "targetSec": int(m.group(3))})
        continue
    m = re.match(r"(ずんだもん|めたん|つむぎ): (.+)", raw.strip())
    if not (m and scenes):
        continue
    speaker, speaker_id = SPEAKERS[m.group(1)]
    text = re.sub(r"（[^）]*）", "", m.group(2)).strip()  # （）は演技・画面のメモで読まない
    query = post("/audio_query?" + urllib.parse.urlencode({"speaker": speaker_id, "text": text}))
    file = f"{len(lines) + 1:03d}.wav"
    with open(os.path.join(VOICE_DIR, file), "wb") as f:
        f.write(post(f"/synthesis?speaker={speaker_id}", query))
    with wave.open(os.path.join(VOICE_DIR, file)) as w:
        seconds = w.getnframes() / w.getframerate()
    lines.append({"scene": scenes[-1]["id"], "speaker": speaker, "text": text,
                  "kana": json.loads(query)["kana"], "file": file, "durationSec": round(seconds, 3),
                  "mouth": mouth_track(os.path.join(VOICE_DIR, file))})

with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"scenes": scenes, "lines": lines}, f, ensure_ascii=False, indent=1)
print(f"{len(lines)} lines, {sum(l['durationSec'] for l in lines):.1f}s of speech -> {OUT}")
