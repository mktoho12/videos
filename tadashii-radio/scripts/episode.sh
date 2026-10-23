#!/bin/bash
# 使い方: scripts/episode.sh 元の録音.wav 回のフォルダ名  （16kHzモノラルに変換→Scribe→話者つきの文字）
# 話者A・B の名前の直しは、冒頭を見てどちらが聞き手か確かめてから手で行う
set -euo pipefail
D="$(cd "$(dirname "$0")/.." && pwd)"; O="$D/$2"; mkdir -p "$O"
export PATH=/home/mktoho/.local/share/mise/installs/node/lts/bin:$PATH
echo 変換開始
(cd "$D/../hanauta" && npx remotion ffmpeg -y -loglevel error -i "$1" -ac 1 -ar 16000 -c:a pcm_s16le "$O/audio16k.wav")
echo 変換完了
cd "$D" && scripts/scribe.sh "$2/audio16k.wav" "$2/scribe.json" && python3 -I scripts/to_txt.py "$2/scribe.json" "$2/transcript.txt"
echo 全部完了
