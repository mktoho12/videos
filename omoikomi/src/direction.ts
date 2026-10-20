/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・効果音・テロップを決める。
 * プリン裁判（tadashii-sharehouse）の direction.ts を複製し、この動画の台詞に合わせて書き直した。
 * 画角と背景は src/shots.ts（段階3 で確認した表）。
 * 表情は台詞の頭で切り替わり、次の台詞の頭で base に戻ってから、その台詞の変更を当てる（前の変更は引き継がない）。
 * パーツの名前は立ち絵 PSD のレイヤー名（public/tachie/<キャラ>/manifest.json を参照）。
 */
import { Speaker } from "./timeline";

export type Expression = {
  /** グループ名 → 表示する子（Tachie の pick） */
  pick: Record<string, string>;
  /** 汗・涙など、印のないレイヤーの表示 */
  toggles: Record<string, boolean>;
  /** 話しているときに口パクで切り替える2つの口 */
  mouthOpen: string;
  mouthClosed: string;
};

export const MOUTH_GROUP: Record<Speaker, string> = { zundamon: "口", metan: "口", tsumugi: "口" };

/** まばたきに使う閉じ目と、まばたきしてよい目（開いた普通の目だけ） */
export const BLINK: Record<Speaker, { closed: string; group: string; blinkable: (eyes: string | undefined) => boolean }> = {
  zundamon: { closed: "閉じ目", group: "目", blinkable: (e) => e === undefined || /^(基本目|ジト目)/.test(e) },
  metan: { closed: "目閉じ", group: "目", blinkable: (e) => e === undefined || e === "目セット" },
  tsumugi: { closed: "閉じ", group: "目", blinkable: (e) => e === undefined || e === "基本目セット" },
};

/** まばたきの位相をずらす量（3人が同時にまばたきしないように） */
export const BLINK_OFFSET: Record<Speaker, number> = { zundamon: 0.4, metan: 0.85, tsumugi: 0.1 };

const BASES: Record<Speaker, Expression> = {
  zundamon: {
    pick: { 眉: "基本眉", 目: "基本目", 右腕: "腰", 左腕: "腰", 顔色: "ほっぺ基本", 枝豆: "枝豆通常" },
    toggles: {},
    mouthOpen: "ほあー",
    mouthClosed: "むふ",
  },
  metan: {
    pick: { 眉: "太眉ごきげん", 目: "目セット", 黒目: "カメラ目線", 右腕: "普通", 左腕: "普通", 顔色: "普通2" },
    toggles: {},
    mouthOpen: "わあー",
    mouthClosed: "ほほえみ",
  },
  tsumugi: {
    pick: { まゆ: "普通眉", 目: "基本目セット", 右腕: "基本", 左腕: "基本", 顔色: "ほっぺ" },
    toggles: {},
    mouthOpen: "わあ",
    mouthClosed: "ほほえみ",
  },
};

type Change = Partial<Omit<Expression, "pick" | "toggles">> & {
  pick?: Record<string, string>;
  toggles?: Record<string, boolean>;
};

