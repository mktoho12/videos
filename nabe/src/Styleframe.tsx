/**
 * 段階2 スタイルフレーム。代表シーンの静止画（S1・S3・S5）を Still で書き出す。
 * S1 は流しの大鍋の寄り（最後のコマも同じ絵にして、ループでつなぐ）。
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { Caption } from "./Caption";
import { Sink, Telop, TitleBand } from "./Panels";
import { styleDefaults, styleSchema } from "./style";
import { Character, MANIFESTS, Tachie } from "./Tachie";

type Look = { pick: Record<string, string>; toggles?: Record<string, boolean> };

export const styleframeSchema = z.object({
  style: styleSchema,
  scene: z.enum(["S1", "S3", "S5"]),
  title: z.string(),
  /** S1 で流しに寄る倍率と、寄ったときの流しの上端（px） */
  zoom: z.object({ scale: z.number(), top: z.number() }),
});
type Props = z.infer<typeof styleframeSchema>;

const LOOKS: Record<"S3" | "S5", Record<Character, Look>> = {
  S3: {
    zundamon: { pick: { 眉: "基本眉", 目: "基本目→", 右腕: "腰", 左腕: "腰", 顔色: "ほっぺ基本", 枝豆: "枝豆通常", 口: "んー" } },
    metan: { pick: { 眉: "太眉ごきげん", 目: "目閉じ", 黒目: "カメラ目線", 右腕: "普通", 左腕: "普通", 顔色: "普通2", 口: "ほほえみ" } },
    tsumugi: { pick: { まゆ: "おこ眉", 目: "基本目セット", 右腕: "ゆびさし", 左腕: "基本", 口: "わあ" }, toggles: { ほっぺ: true } },
  },
  S5: {
    zundamon: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "手を挙げる", 左腕: "腰", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち", 口: "あは" } },
    metan: { pick: { 眉: "太眉こまり", 目: "目セット", 黒目: "カメラ目線", 右腕: "普通", 左腕: "普通", 顔色: "普通2", 口: "む" } },
    tsumugi: { pick: { まゆ: "困り眉", 目: "〇〇", 右腕: "基本", 左腕: "基本", 口: "おあー" }, toggles: { ほっぺ: true, 汗: true } },
  },
};
const CAPTION: Record<"S3" | "S5", { speaker: Character; text: string }> = {
  S3: { speaker: "tsumugi", text: "鍋、まだいるんですけど！" },
  S5: { speaker: "tsumugi", text: "取っ手だけ！？" },
};
/** ずんだもんは左に立って右を向く */
const FLIP: Record<Character, boolean> = { zundamon: true, metan: false, tsumugi: false };

export const styleframeScenes: Record<Props["scene"], Props> = {
  S1: { style: styleDefaults, scene: "S1", title: "みんな自分の分は完璧", zoom: { scale: 1.7, top: 380 } },
  S3: { style: styleDefaults, scene: "S3", title: "みんな自分の分は完璧", zoom: { scale: 1.7, top: 380 } },
  S5: { style: styleDefaults, scene: "S5", title: "みんな自分の分は完璧", zoom: { scale: 1.7, top: 380 } },
};

export const Styleframe: React.FC<Props> = ({ style, scene, title, zoom }) => {
  const W = 1080;
  const s = style;
  const people = scene === "S1" ? null : (["metan", "zundamon", "tsumugi"] as const).map((who) => (
    <Tachie
      key={who}
      character={who}
      scale={s.tachieScale[who]}
      flip={FLIP[who]}
      pick={LOOKS[scene][who].pick}
      toggles={LOOKS[scene][who].toggles}
      style={{ left: W * s.tachieCenterX[who] - (MANIFESTS[who].width * s.tachieScale[who]) / 2 - s.frame.width, top: s.tachieTop[who] }}
    />
  ));
  const sinkScale = scene === "S1" ? zoom.scale : 1;
  const sinkTop = scene === "S1" ? zoom.top : s.sink.top;
  return (
    <AbsoluteFill style={{ backgroundColor: s.colors.frame }}>
      <AbsoluteFill style={{ inset: s.frame.width, borderRadius: s.frame.radius, overflow: "hidden" }}>
        <Img src={staticFile("bg/kitchen_night.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: "50%", top: sinkTop, transform: `translateX(-50%) scale(${sinkScale})`, transformOrigin: "top center" }}>
          <Sink style={s} knobShiny={scene === "S5"} />
        </div>
        {people}
        {scene === "S3" ? (
          <div style={{ position: "absolute", left: 40, top: s.day.top }}>
            <Telop style={s} text="3日目" color={s.colors.frame} fontSize={s.day.fontSize} />
          </div>
        ) : null}
        {scene !== "S1" ? <Caption style={s} speaker={CAPTION[scene].speaker} side="center" text={CAPTION[scene].text} /> : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: s.title.top, textAlign: "center" }}>
          <TitleBand style={s} text={title} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
