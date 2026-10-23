#!/bin/bash
# 使い方: scripts/rename.sh 回のフォルダ名 A|B  （えむけーが話者A か B か。scripts/who.sh で確かめてから使う）
set -euo pipefail
d="$(dirname "$0")/../$1"; [ "$2" = A ] && { a=えむけー; b=ときさば; } || { a=ときさば; b=えむけー; }
[ -f "$d/transcript.raw.txt" ] || cp "$d/transcript.txt" "$d/transcript.raw.txt"
sed -E -e 's/(時沢|時澤|時様|時坂|徳島)さん/ときさばさん/g' -e 's/トキサバ/ときさば/g' -e 's/MKさん/えむけーさん/g' -e "s/ 話者A: / $a: /" -e "s/ 話者B: / $b: /" \
  -e '1s/.*/# ElevenLabs Scribe v2 の文字起こし。話者名（えむけー・ときさば）と「ときさば」「えむけー」の表記は直した、ほかは未修正（修正前は transcript.raw.txt）/' \
  "$d/transcript.raw.txt" > "$d/transcript.txt"
echo "$1: えむけー=話者$2、残りの話者A\/B $(grep -c -E ' 話者[AB]: ' "$d/transcript.txt" || true)"
