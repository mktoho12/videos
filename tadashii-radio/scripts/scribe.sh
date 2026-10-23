#!/bin/bash
# 使い方: scripts/scribe.sh 音声ファイル 出力.json  （ElevenLabs Scribe v2、話者分けあり）
set -euo pipefail
key=$(cat ~/.config/elevenlabs/api_key)
curl -sS --fail-with-body -X POST https://api.elevenlabs.io/v1/speech-to-text \
  -H @<(printf 'xi-api-key: %s\n' "$key") \
  -F model_id=scribe_v2 -F language_code=jpn -F diarize=true -F tag_audio_events=false \
  -F timestamps_granularity=word -F "file=@$1" -o "$2"
echo "文字起こし完了 $(stat -c %s "$2") バイト"
