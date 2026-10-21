/**
 * YouTube のサムネイル 1280x720。前の動画と同じ型：黄色の大きな見出し＋白の小見出し＋2人。
 * 冒頭の玄関で「最近、みんな厳しいのだ！」と叫ぶずんだもんと、それを見て「家がきれいになったのよ」と言うめたん。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "./font";
import { Tachie } from "./Tachie";

const INK = "#2b2a33";
const STROKE = (w: number, c: string) =>
  [...Array(16)].map((_, i) => `${(Math.cos((i / 16) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((i / 16) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`).join(", ");

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Img src={staticFile("bg/house_hallway_3.jpg")} style={{ position: "absolute", width: 1280, height: 720, objectFit: "cover", filter: "brightness(0.75) blur(2px)" }} />
    <Tachie
      character="zundamon"
      scale={0.95}
      flip
      pick={{ 眉: "怒り眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "うわー" }}
      style={{ left: -200, top: 210 }}
    />
    <Tachie
      character="metan"
      scale={0.8}
      pick={{ 眉: "太眉ごきげん", 目: "目セット", 黒目: "カメラ目線", 右腕: "手をかざす", 左腕: "普通", 顔色: "普通2", 口: "ほほえみ" }}
      style={{ left: 680, top: 190 }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily, fontWeight: 800 }}>
      <div style={{ fontSize: 140, lineHeight: 1.05, color: "#ffd84a", textShadow: STROKE(9, INK) + `, 0 12px 0 ${INK}` }}>最近みんな厳しい</div>
      <div style={{ fontSize: 80, marginTop: 6, color: "#fff", textShadow: STROKE(7, INK) }}>のは、家がきれいになったから</div>
    </div>
  </AbsoluteFill>
);
