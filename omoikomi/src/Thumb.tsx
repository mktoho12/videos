/**
 * YouTube のサムネイル 1280x720。プリン裁判（channel/art の Thumb）と同じ型：黄色の大きな見出し＋白の小見出し＋2人。
 * 冒頭の先出し（新しい乾燥機の前で「えっ……これだけ、なのだ！？」）の場面を使う。
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
    <Img src={staticFile("bg/laundry_new.png")} style={{ position: "absolute", width: 1280, height: 720, objectFit: "cover", filter: "brightness(0.75) blur(2px)" }} />
    <Tachie
      character="zundamon"
      scale={0.95}
      pick={{ 眉: "上がり眉", 目: "〇〇", 右腕: "横", 左腕: "横", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "ほあー" }}
      style={{ left: -200, top: 190 }}
    />
    <Tachie
      character="metan"
      scale={0.8}
      flip
      pick={{ 眉: "太眉ごきげん", 目: "目セット", 黒目: "カメラ目線", 右腕: "指差す", 左腕: "普通", 顔色: "普通2", 口: "ほほえみ" }}
      style={{ left: 680, top: 170 }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily, fontWeight: 800 }}>
      <div style={{ fontSize: 160, lineHeight: 1.05, color: "#ffd84a", textShadow: STROKE(9, INK) + `, 0 12px 0 ${INK}` }}>「難しそう」は</div>
      <div style={{ fontSize: 84, marginTop: 6, color: "#fff", textShadow: STROKE(7, INK) }}>だいたい思い込み</div>
    </div>
  </AbsoluteFill>
);
