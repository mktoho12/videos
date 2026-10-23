/**
 * YouTube のサムネイル 1280x720。前の動画と同じ型：黄色の大きな見出し＋白の小見出し＋2人。
 * 昼の台所で、冷蔵庫の下から出てきたミニトマトに青ざめるずんだもんと、落ち着いてほほえむめたん（気持ちの温度差）。
 * 大きい文字は型③ひとこと（ずんだもんの台詞）。タイトルは別の型にする（zundamon-guide.md）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "./font";
import { Tachie } from "./Tachie";

const INK = "#2b2a33";
const STROKE = (w: number, c: string) =>
  [...Array(16)].map((_, i) => `${(Math.cos((i / 16) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((i / 16) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`).join(", ");

/** 冷蔵庫の下から出てきたミニトマト（ヘタ付き）と、乾いたソースのしみ */
const Tomato: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <svg style={{ position: "absolute", left: x - r * 2, top: y - r * 1.6 }} width={r * 4} height={r * 3} viewBox="-2 -1.6 4 3">
    <ellipse cx={-0.4} cy={1.05} rx={1.5} ry={0.22} fill="#8a5a2b" opacity={0.85} />
    <circle cx={0} cy={0} r={1} fill="#e8402c" stroke={INK} strokeWidth={0.12} />
    <ellipse cx={-0.35} cy={-0.4} rx={0.28} ry={0.18} fill="#fff" opacity={0.7} />
    <path d="M0 -0.95 l0.35 -0.35 M0 -0.95 l-0.4 -0.25 M0 -0.95 l0.45 0.05 M0 -0.95 l-0.3 0.15" stroke="#3d8b37" strokeWidth={0.2} strokeLinecap="round" />
  </svg>
);

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Img src={staticFile("bg/kitchen_day.png")} style={{ position: "absolute", width: 1280, height: 720, objectFit: "cover", filter: "brightness(0.8) blur(2px)" }} />
    <Tachie
      character="metan"
      scale={0.72}
      pick={{ 眉: "ごきげん", 目: "目セット", 黒目: "カメラ目線", 右腕: "手をかざす", 左腕: "普通", 顔色: "普通2", 口: "ほほえみ" }}
      style={{ left: 830, top: 210 }}
    />
    <Tachie
      character="zundamon"
      scale={0.95}
      flip
      pick={{ 眉: "困り眉", 目: "〇〇", 右腕: "手を挙げる", 左腕: "手を挙げる", 顔色: "青ざめ", 枝豆: "枝豆立ち", 口: "お" }}
      style={{ left: -170, top: 190 }}
    />
    {/* 赤い丸で、床のミニトマトに目を向けさせる */}
    <div style={{ position: "absolute", left: 650, top: 545, width: 300, height: 170, border: "10px solid #ffd84a", borderRadius: "50%", boxShadow: `0 0 0 6px ${INK}` }} />
    <Tomato x={800} y={635} r={52} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily, fontWeight: 800 }}>
      <div style={{ fontSize: 124, lineHeight: 1.05, color: "#ffd84a", textShadow: STROKE(9, INK) + `, 0 12px 0 ${INK}` }}>ボクがこぼしたのだ…</div>
      <div style={{ fontSize: 66, marginTop: 8, color: "#fff", textShadow: STROKE(7, INK) }}>冷蔵庫の下から出てきたもの</div>
    </div>
  </AbsoluteFill>
);
