/**
 * YouTube のサムネイル 1280x720。前の動画と同じ型：黄色の大きな見出し＋白の小見出し＋2人。
 * 冒頭のリビングで、ヘッドホンをして「撃つのだー！」と叫ぶずんだもんと、それをぽかんと見るつむぎ。
 * ヘッドホンの大きさと位置は、本編（style.ts の headset。立ち絵 0.85 倍のときの値）を立ち絵の倍率に合わせて使う。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "./font";
import { Headset } from "./Panels";
import { styleDefaults } from "./style";
import { Tachie } from "./Tachie";

const INK = "#2b2a33";
const STROKE = (w: number, c: string) =>
  [...Array(16)].map((_, i) => `${(Math.cos((i / 16) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((i / 16) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`).join(", ");

const TACHIE_WIDTH = 1082;
const Z = { scale: 0.95, left: -170, top: 220 };

export const Thumb: React.FC = () => {
  const hs = styleDefaults.headset;
  const k = Z.scale / styleDefaults.tachieScale.zundamon;
  const center = Z.left + (TACHIE_WIDTH * Z.scale) / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Img src={staticFile("bg/living_night_on.jpg")} style={{ position: "absolute", width: 1280, height: 720, objectFit: "cover", filter: "brightness(0.75) blur(2px)" }} />
      <Tachie
        character="tsumugi"
        scale={0.8}
        pick={{ まゆ: "困り眉", 目: "〇〇", 右腕: "口元", 左腕: "基本", 顔色: "ほっぺ", 口: "お" }}
        toggles={{ 汗: true }}
        style={{ left: 700, top: 200 }}
      />
      <Tachie
        character="zundamon"
        scale={Z.scale}
        flip
        pick={{ 眉: "上がり眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "うわー" }}
        style={{ left: Z.left, top: Z.top }}
      />
      <Headset x={center + hs.offsetX * k * -1} y={Z.top + hs.offsetY * k} width={hs.width * k} height={hs.height * k} flip />
      <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily, fontWeight: 800 }}>
        <div style={{ fontSize: 132, lineHeight: 1.05, color: "#ffd84a", textShadow: STROKE(9, INK) + `, 0 12px 0 ${INK}` }}>ひとりで叫んでる</div>
        <div style={{ fontSize: 72, marginTop: 6, color: "#fff", textShadow: STROKE(7, INK) }}>通話の声、まわりにはこう聞こえる</div>
      </div>
    </AbsoluteFill>
  );
};