// よく使う表情
const zSurprised: Change = { pick: { 眉: "上がり眉", 目: "〇〇", 右腕: "横", 左腕: "横" }, mouthOpen: "ほあー", mouthClosed: "お" };
const zPanic: Change = { pick: { 眉: "困り眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる" }, toggles: { 汗: true }, mouthOpen: "うわー", mouthClosed: "うへえ" };
const zProud: Change = { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上", 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" };
const zSulk: Change = { pick: { 眉: "困り眉", 目: "ジト目" }, mouthClosed: "むくー" };
const zWork: Change = { pick: { 眉: "困り眉", 目: "基本目↑", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "んえー", mouthClosed: "んー" };
const tPoint: Change = { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" };
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };
const mTired: Change = { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" };

/** 台詞の番号 → 表情の変更（base からの差分） */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: zSurprised,
    2: { pick: { 目: "基本目→" } },
    3: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)" }, mouthOpen: "ほあ" },
    4: { pick: { 目: "ジト目" }, mouthClosed: "むくー" },
    5: zPanic,
    6: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    7: { pick: { 眉: "困り眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる", 枝豆: "枝豆立ち" }, toggles: { 汗多め: true }, mouthOpen: "うわー" },
    8: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    9: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し上" }, mouthOpen: "ほあ" },
    10: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    11: { pick: { 眉: "困り眉", 目: "ジト目" }, mouthClosed: "んー" },
    12: { pick: { 眉: "困り眉", 目: "基本目↑", 左腕: "あごに指" }, mouthOpen: "ほあ" },
    13: { pick: { 目: "基本目→" }, mouthClosed: "お" },
    14: { pick: { 眉: "困り眉", 目: "細め目", 左腕: "あごに指" }, mouthOpen: "ほあ" },
    15: { pick: { 眉: "困り眉", 目: "基本目→" }, mouthClosed: "んー" },
    16: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    17: { pick: { 目: "〇〇" }, mouthOpen: "お", mouthClosed: "お" },
    18: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    19: { pick: { 眉: "上がり眉", 目: "ジト目", 右腕: "指差し横" }, mouthOpen: "ほあ", mouthClosed: "むくー" },
    20: zSulk,
    21: zWork,
    22: zWork,
    23: { ...zPanic, pick: { ...zPanic.pick, 枝豆: "枝豆立ち" } },
    24: { pick: { 眉: "困り眉", 目: "ジト目", 枝豆: "枝豆萎え" }, mouthClosed: "んえー" },
    25: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "手を挙げる" }, mouthOpen: "あは", mouthClosed: "えへ" },
    26: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    27: { pick: { 眉: "上がり眉", 目: "ジト目2→", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)" }, toggles: { 汗: true }, mouthOpen: "ほあ", mouthClosed: "んー" },
    28: { pick: { 眉: "困り眉", 目: "基本目→" }, mouthClosed: "んー" },
    29: { ...zWork, pick: { ...zWork.pick, 眉: "上がり眉" } },
    30: { pick: { 目: "〇〇" }, mouthOpen: "ほあ", mouthClosed: "お" },
    31: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    32: { ...zProud, pick: { ...zProud.pick, 右腕: "手を挙げる", 左腕: "手を挙げる" } },
    33: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    34: zProud,
    35: { pick: { 目: "にっこり" }, toggles: {}, mouthClosed: "えへ", },
    36: { pick: { 目: "基本目→" } },
    37: { pick: { 眉: "困り眉", 目: "〇〇" }, mouthOpen: "お", mouthClosed: "お" },
    38: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    39: { pick: { 眉: "困り眉", 目: "><" }, toggles: { 汗: true, かげり: true }, mouthOpen: "うへえ", mouthClosed: "うへえ" },
    40: { pick: { 目: "基本目→" } },
    41: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    42: { pick: { 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" },
    43: { pick: { 目: "なごみ目" }, mouthClosed: "ほほえみ" },
    44: { pick: { 目: "基本目→" }, mouthClosed: "お" },
    45: { pick: { 目: "基本目↑", 左腕: "あごに指" }, mouthClosed: "んー" },
    46: { pick: { 目: "細め目", 顔色: "ほっぺ赤め" }, mouthOpen: "ほあ", mouthClosed: "えへ" },
    47: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し横" }, mouthOpen: "あは", mouthClosed: "にやり" },
    48: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    49: { pick: { 目: "基本目→" }, mouthClosed: "お" },
    50: { ...zProud, pick: { ...zProud.pick, 右腕: "手を挙げる" } },
    51: { pick: { 眉: "上がり眉", 目: "にっこり" }, mouthClosed: "えへ" },
    52: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)", 枝豆: "枝豆立ち" }, mouthOpen: "ほあ", mouthClosed: "にやり" },
    53: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    54: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    55: { pick: { 目: "〇〇" }, mouthOpen: "お", mouthClosed: "お" },
    56: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "うへえ" },
    57: { pick: { 眉: "怒り眉", 目: "細め目", 右腕: "指差し横" }, mouthOpen: "うわー", mouthClosed: "んー" },
    58: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗多め: true }, mouthClosed: "Δ" },
    59: { pick: { 眉: "困り眉", 目: "UU", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "ほう", mouthClosed: "ん" },
    60: { pick: { 眉: "困り眉", 目: "><" }, toggles: { 汗: true }, mouthClosed: "うへえ" },
    61: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    62: { ...zProud, pick: { ...zProud.pick, 右腕: "腰" } },
    63: { pick: { 眉: "困り眉", 目: "基本目←" }, toggles: { 汗: true }, mouthClosed: "んー" },
    64: { pick: { 目: "基本目↑", 左腕: "あごに指" }, mouthOpen: "ほあ", mouthClosed: "んー" },
    65: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    66: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    67: { pick: { 目: "細め目ハート", 顔色: "ほっぺ赤め", 右腕: "口元", 左腕: "口元" }, mouthOpen: "あは", mouthClosed: "えへ" },
    68: { pick: { 目: "細め目ハート", 顔色: "ほっぺ赤め" }, mouthClosed: "えへ" },
    69: { pick: { 目: "なごみ目", 顔色: "ほっぺ赤め", 右腕: "口元", 左腕: "口元" }, mouthOpen: "ほあ", mouthClosed: "ほほえみ" },
    70: { pick: { 目: "基本目←" } },
    71: { pick: { 目: "基本目←" }, mouthClosed: "お" },
    72: { pick: { 眉: "困り眉", 目: "〇〇", 右腕: "横", 左腕: "横" }, toggles: { 汗: true }, mouthOpen: "ほあ", mouthClosed: "Δ" },
    73: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "あごに指" }, mouthOpen: "ほう", mouthClosed: "んー" },
    74: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "あごに指" }, mouthClosed: "んー" },
    75: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "あごに指" }, mouthOpen: "ほう", mouthClosed: "んー" },
    76: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し横" }, mouthOpen: "あは", mouthClosed: "えへ" },
    77: { pick: { 目: "基本目→" } },
    78: { pick: { 目: "基本目→" } },
    79: { pick: { 目: "基本目→" }, mouthClosed: "お" },
    80: zSurprised,
    81: { pick: { 眉: "困り眉", 目: "〇〇" }, mouthClosed: "Δ" },
    82: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    83: { pick: { 目: "基本目→" } },
    84: { pick: { 目: "基本目↑", 左腕: "あごに指" }, mouthOpen: "ほあ", mouthClosed: "んー" },
    85: { pick: { 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" },
    86: { pick: { 目: "基本目←" }, mouthClosed: "ほう" },
    87: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    88: { pick: { 目: "にっこり", 右腕: "指差し横", 顔色: "ほっぺ赤め" }, mouthOpen: "あは", mouthClosed: "えへ" },
    89: { pick: { 眉: "困り眉", 目: "基本目→" }, mouthClosed: "んー" },
    90: { ...zProud, pick: { ...zProud.pick, 右腕: "手を挙げる", 左腕: "手を挙げる" } },
    91: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上", 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" },
    92: { pick: { 目: "〇〇", 枝豆: "枝豆立ち片折れ" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    93: { pick: { 目: "〇〇", 枝豆: "枝豆立ち片折れ" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    94: { pick: { 眉: "困り眉", 目: "基本目→" }, toggles: { 汗: true }, mouthClosed: "んー" },
    95: { pick: { 眉: "困り眉", 目: "細め目" }, mouthOpen: "ほあ", mouthClosed: "えへ" },
    96: { pick: { 眉: "困り眉", 目: "ジト目" }, mouthClosed: "むくー" },
    97: { pick: { 目: "基本目→" } },
    98: { pick: { 眉: "困り眉", 目: "><" }, toggles: { 汗: true }, mouthOpen: "うへえ", mouthClosed: "うへえ" },
    99: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    100: { pick: { 目: "基本目→" } },
    101: { pick: { 目: "基本目→" } },
    102: { pick: { 目: "なごみ目" }, mouthClosed: "ほほえみ" },
    103: { pick: { 目: "にっこり", 顔色: "ほっぺ赤め", 右腕: "口元", 左腕: "口元" }, mouthOpen: "あは", mouthClosed: "えへ" },
    104: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    105: { pick: { 目: "にっこり", 右腕: "手を挙げる" }, mouthOpen: "あは", mouthClosed: "えへ" },
  },
  metan: {
    1: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    6: { pick: { 眉: "こまり" }, mouthOpen: "お", mouthClosed: "む" },
    7: { pick: { 眉: "こまり" }, mouthClosed: "む" },
    8: mTired,
    9: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    10: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
    11: mExplain,
    12: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    14: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    16: mExplain,
    17: mExplain,
    18: { pick: { 目: "目閉じ", 右腕: "指差す" } },
    19: mTired,
    20: { pick: { 眉: "ややおこ" }, mouthOpen: "▽", mouthClosed: "む" },
    23: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    24: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    26: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    27: mTired,
    28: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
    31: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    32: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    35: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    36: { pick: { 眉: "こまり", 目: "○○" }, mouthClosed: "む" },
    37: { pick: { 眉: "こまり" }, mouthClosed: "む" },
    38: { pick: { 眉: "太眉こまり", 右腕: "手をかざす" } },
    39: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    40: { pick: { 眉: "ごきげん", 左腕: "抱える" } },
    41: { pick: { 眉: "ごきげん", 右腕: "指差す" } },
    43: { pick: { 眉: "ごきげん", 目: "目閉じ", 右腕: "手をかざす" } },
    44: { pick: { 眉: "こまり", 目: "○○" }, mouthClosed: "む" },
    45: { pick: { 眉: "ごきげん", 右腕: "指差す" }, mouthClosed: "にやり" },
    46: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    47: { pick: { 目: "目閉じ" } },
    48: { pick: { 目: "目閉じ" } },
    51: { pick: { 眉: "ごきげん", 黒目: "目そらし" }, mouthOpen: "お", mouthClosed: "にやり" },
    53: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    54: mExplain,
    55: mExplain,
    56: { pick: { 眉: "こまり" }, mouthClosed: "む" },
    57: { pick: { 眉: "こまり" }, mouthClosed: "む" },
    59: { pick: { 眉: "ややおこ" }, mouthClosed: "む" },
    60: { pick: { 眉: "おこ", 目: "目閉じ", 右腕: "指差す" }, mouthOpen: "▽", mouthClosed: "む" },
    61: { pick: { 眉: "ごきげん" } },
    63: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    64: { pick: { 眉: "ごきげん" } },
    65: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
    66: { pick: { 眉: "ごきげん", 目: "目閉じ", 右腕: "手をかざす" } },
    67: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    69: mTired,
    70: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
    73: { pick: { 眉: "ごきげん" } },
    74: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    78: mExplain,
    80: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    82: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    86: { pick: { 眉: "ごきげん", 目: "目閉じ", 左腕: "口元に指" } },
    87: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    90: { pick: { 眉: "ごきげん" } },
    91: { pick: { 眉: "こまり", 目: "見開き白目" }, mouthClosed: "む" },
    92: { pick: { 眉: "おこ", 目: "><", 右腕: "指差す" }, mouthOpen: "▽" },
    93: { pick: { 眉: "おこ", 右腕: "指差す" }, mouthClosed: "む" },
    94: { pick: { 眉: "ややおこ", 右腕: "指差す" } },
    95: { pick: { 眉: "ごきげん" } },
    96: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    97: { pick: { 眉: "太眉こまり", 右腕: "手をかざす" }, mouthClosed: "む" },
    98: mTired,
    99: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    100: { pick: { 右腕: "手をかざす" } },
    102: { pick: { 眉: "ごきげん", 目: "目閉じ", 右腕: "手をかざす" } },
    104: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
  },
  tsumugi: {
    1: { pick: { 目: "〇〇" }, mouthClosed: "△" },
    2: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    3: tFlat,
    4: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    5: { pick: { 目: "上向き" }, mouthClosed: "む" },
    7: { pick: { 目: "上向き" }, mouthClosed: "む" },
    9: tFlat,
    12: tFlat,
    13: { pick: { まゆ: "困り眉", 目: "閉じ" }, mouthOpen: "む", mouthClosed: "む" },
    14: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "△" },
    15: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    21: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    22: tPoint,
    23: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    24: { pick: { まゆ: "ごきげん眉", 目: "閉じ", 右腕: "口元" }, mouthOpen: "ほあー", mouthClosed: "ほほえみ" },
    25: tFlat,
    26: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    27: { pick: { まゆ: "困り眉", 目: "閉じ" }, mouthClosed: "む" },
    31: tSmile,
    32: tSmile,
    33: { ...tSmile, mouthOpen: "わあ" },
    34: { pick: { 目: "上向き" }, mouthClosed: "む" },
    35: tSmile,
    36: { pick: { まゆ: "おこ眉", 黒目: "目逸らし" }, mouthOpen: "えあー", mouthClosed: "む" },
    38: tFlat,
    39: { pick: { まゆ: "困り眉" }, mouthClosed: "△" },
    41: tFlat,
    42: { pick: { 目: "にっこり" } },
    44: { pick: { まゆ: "おこ眉", 右腕: "口元" }, mouthOpen: "えあー", mouthClosed: "む" },
    45: { pick: { まゆ: "困り眉", 目: "上向き" }, mouthClosed: "む" },
    46: { pick: { 目: "にっこり" }, mouthClosed: "にしー" },
    47: { pick: { まゆ: "困り眉" }, mouthClosed: "△" },
    48: { pick: { まゆ: "困り眉", 目: "上向き", 右腕: "口元" }, mouthOpen: "えあー", mouthClosed: "む" },
    49: { pick: { まゆ: "困り眉" }, toggles: { 汗: true }, mouthOpen: "えあー", mouthClosed: "む" },
    50: { pick: { 目: "〇〇" }, mouthClosed: "△" },
    52: tFlat,
    53: { pick: { まゆ: "困り眉", 目: "閉じ" }, mouthOpen: "む", mouthClosed: "む" },
    56: { pick: { まゆ: "困り眉", 目: "><", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "おあー", mouthClosed: "いー" },
    57: { pick: { まゆ: "困り眉", 目: "><" }, toggles: { 汗: true }, mouthClosed: "いー" },
    58: { pick: { まゆ: "困り眉", 目: "閉じ", 右腕: "ゆびさし" }, mouthOpen: "む", mouthClosed: "む" },
    59: tPoint,
    60: { pick: { 目: "にっこり" }, mouthClosed: "にしー" },
    61: { pick: { まゆ: "ごきげん眉", 目: "にっこり", 右腕: "ピース" }, mouthOpen: "わあーい", mouthClosed: "にしー" },
    62: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    63: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    67: { pick: { まゆ: "困り眉" }, mouthClosed: "△" },
    68: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    69: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "△" },
    71: { pick: { まゆ: "困り眉", 右腕: "口元" }, mouthOpen: "えあー", mouthClosed: "む" },
    72: { pick: { まゆ: "困り眉", 目: "上向き" }, mouthClosed: "む" },
    74: { pick: { 目: "〇〇", 右腕: "口元" }, mouthOpen: "お", mouthClosed: "△" },
    76: { pick: { 目: "〇〇" }, mouthClosed: "△" },
    77: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthOpen: "おあー", mouthClosed: "△" },
    78: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    79: { pick: { まゆ: "困り眉", 目: "上向き" }, mouthOpen: "お", mouthClosed: "む" },
    80: { pick: { 目: "にっこり" }, mouthClosed: "にしー" },
    81: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    83: { pick: { まゆ: "困り眉" }, mouthOpen: "えあー", mouthClosed: "む" },
    86: { pick: { 目: "上向き" } },
    87: { pick: { まゆ: "ごきげん眉", 目: "閉じ", 右腕: "口元" }, mouthOpen: "わあ", mouthClosed: "ほほえみ" },
    88: { pick: { 目: "にっこり" } },
    89: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    90: tFlat,
    91: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "△" },
    92: { pick: { まゆ: "おこ眉", 目: "><", 右腕: "ゆびさし" }, mouthClosed: "おあー" },
    93: { pick: { まゆ: "おこ眉", 目: "><", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" },
    96: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    98: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    99: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" },
    101: { pick: { 目: "にっこり" }, mouthOpen: "わあ" },
    103: { pick: { まゆ: "困り眉", 目: "閉じ" }, mouthClosed: "む" },
    104: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "む" },
    105: tSmile,
  },
};

/** その台詞のときの表情（めたんの「見開き白目」は 目＝目セット の下のグループで切り替える） */
export const expressionAt = (who: Speaker, lineIndex: number): Expression => {
  const base = BASES[who];
  const change = LINE_CHANGES[who][lineIndex] ?? {};
  const pick = { ...base.pick, ...change.pick };
  if (who === "metan" && (pick.目 === "見開き白目" || pick.目 === "普通白目")) {
    pick.目セット = pick.目;
    pick.目 = "目セット";
  }
  return {
    pick,
    toggles: { ...base.toggles, ...change.toggles },
    mouthOpen: change.mouthOpen ?? base.mouthOpen,
    mouthClosed: change.mouthClosed ?? base.mouthClosed,
  };
};

/** めたん（管理人）が見回りに来る台詞（S1「何を騒いでいるの？」）。それまでは2人 */
export const METAN_ENTERS_AT_LINE = 6;

/** 立ち位置の向き。リビング・洗面台では、左のずんだもんが右の2人の方を向く。洗濯機置き場は styleframe の S7B と同じ */
export const FLIP: Record<"living" | "laundry", Record<Speaker, boolean>> = {
  living: { zundamon: true, metan: false, tsumugi: false },
  laundry: { zundamon: false, metan: true, tsumugi: false },
};

/** 画面の上に出すテロップ（場所や時間が飛んだことを示す）。台詞の頭から出す */
export const TELOPS: { line: number; text: string }[] = [{ line: 49, text: "数日後" }];

/**
 * 差し込みの図の手順を、台詞の中で言った順に強調する。marks は台詞の中のことば（その位置まで読んだら次の手順へ）。
 * 台詞の長さに対する文字の位置で時刻を決める（字幕の区切りと同じ考え方）
 */
export const INSERT_STEPS: { line: number; marks: string[] }[] = [
  { line: 16, marks: ["古い網", "新しい網", "ゴムで"] },
  { line: 54, marks: ["ゴミ受け", "回して"] },
  { line: 75, marks: ["台に", "ダクト", "ネジ"] },
];

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 1, at: "start", file: "surprise1.mp3" }, // 先出し「えっ……これだけ」
  { line: 5, at: "start", file: "shock2.mp3" }, // 蚊の音で叫びたくなる
  { line: 7, at: "start", file: "surprise1.mp3" }, // 「今すぐ業者を呼ぶのだ！」に寄る
  { line: 13, at: "start", file: "nyu3.mp3" }, // 「編まないです」
  { line: 16, at: "start", file: "data-display1.mp3" }, // 網戸の断面図が出る
  { line: 25, at: "start", file: "tin1.mp3" }, // 「できたのだ！」（たるんでいる）
  { line: 26, at: "start", file: "nyu3.mp3" }, // ハンモック
  { line: 32, at: "start", file: "surprise1.mp3" }, // 「え、できたのだ！？」
  { line: 36, at: "start", file: "sceneswitch1.mp3" }, // 反論（つむぎに寄る）
  { line: 49, at: "start", file: "sceneswitch1.mp3" }, // 数日後、洗面台
  { line: 54, at: "start", file: "data-display1.mp3" }, // 排水口の図
  { line: 57, at: "start", file: "shock2.mp3" }, // 緑色の毛
  { line: 61, at: "start", file: "tin1.mp3" }, // 流れました
  { line: 69, at: "start", file: "nyu3.mp3" }, // アミー
  { line: 70, at: "start", file: "sceneswitch1.mp3" }, // 洗濯機置き場
  { line: 75, at: "start", file: "data-display1.mp3" }, // 説明書のページ
  { line: 79, at: "end", file: "pico-pico-hammer1.mp3" }, // 「あ、しまった」（ネジがしまった）
  { line: 80, at: "start", file: "surprise1.mp3" }, // 「えっ……これだけ、なのだ！？」
  { line: 91, at: "start", file: "shock2.mp3" }, // ガスの配管
  { line: 94, at: "start", file: "data-display1.mp3" }, // 自分でやる・プロに頼むの表
];

