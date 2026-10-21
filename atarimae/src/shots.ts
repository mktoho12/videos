/**
 * 画角と背景の表（段階3で確認し、段階4の本実装でも使う）。styleframe.md の「画角の決まり」に従う。
 * 台詞の通し番号（src/lines.json の順、1 始まり）ごとに、画角を決める。書いていない台詞は「引き」。
 * 背景はシーンごとに決める。
 */
export type Insert = "entranceBefore" | "entranceBoth" | "fridge" | "fridgeBefore" | "mpDrain" | "mpRecover" | "wave" | "sock";
export type Shot = { kind: "wide" } | { kind: "closeUp" } | { kind: "insert"; insert: Insert };

const CU: Shot = { kind: "closeUp" };
const ins = (insert: Insert): Shot => ({ kind: "insert", insert });

/** 台詞の番号 → 画角。寄りは話している人に寄る */
export const SHOTS: Record<number, Shot> = {
  6: CU, // ……最近、みんな厳しいのだ！（台本の「寄る」）
  13: CU, // ボクはいらない子だったのだ
  14: CU, // 急に非行少年みたいなこと言わないでください
  15: ins("entranceBefore"), // 前の玄関を覚えてる？
  16: ins("entranceBefore"), // 靴の山から、自分の靴を掘り出す
  17: ins("entranceBefore"),
  18: ins("entranceBefore"),
  19: ins("entranceBefore"), // だれか「靴をしまって」って言ってた？
  20: ins("entranceBefore"),
  21: ins("entranceBefore"), // しまう場所がなかった
  22: ins("entranceBoth"), // 今は、靴箱に空きがあるでしょ
  23: CU, // 家が、きれいになったのよ（台本の「寄る」。要の一言）
  26: CU, // あーしも、言ったあと、ちょっと気まずかった（台本の「寄る」）
  29: CU, // 「やっといたわ」って、ひとことだけ言えばいい（要の一言）
  37: ins("fridge"), // ソースが1本だけ、ぽつんと
  38: ins("fridge"),
  39: ins("fridgeBefore"), // 前は、5本くらい転がってても
  41: ins("mpDrain"), // それだけで毎日、少しずつ疲れていた
  42: ins("mpDrain"), // 歩くだけで MP が減っていく、毒の沼
  44: ins("mpRecover"), // 毒の沼がなくなったら、MP が余る
  45: ins("mpRecover"),
  48: CU, // ずんだ餅は、食べると MP が回復する
  52: CU, // つむぎも、やらかしてるのだ！
  56: CU, // プリンの次は、髪の毛で裁判ですか
  57: ins("wave"), // きれいさには、波がある
  61: ins("wave"), // 無理に上げ続けなくていい
  67: CU, // ちゃんと、計算が合ってるのだ
  69: ins("sock"), // ……ん？（床に靴下）
  70: ins("sock"), // だれなのだ！
  73: ins("sock"), // ずんだ餅のがらの靴下ですよ
  74: CU, // ……ボクのなのだ
  76: CU, // 前は、靴下の上で寝てた
  78: CU, // ずんだもんの「当たり前」も、上がってた（要の一言）
  82: CU, // やっといたのだ！
  83: CU, // 先輩、それ、先輩の靴です
};

export const shotOf = (index: number): Shot => SHOTS[index] ?? { kind: "wide" };

export type Background = "entrance" | "kitchen" | "room";
export const BACKGROUND_FILES: Record<Background, string> = {
  entrance: "house_hallway_3.jpg",
  kitchen: "kitchen_night.png",
  room: "single_room3_3.jpg",
};
export const BACKGROUND_LABELS: Record<Background, string> = {
  entrance: "玄関（夜）",
  kitchen: "台所（夜）",
  room: "ずんだもんの部屋",
};

/** 台詞の背景（シーンごと） */
export const backgroundOf = (scene: string, _index: number): Background => {
  if (scene === "S5" || scene === "S6") return "kitchen";
  if (scene === "S7" || scene === "S8") return "room";
  return "entrance";
};

export const INSERT_LABELS: Record<Insert, string> = {
  entranceBefore: "前の玄関（左だけ）",
  entranceBoth: "前の玄関と今の玄関",
  fridge: "冷蔵庫の棚にソースが1本",
  fridgeBefore: "前の冷蔵庫の棚（ソースが何本も）",
  mpDrain: "気力（MP）のゲージが減っていく",
  mpRecover: "気力（MP）のゲージが戻る",
  wave: "上がったり下がったりする波の線",
  sock: "きれいな床に靴下が1つ",
};
