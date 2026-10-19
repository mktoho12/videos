#!/bin/bash
# 使い方: transcribe.sh <音声ファイル> <出力JSON>
# ElevenLabs Scribe v2 で、日本語・話者2人として文字起こしする
set -eu
curl -sS --fail-with-body --max-time 1800 \
  -H "xi-api-key: $(cat ~/.config/elevenlabs/api_key)" \
  -F model_id=scribe_v2 -F language_code=jpn \
  -F diarize=true -F num_speakers=2 -F tag_audio_events=false \
  -F timestamps_granularity=word \
  -F "file=@$1" \
  https://api.elevenlabs.io/v1/speech-to-text -o "$2"
