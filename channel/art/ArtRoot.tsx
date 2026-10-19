import React from "react";
import { AbsoluteFill, Img, staticFile, Still } from "remotion";
import { fontFamily } from "./font";
import { Character, Tachie } from "./Tachie";
import { PuddingCup } from "./Panels";
import { styleDefaults } from "./style";

const GREEN = "#5cbf2a";
const PINK = "#e0508f";
const YELLOW = "#e8a91c";

const LOOKS: Record<Character, { pick: Record<string, string>; toggles?: Record<string, boolean> }> = {
  zundamon: { pick: { 眉: "基本眉", 目: "にっこり", 右腕: "手を挙げる", 左腕: "腰", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "あは" } },
  metan: { pick: { 眉: "太眉ごきげん", 目: "目セット", 黒目: "カメラ目線", 右腕: "普通", 左腕: "普通", 顔色: "普通2", 口: "ほほえみ" } },
  tsumugi: { pick: { まゆ: "ごきげん眉", 目: "にっこり", 右腕: "ピース", 左腕: "基本", 口: "わあーい" }, toggles: { ほっぺ: true } },
};

const Char: React.FC<{ c: Character; x: number; y: number; s: number; flip?: boolean }> = ({ c, x, y, s, flip }) => (
  <Tachie character={c} scale={s} flip={flip} pick={LOOKS[c].pick} toggles={LOOKS[c].toggles} style={{ left: x, top: y }} />
);

/** 確認用: 3人の全身を並べる */
const Sheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#ddd" }}>
    <Char c="zundamon" x={0} y={0} s={0.5} />
    <Char c="metan" x={560} y={0} s={0.5} />
    <Char c="tsumugi" x={1120} y={0} s={0.5} />
  </AbsoluteFill>
);

/** アイコン 800x800（丸く切り抜かれる） */
const Icon: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #f4fbe9 0%, #cdeeb4 70%, #a8dc84 100%)`, overflow: "hidden" }}>
    <Char c="zundamon" x={-237} y={50} s={1.25} />
  </AbsoluteFill>
);

/** バナー 2560x1440。どの端末でも見えるのは中央の 1546x423 */
const SAFE = { w: 1546, h: 423 };
const Banner: React.FC = () => {
  const top = (1440 - SAFE.h) / 2;
  const left = (2560 - SAFE.w) / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#2b2a33" }}>
      <Img src={staticFile("bg/kitchen_night.png")} style={{ position: "absolute", width: 2560, height: 1440, filter: "brightness(0.55) saturate(0.9) blur(3px)" }} />
      <div style={{ position: "absolute", left, top, width: SAFE.w, height: SAFE.h, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 30, top: 95, fontFamily, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>
          <div style={{ fontSize: 50, color: "#d9f5c4", WebkitTextStroke: "0px" }}>ずんだもんの</div>
          <div style={{ fontSize: 86, textShadow: "0 6px 0 rgba(0,0,0,0.35)" }}>シェアハウス暮らし</div>
          <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
            {[GREEN, PINK, YELLOW].map((c) => (
              <div key={c} style={{ width: 70, height: 12, borderRadius: 6, background: c }} />
            ))}
          </div>
        </div>
        <Char c="metan" x={985 - 224} y={40} s={0.4} />
        <Char c="tsumugi" x={1395 - 244} y={30} s={0.45} flip />
        <Char c="zundamon" x={1170 - 230} y={75} s={0.45} />
      </div>
    </AbsoluteFill>
  );
};

/** 確認用: バナーに、端末ごとに見える範囲の枠を重ねる */
const BannerGuide: React.FC = () => (
  <AbsoluteFill>
    <Banner />
    <div style={{ position: "absolute", left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, outline: "4px dashed #ff0" }} />
    <div style={{ position: "absolute", left: 0, top: (1440 - 423) / 2, width: 2560, height: 423, outline: "4px dashed #0ff" }} />
  </AbsoluteFill>
);


/** プリン裁判のサムネイル 1280x720 */
const STROKE = (w: number, c: string) =>
  [...Array(16)].map((_, i) => `${(Math.cos((i / 16) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((i / 16) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`).join(", ");
const Thumb: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#2b2a33" }}>
    <Img src={staticFile("bg/kitchen_night.png")} style={{ position: "absolute", width: 1280, height: 720, filter: "brightness(0.7) blur(2px)" }} />
    <Tachie character="zundamon" scale={0.95} pick={{ 眉: "困り眉", 目: "〇〇", 右腕: "口元", 左腕: "腰", 顔色: "青ざめ", 枝豆: "枝豆萎え", 口: "Δ" }} toggles={{ 汗多め: true }} style={{ left: -220, top: 170 }} />
    <Tachie character="tsumugi" scale={0.82} pick={{ まゆ: "おこ眉", 目: "基本目セット", 右腕: "ゆびさし", 左腕: "基本", 口: "いー" }} toggles={{ ほっぺ赤め: true }} style={{ left: 640, top: 140 }} />
    <div style={{ position: "absolute", left: 470, top: 430, transform: "rotate(-8deg) scale(1.15)" }}>
      <PuddingCup style={styleDefaults} empty />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily, fontWeight: 800 }}>
      <div style={{ fontSize: 168, lineHeight: 1.05, color: "#ffd84a", textShadow: STROKE(9, "#2b2a33") + ", 0 12px 0 #2b2a33" }}>プリン裁判</div>
      <div style={{ fontSize: 70, marginTop: 6, color: "#fff", textShadow: STROKE(7, "#2b2a33") }}>2人では終わらない</div>
    </div>
  </AbsoluteFill>
);

export const ArtRoot: React.FC = () => (
  <>
    <Still id="Sheet" component={Sheet} width={1700} height={920} />
    <Still id="Icon" component={Icon} width={800} height={800} />
    <Still id="Thumb" component={Thumb} width={1280} height={720} />
    <Still id="Banner" component={Banner} width={2560} height={1440} />
    <Still id="BannerGuide" component={BannerGuide} width={2560} height={1440} />
  </>
);