/**
 * BGM（public/bgm）。そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。
 * シーンが変わったら曲も変える。最後のあいさつは本編と違う曲にする（段階6 のユーザーの指示）。
 * scene が "outro" の曲は、本編おわりの合図（ちゃんちゃん♪）が鳴り終わってから始める。その前の曲は合図の前に消し切る
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
// 曲は OpenTracks（旧 DOVA-SYNDROME）。gain は曲ごとの音の大きさをそろえる倍率で、前の2本の「自宅にて」（RMS -20.4dB）に合わせた
// （90秒の RMS: キャッハー -12.8 / ほんわかぷっぷー -20.5 / 2:23 AM -13.9 / You and Me -14.5 / 10℃ -15.3 / わくわくクッキング -21.3 / Morning -13.7 dB）
const KYAHHA = { file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 };
const HONWAKA = { file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 };
export const BGM_CUES: BgmCue[] = [
  { scene: "S0", ...KYAHHA }, // 網戸に穴、ずんだもんが大騒ぎ（S2 のタイトルまで）
  { scene: "S3", ...HONWAKA }, // 網戸の張り替えに挑戦
  // 2:23 AM（しゃろう）は YouTube の Content ID で申し立てが付いたので You and Me に替えた（2026-10-20）
  { scene: "S4", file: "you-and-me.mp3", title: "You and Me", composer: "しゃろう", gain: 0.51 }, // 押し付けてない？の会話
  { scene: "S5", ...KYAHHA }, // 排水口の詰まり
  { scene: "S6", file: "10do.mp3", title: "10℃", composer: "しゃろう", gain: 0.56 }, // 少し難しいことが一番楽しい
  { scene: "S7", file: "wakuwaku-cooking.mp3", title: "わくわくクッキングタイム的なBGM", composer: "鷹尾まさき", gain: 1.1 }, // 乾燥機の入れ替え
  { scene: "S8", ...KYAHHA }, // ガスの配管のオチ
  { scene: "S9", ...HONWAKA }, // まとめ
  { scene: "outro", file: "morning.mp3", title: "Morning", composer: "しゃろう", gain: 0.46 }, // 最後のあいさつと終了画面（本編と違う曲）
];
