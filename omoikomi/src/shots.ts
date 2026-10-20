/**
 * 画角と背景の表（段階3で確認し、段階4の本実装でも使う）。styleframe.md の「画角の決まり」に従う。
 * 台詞の通し番号（src/lines.json の順、1 始まり）ごとに、画角を決める。書いていない台詞は「引き」。
 * 背景はシーンごとに決め、S7 だけ途中で乾燥機の状態に合わせて切り替える。
 */
export type Insert = "screenDoor" | "screenDoorHands" | "drain" | "manual" | "proOrSelf";
export type Shot = { kind: "wide" } | { kind: "closeUp" } | { kind: "insert"; insert: Insert };

const CU: Shot = { kind: "closeUp" };
const ins = (insert: Insert): Shot => ({ kind: "insert", insert });

/** 台詞の番号 → 画角。寄りは話している人に寄る */
export const SHOTS: Record<number, Shot> = {
  1: CU, // S0 先出し「えっ……これだけ、なのだ！？」
  5: CU, // 蚊の音を聞くと叫びたくなる
  7: CU, // 今すぐ業者を呼ぶのだ！（台本の「寄る」）
  10: CU, // ためしに自分でやってみたら？
  14: CU, // 蚕に吐いてもらう
  16: ins("screenDoor"), // 古い網を外して……ゴムで溝に押し込むだけよ
  17: ins("screenDoor"),
  18: ins("screenDoor"),
  19: CU, // ボクを油断させる作戦なのだ
  21: ins("screenDoorHands"), // 手元のアップ：端っこがよれる
  22: ins("screenDoorHands"),
  23: ins("screenDoorHands"),
  24: CU, // 網戸の反抗期です
  27: CU, // ハンモックとして使えばいい
  29: ins("screenDoorHands"), // 引っぱって、押し込んで
  30: ins("screenDoorHands"),
  32: CU, // ボク、網戸を直したのだ！
  35: CU, // よくがんばったわ
  36: CU, // 管理人の仕事を押し付けてません？（台本の「寄る」）
  39: CU, // 毎晩、耳もとでブンブン
  43: CU, // 何度か経験すると、やったことがないことも怖くなくなる（要の一言）
  44: CU, // やりがい搾取
  50: CU, // ボクに任せるのだ！
  53: CU, // 実績、網戸ひとつですよね
  54: ins("drain"), // 排水口は、ゴミ受けの下の部品を、回して外せる
  55: ins("drain"),
  59: CU, // 見なかったことにするのだ
  62: CU, // 半分は、ボクの毛だった
  65: CU, // いちばん夢中になれる、って話があるのよ
  67: CU, // 網戸が、かわいく見えてきた
  69: CU, // もう、アミーと呼んでいる
  72: CU, // 箱が、ボクより大きい
  74: CU, // 先輩が、説明書を読んでる
  75: ins("manual"), // 台にのせて、ダクトをつないで、ネジでとめる
  79: CU, // あ、しまった
  80: CU, // えっ……これだけ、なのだ！？（S0 で先出しした一瞬）
  86: CU, // みんな見てないようで、ちゃんと見てる
  87: CU, // ネジ一本でも、ちょっと気持ちよかった
  91: CU, // 次は、ガスの配管を直すのだ！
  94: ins("proOrSelf"), // ガスと電気の工事は、資格がいる
  96: CU, // 一気に飛びすぎです
  98: CU, // 電球……むずかしそうなのだ
  102: CU, // どこに行っても、ちょっと強いのよ
};

export const shotOf = (index: number): Shot => SHOTS[index] ?? { kind: "wide" };

export type Background = "living" | "bathroom" | "laundryBefore" | "laundryRemoved" | "laundryNew";
export const BACKGROUND_FILES: Record<Background, string> = {
  living: "living_night_on.jpg",
  bathroom: "bathroom_day.jpg",
  laundryBefore: "laundry_before.png",
  laundryRemoved: "laundry_removed.png",
  laundryNew: "laundry_new.png",
};
export const BACKGROUND_LABELS: Record<Background, string> = {
  living: "リビング（夜）",
  bathroom: "洗面台",
  laundryBefore: "洗濯機置き場（入れ替え前）",
  laundryRemoved: "洗濯機置き場（外した後）",
  laundryNew: "洗濯機置き場（新品）",
};

/** 台詞の背景。S7 は乾燥機の状態に合わせて切り替える（70〜74 入れ替え前、75〜79 外した後、80〜 新品） */
export const backgroundOf = (scene: string, index: number): Background => {
  if (scene === "S0") return "laundryNew";
  if (scene === "S5") return "bathroom";
  if (scene === "S7") return index < 75 ? "laundryBefore" : index < 80 ? "laundryRemoved" : "laundryNew";
  if (scene === "S8") return "laundryNew";
  return "living";
};

export const INSERT_LABELS: Record<Insert, string> = {
  screenDoor: "網戸の断面図",
  screenDoorHands: "網戸の手元のアップ",
  drain: "排水口の中の図",
  manual: "乾燥機の説明書のページ",
  proOrSelf: "「自分でやってみる」「プロに頼む」の表",
};
