/**
 * サムネイルの見直し案（2026-10-24）。スマホの関連動画の欄で、まわり（濃い背景・画面の半分を占める文字・大きな顔）に
 * 埋もれていたため、次の3点を変えた案を並べて見比べる（channel/thumbnail-study.md）。
 * - 背景を暗く・色を濃くする　- 文字を倍にし、強調は赤の1語　- 顔を大きくする
 * B＝文字が主役（型③ひとこと）、C＝顔が主役（型③）、D＝期待と現実の2コマ（型②）。今の Thumb.tsx が A。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "./font";
import { Tachie } from "./Tachie";

const INK = "#1d1b22";
const YELLOW = "#ffd84a";
const RED = "#ff3b2f";
const STROKE = (w: number, c: string) =>
  [...Array(24)].map((_, i) => `${(Math.cos((i / 24) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((i / 24) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`).join(", ");

const Tomato: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <svg style={{ position: "absolute", left: x - r * 2, top: y - r * 1.6 }} width={r * 4} height={r * 3} viewBox="-2 -1.6 4 3">
    <ellipse cx={-0.4} cy={1.05} rx={1.5} ry={0.22} fill="#8a5a2b" opacity={0.85} />
    <circle cx={0} cy={0} r={1} fill="#e8402c" stroke={INK} strokeWidth={0.12} />
    <ellipse cx={-0.35} cy={-0.4} rx={0.28} ry={0.18} fill="#fff" opacity={0.7} />
    <path d="M0 -0.95 l0.35 -0.35 M0 -0.95 l-0.4 -0.25 M0 -0.95 l0.45 0.05 M0 -0.95 l-0.3 0.15" stroke="#3d8b37" strokeWidth={0.2} strokeLinecap="round" />
  </svg>
);

const Bg: React.FC<{ file: string; brightness: number }> = ({ file, brightness }) => (
  <Img
    src={staticFile(`bg/${file}`)}
    style={{ position: "absolute", width: 1280, height: 720, objectFit: "cover", filter: `brightness(${brightness}) saturate(1.4) blur(3px)` }}
  />
);

const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily, fontWeight: 900, fontSize: size, lineHeight: 1.0, color, textShadow: STROKE(size * 0.08, INK) + `, 0 ${size * 0.09}px 0 ${INK}`, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);

const SHOCKED = { 眉: "困り眉", 目: "〇〇", 顔色: "青ざめ", 枝豆: "枝豆立ち", 口: "うわー" };

/** B：文字が主役。画面の左6割を文字で埋め、「こぼした」だけ赤 */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Bg file="kitchen_day.png" brightness={0.4} />
    <Tachie character="zundamon" scale={1.25} flip pick={{ ...SHOCKED, 右腕: "手を挙げる", 左腕: "手を挙げる" }} toggles={{ 汗多め: true }} style={{ left: 450, top: -170 }} />
    <div style={{ position: "absolute", left: 36, top: 40 }}>
      <Big size={150} color={YELLOW}>ボクが</Big>
      <Big size={240} color={RED} style={{ marginTop: 10, marginLeft: -8 }}>こぼした</Big>
      <Big size={150} color={YELLOW} style={{ marginTop: 14 }}>のだ…</Big>
    </div>
    <Tomato x={520} y={610} r={70} />
  </AbsoluteFill>
);

/** C：顔が主役。ずんだもんの顔を画面いっぱいに寄せ、下の黒い帯に大きい文字 */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Bg file="kitchen_day.png" brightness={0.45} />
    <Tachie character="zundamon" scale={1.6} flip pick={{ ...SHOCKED, 右腕: "口元", 左腕: "口元" }} toggles={{ 汗多め: true }} style={{ left: -60, top: -300 }} />
    <Tachie character="metan" scale={0.75} pick={{ 眉: "ごきげん", 目: "目セット", 黒目: "カメラ目線", 右腕: "手をかざす", 左腕: "普通", 顔色: "普通2", 口: "ほほえみ" }} style={{ left: 880, top: 120 }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 230, background: "rgba(0,0,0,0.82)" }} />
    <div style={{ position: "absolute", left: 40, bottom: 34, display: "flex", alignItems: "baseline", gap: 8 }}>
      <Big size={110} color="#fff">冷蔵庫の下に</Big>
      <Big size={160} color={RED}>トマト</Big>
    </div>
    <Tomato x={170} y={400} r={66} />
  </AbsoluteFill>
);

/** D：期待と現実の2コマ。左は明るく自信満々、右は暗く青ざめる。間に矢印 */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 620, height: 720, overflow: "hidden" }}>
      <Img src={staticFile("bg/kitchen_day.png")} style={{ position: "absolute", left: -200, width: 1280, height: 720, objectFit: "cover", filter: "brightness(0.95) saturate(1.3) blur(2px)" }} />
      <Tachie character="zundamon" scale={0.95} pick={{ 眉: "上がり眉", 目: "^^", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "あは", 右腕: "腰", 左腕: "腰" }} style={{ left: -190, top: 110 }} />
      <Big size={92} color={INK} style={{ position: "absolute", left: 24, top: 30, color: "#fff" }}>毎晩、料理</Big>
      <Big size={92} color="#fff" style={{ position: "absolute", left: 24, top: 130 }}>してるのだ！</Big>
    </div>
    <div style={{ position: "absolute", left: 660, top: 0, width: 620, height: 720, overflow: "hidden" }}>
      <Img src={staticFile("bg/kitchen_day.png")} style={{ position: "absolute", left: -500, width: 1280, height: 720, objectFit: "cover", filter: "brightness(0.3) saturate(1.2) blur(2px)" }} />
      <Tachie character="zundamon" scale={0.95} flip pick={{ ...SHOCKED, 右腕: "手を挙げる", 左腕: "手を挙げる" }} toggles={{ 汗多め: true }} style={{ left: -120, top: 130 }} />
      <Big size={92} color={YELLOW} style={{ position: "absolute", left: 40, top: 30 }}>冷蔵庫の下</Big>
      <Big size={112} color={RED} style={{ position: "absolute", left: 40, top: 130 }}>のぞいたら</Big>
      <Tomato x={110} y={620} r={62} />
    </div>
    <div style={{ position: "absolute", left: 620, top: 0, width: 40, height: 720, background: YELLOW }} />
    <svg style={{ position: "absolute", left: 560, top: 300 }} width={160} height={120} viewBox="0 0 160 120">
      <path d="M10 30 h80 v-28 l64 58 l-64 58 v-28 h-80 z" fill={RED} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </svg>
  </AbsoluteFill>
);
