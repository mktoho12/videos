/**
 * 画角・背景・登場の表（段階3で確認し、段階4の本実装でも使う）。styleframe.md の「画角の決まり」に従う。
 * 台詞の通し番号（src/lines.json の順、1 始まり）ごとに、画角を決める。書いていない台詞は「引き」。
 * atarimae の shots.ts を複製し、この動画の台詞に合わせて書き直した。登場（だれが画面にいるか）と、場所の文字・名札を足した。
 */
import { Speaker } from "./timeline";

export type Insert = "hearingLeft" | "hearingBoth" | "livingOpen" | "livingClosed";
export type Shot = { kind: "wide" } | { kind: "closeUp" } | { kind: "insert"; insert: Insert };

const CU: Shot = { kind: "closeUp" };
const ins = (insert: Insert): Shot => ({ kind: "insert", insert });

/** 台詞の番号 → 画角。寄りは話している人に寄る */
export const SHOTS: Record<number, Shot> = {
  6: CU, // ヘッドホンの中なのだ（台本の「寄る」）
  16: CU, // ……あっ！つむぎと話してたら、やられたのだ！
  25: ins("hearingLeft"), // お友だちの声と、自分の声が聞こえていたでしょ
  26: ins("hearingBoth"), // つむぎさんに聞こえていたのは、ずんだもんの声だけ
  27: ins("hearingBoth"), // 「撃つのだー！」って、ひとりで叫んでるようにしか
  28: ins("hearingBoth"), // 仲間の声はボクにしか聞こえてなかったのだ
  29: CU, // ……つむぎには、聞こえてなかったのか……（反省の間のあと）
  33: CU, // ボクは、電車で電話してる人だったのだ？（台本の「寄る」）
  35: CU, // 禁止なのだ？（台本の「寄る」）
  46: CU, // ソファーの半分しか使ってなかったのに（台本の「寄る」。要の一言）
  47: CU, // 気づかないうちに、ひとりじめしていないか（めたんの要の一言）
  57: CU, // 夢中になってると、自分では気づけないものなのだ（台本の「寄る」）
  68: ins("livingOpen"), // だれかがくつろいでいると、ほかの人も出てきたくなる
  69: ins("livingClosed"), // 先週までは、みんな扉を閉めていた
  70: ins("livingClosed"), // 「撃つのだー！」が聞こえると、出づらかった
  71: CU, // ……ボクが、扉を閉めさせてたのだ
  72: CU, // ここが、みんなの場所でいられれば（めたんの要の一言）
  82: CU, // ひとりじめするより、みんなで使ったほうが楽しい（要の一言）
};

export const shotOf = (index: number): Shot => SHOTS[index] ?? { kind: "wide" };

export type Background = "living" | "kitchenDark";
export const BACKGROUND_FILES: Record<Background, string> = {
  living: "living_night_on.jpg",
  kitchenDark: "kitchen_night.png",
};
export const BACKGROUND_LABELS: Record<Background, string> = {
  living: "リビング（夜）",
  kitchenDark: "台所（夜中・暗い）",
};

/** 台詞の背景（シーンごと） */
export const backgroundOf = (scene: string, _index: number): Background => (scene === "S6" ? "kitchenDark" : "living");

export const INSERT_LABELS: Record<Insert, string> = {
  hearingLeft: "聞こえ方の図（左：ずんだもんの耳だけ）",
  hearingBoth: "聞こえ方の図（左：ずんだもんの耳／右：リビング）",
  livingOpen: "リビングの図（だれかがいると、まわりの部屋から人が出てくる）",
  livingClosed: "リビングの図（扉が閉まったまま）",
};

/** 台詞の番号 → 画面にいる人。めたんは S3 で見回りに来る。S5 はずんだもんとつむぎ、S6 はずんだもんだけ（めたんは声だけで、最後に姿を見せる）。
 * S7 はずんだもんがひとりでいるところに、めたんとつむぎが来る */
export const presentAt = (index: number): Speaker[] => {
  if (index <= 17) return ["zundamon", "tsumugi"];
  if (index <= 50) return ["zundamon", "metan", "tsumugi"];
  if (index <= 60) return ["zundamon", "tsumugi"];
  if (index <= 63) return ["zundamon"];
  if (index <= 64) return ["zundamon", "metan"];
  if (index <= 65) return ["zundamon"];
  return ["zundamon", "metan", "tsumugi"];
};

/** 場所の文字（決め事「毎回、初めて見る人にも舞台と関係が分かるようにする」）。その台詞の頭から出す */
export const PLACE_LABELS: { line: number; place: string; detail: string }[] = [
  { line: 1, place: "シェアハウス", detail: "夜のリビング" },
  { line: 61, place: "シェアハウス", detail: "夜中の台所" },
];

/** 名札。それぞれ初めて出てきた台詞の頭から出す */
export const NAME_TAGS: { line: number; who: Speaker; role: string }[] = [
  { line: 1, who: "zundamon", role: "住人" },
  { line: 3, who: "tsumugi", role: "住人・後輩" },
  { line: 18, who: "metan", role: "管理人" },
];

/** 時間が飛んだことを示すテロップ（左上の小さな札）。いまは使っていない（時間が飛ぶ所は TRANSITIONS の場面転換にした） */
export const TELOPS: { line: number; text: string }[] = [];

/** 場面転換（2026-10-22 本実装 v1 を見たユーザーの指摘）。前のシーンの終わりから、この台詞の頭まで、画面全体を暗くして真ん中に大きく出す。
 * 台本の「（間 2秒）」で、この台詞の前の間を長くしてある */
export const TRANSITIONS: { line: number; text: string }[] = [
  { line: 51, text: "次の日" },
  { line: 61, text: "その夜中" },
  { line: 65, text: "次の週" },
];

/** 立ち位置の並び（シーンごと）。trio＝3人並び、sofa＝S5 でずんだもんとつむぎがソファーに並ぶ、solo＝S6 の夜中の台所でずんだもんが真ん中寄りにひとり */
export type Formation = "trio" | "sofa" | "solo";
export const formationOf = (scene: string): Formation => (scene === "S5" ? "sofa" : scene === "S6" ? "solo" : "trio");
