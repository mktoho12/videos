/**
 * サムネイルの改良版（2026-10-22、テストと比較に出す2案）。型は channel/zundamon-guide.md の「サムネイルとタイトル（横長）」。
 * A＝「〇〇する奴」型：ヘッドホンで叫ぶずんだもんと、それを見て固まるつむぎ。文字は状況の名前。
 * B＝「期待と現実」型：左＝本人の耳（仲間の声もある）、右＝まわり（ずんだもんの声だけ）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "./font";
import { Bubble, Headset } from "./Panels";
import { styleDefaults } from "./style";
import { Tachie } from "./Tachie";

const INK = "#2b2a33";
const YELLOW = "#ffd84a";
const STROKE = (w: number, c: string) =>
  [...Array(16)].map((_, i) => `${(Math.cos((i / 16) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((i / 16) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`).join(", ");
const TACHIE_WIDTH = 1082;
const FRIEND = "#7a8699";

/** ヘッドホンをしたずんだもん。left・top は立ち絵の左上 */
const HeadsetZunda: React.FC<{ scale: number; left: number; top: number; flip?: boolean; pick: Record<string, string> }> = ({ scale, left, top, flip = false, pick }) => {
  const hs = styleDefaults.headset;
  const k = scale / styleDefaults.tachieScale.zundamon;
  const center = left + (TACHIE_WIDTH * scale) / 2;
  return (
    <>
      <Tachie character="zundamon" scale={scale} flip={flip} pick={pick} style={{ left, top }} />
      <Headset x={center + hs.offsetX * k * (flip ? -1 : 1)} y={top + hs.offsetY * k} width={hs.width * k} height={hs.height * k} flip={flip} />
    </>
  );
};

const SHOUT = { 眉: "上がり眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "うわー" };
const HAPPY = { 眉: "上がり眉", 目: "にっこり", 右腕: "手を挙げる", 左腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "あは" };

const Bg: React.FC<{ dim?: number }> = ({ dim = 0.8 }) => (
  <Img src={staticFile("bg/living_night_on.jpg")} style={{ position: "absolute", width: 1280, height: 720, objectFit: "cover", filter: `brightness(${dim}) blur(2px)` }} />
);

export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Bg />
    <Tachie
      character="tsumugi"
      scale={0.78}
      pick={{ まゆ: "困り眉", 目: "〇〇", 右腕: "口元", 左腕: "基本", 顔色: "ほっぺ", 口: "お" }}
      toggles={{ 汗: true }}
      style={{ left: 760, top: 250 }}
    />
    <HeadsetZunda scale={0.95} left={-150} top={185} flip pick={SHOUT} />
    <div style={{ position: "absolute", left: 480, top: 300, transform: "rotate(-6deg)" }}>
      <Bubble text={"撃つのだー！"} color="#5fb832" size={64} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontFamily, fontWeight: 900, lineHeight: 1.08 }}>
      <div style={{ fontSize: 112, color: "#fff", textShadow: STROKE(9, INK) }}>
        通話で<span style={{ color: YELLOW }}>叫んでる</span>のに
      </div>
      <div style={{ fontSize: 112, color: "#fff", textShadow: STROKE(9, INK) }}>気づいてない奴</div>
    </div>
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => {
  const half = (inside: boolean) => (
    <div style={{ position: "absolute", left: inside ? 0 : 640, top: 0, width: 640, height: 720, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: inside ? 0 : -640, top: 0, width: 1280, height: 720 }}>
        <Bg dim={inside ? 0.85 : 0.6} />
      </div>
      <HeadsetZunda scale={0.8} left={-170} top={215} pick={inside ? HAPPY : SHOUT} />
      <div style={{ position: "absolute", left: 330, top: 250, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
        <Bubble text={"ナイス！"} color={FRIEND} faded={!inside} size={40} />
        <Bubble text={"撃つのだ！"} color="#5fb832" size={46} />
        <Bubble text={"いけいけ！"} color={FRIEND} faded={!inside} size={40} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontFamily, fontWeight: 900, lineHeight: 1.08 }}>
        <div style={{ fontSize: 50, color: "#fff", textShadow: STROKE(6, INK) }}>{inside ? "本人" : "まわり"}</div>
        <div style={{ fontSize: 66, color: inside ? "#fff" : YELLOW, textShadow: STROKE(8, INK) }}>{inside ? "4人で盛り上がり中" : "ひとりで叫んでる"}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      {half(true)}
      {half(false)}
      <div style={{ position: "absolute", left: 632, top: 0, width: 16, height: 720, background: "#fff" }} />
      <div style={{ position: "absolute", left: 590, top: 330, fontFamily, fontWeight: 900, fontSize: 90, color: "#ff5a3c", textShadow: STROKE(7, "#fff") }}>▶</div>
    </AbsoluteFill>
  );
};
