#!/bin/bash
# 使い方: scripts/who.sh 回のフォルダ名  （話者A・B のどちらがえむけーかを決める手がかりを出す）
f="$(dirname "$0")/../$1/transcript.txt"
echo "== $1"; sed -n '3,6p' "$f"
echo "-- 「時沢」と呼ぶ側（＝えむけー）"; grep -oE ' 話者[AB]: .*(時沢|時澤|時様|時坂|徳島|ときざわ|トキサワ|トキサバ|ときさわ)' "$f" | cut -c2-4 | sort | uniq -c
echo "-- 「MK」と呼ぶ側（＝ときさば）"; grep -oE ' 話者[AB]: .*(MKさん|エムケー|ＭＫ)' "$f" | cut -c2-4 | sort | uniq -c
