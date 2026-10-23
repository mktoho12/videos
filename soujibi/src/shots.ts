/**
 * 画角・背景・登場の表（段階3で確認し、段階4の本実装でも使う）。zundamon-guide.md の「画面」に従う。
 * 台詞の通し番号（src/lines.json の順、1 始まり）ごとに、画角を決める。書いていない台詞は「引き」。
 * hitorigoto の shots.ts を複製し、この動画の台詞に合わせて書き直した。
 */
import { Speaker } from "./timeline";

/** chart＝今月の割り振り表、view＝見え方の図（hidden は右の「掃除して初めて見える所」を強める）、rotation＝割り振り表の図（月ごとに入れ替わる） */
export type Insert = "chart" | "viewHidden" | "viewBoth" | "rotation";
export type Shot = { kind: "wide" } | { kind: "closeUp" } | { kind: "insert"; insert: Insert };

const CU: Shot = { kind: "closeUp" };
const ins = (insert: Insert): Shot => ({ kind: "insert", insert });

/** 台詞の番号 → 画角。寄りは話している人に寄る */
export const SHOTS: Record<number, Shot> = {
  3: CU, // 掃除の日って、本当に必要なのだ？（タイトルの問いかけ）
  15: ins("chart"), // ……台所？（割り振り表に寄る）
  16: ins("chart"), // 今月のずんだもんは、台所よ。つむぎさんは、洗面所ね
  17: CU, // 玄関は、ボクの持ち場なのだ！
  25: ins("viewHidden"), // ミニトマトが、転がってるのだ（台本の差し込み）
  26: ins("viewHidden"), // ソースかしら
  27: CU, // ……これ、ボクがこぼしたやつなのだ（台本の「寄る」）
  33: ins("viewBoth"), // 料理してるときは、手元しか見てなかったのだ
  35: CU, // ……うわ。髪の毛が、こんなに
  37: CU, // ほとんど、あーしのです（台本の「寄る」）
  42: CU, // ……気づいてなかったのだ
  47: CU, // ……転がす自信があるのだ
  50: CU, // 自分のトマトを見つける日なのだ？（要の一言。台本の「寄る」）
  52: ins("rotation"), // だから、割り振り表は、毎回場所が変わるんですね
  53: ins("rotation"), // 玄関ばっかりだったら（台本の差し込み）
  62: CU, // 今日は、トマトは転がってないのだ（台本の「寄る」）
  66: CU, // 掃除の日、いるのだ
  70: CU, // ……お風呂は、ちょっと具合が悪いのだ
};

export const shotOf = (index: number): Shot => SHOTS[index] ?? { kind: "wide" };

export type Background = "living" | "kitchen" | "washroom" | "kitchenNight";
export const BACKGROUND_FILES: Record<Background, string> = {
  living: "living_day.jpg",
  kitchen: "kitchen_day.png",
  washroom: "washroom_day.jpg",
  kitchenNight: "kitchen_night.png",
};
export const BACKGROUND_LABELS: Record<Background, string> = {
  living: "リビング（朝・昼）",
  kitchen: "台所（昼）",
  washroom: "洗面所（昼）",
  kitchenNight: "台所（夜・照明あり）",
};

/** 台詞の背景（シーンごと） */
export const backgroundOf = (scene: string, _index: number): Background =>
  scene === "S3" ? "kitchen" : scene === "S4" ? "washroom" : scene === "S7" ? "kitchenNight" : "living";

export const INSERT_LABELS: Record<Insert, string> = {
  chart: "今月の割り振り表（ずんだもんの欄が「台所」）",
  viewHidden: "見え方の図（右の「掃除して初めて見える所」を強める）",
  viewBoth: "見え方の図（左右とも）",
  rotation: "割り振り表の図（月ごとに場所が入れ替わる）",
};

/** 台詞の番号 → 画面にいる人。
 * S1 はずんだもんとつむぎに、めたんが来る。S3 の台所はずんだもんとめたんに、つむぎがぞうきんを取りに来る。
 * S4 の洗面所はつむぎに、ずんだもんがのぞきに来る。S7 の夜の台所はずんだもんに、つむぎ、めたんの順に来る */
export const presentAt = (index: number): Speaker[] => {
  if (index <= 10) return ["zundamon", "tsumugi"];
  if (index <= 18) return ["zundamon", "metan", "tsumugi"];
  if (index <= 27) return ["zundamon", "metan"];
  if (index <= 33) return ["zundamon", "metan", "tsumugi"];
  if (index <= 35) return ["tsumugi"];
  if (index <= 39) return ["zundamon", "tsumugi"];
  if (index <= 60) return ["zundamon", "metan", "tsumugi"];
  if (index <= 62) return ["zundamon"];
  if (index <= 64) return ["zundamon", "tsumugi"];
  return ["zundamon", "metan", "tsumugi"];
};

/** 場所の文字（決め事「毎回、初めて見る人にも舞台と関係が分かるようにする」）。その台詞の頭から出す */
export const PLACE_LABELS: { line: number; place: string; detail: string }[] = [
  { line: 1, place: "シェアハウス", detail: "掃除の日の朝" },
  { line: 19, place: "台所", detail: "ずんだもんの担当" },
  { line: 34, place: "洗面所", detail: "つむぎの担当" },
  { line: 40, place: "リビング", detail: "ひと休み" },
];

/** 名札。それぞれ初めて出てきた台詞の頭から出す */
export const NAME_TAGS: { line: number; who: Speaker; role: string }[] = [
  { line: 1, who: "zundamon", role: "住人" },
  { line: 2, who: "tsumugi", role: "住人・後輩" },
  { line: 11, who: "metan", role: "管理人" },
];

/** 時間が飛んだことを示すテロップ（左上の小さな札）。いまは使っていない */
export const TELOPS: { line: number; text: string }[] = [];

/** 場面転換。前のシーンの終わりから、この台詞の頭まで、画面全体を暗くして真ん中に大きく出す。
 * 台本の「（間 4.2秒）」で、この台詞の前の間を長くしてある */
export const TRANSITIONS: { line: number; text: string }[] = [{ line: 61, text: "数日後" }];

/** 立ち位置の並び。この動画は全部 3人並びの位置（いない人は出さない） */
export type Formation = "trio" | "sofa" | "solo";
export const formationOf = (_scene: string): Formation => "trio";
