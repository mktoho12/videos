/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・立ち位置・図を決める。
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

/** 口のグループ名（つむぎの PSD だけ「口」の上の階層の名前が同じ） */
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

/** 台詞の番号 → 表情の変更（base からの差分） */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: { pick: { 目: "にっこり", 右腕: "手を挙げる", 顔色: "ほっぺ赤め" }, mouthOpen: "あは", mouthClosed: "えへ" },
    2: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    3: { pick: { 目: "〇〇" }, mouthOpen: "お", mouthClosed: "お" },
    4: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    5: { pick: { 眉: "上がり眉", 右腕: "指差し上", 枝豆: "枝豆立ち" }, mouthOpen: "あは" },
    6: { pick: { 眉: "困り眉", 目: "基本目→" }, toggles: { 汗: true }, mouthClosed: "んえー" },
    7: { pick: { 眉: "上がり眉", 右腕: "指差し上" } },
    8: { pick: { 眉: "上がり眉", 目: "ジト目" }, mouthClosed: "むくー" },
    9: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "あごに指" }, mouthOpen: "ほあ" },
    10: { pick: { 目: "基本目↑", 左腕: "あごに指" }, mouthClosed: "んー" },
    11: { pick: { 目: "にっこり", 右腕: "手を挙げる" }, mouthOpen: "あは" },
    12: { pick: { 眉: "困り眉", 目: "ジト目" }, mouthClosed: "むくー" },
    13: { pick: { 眉: "怒り眉", 右腕: "指差し横" }, mouthOpen: "うわー" },
    14: { pick: { 眉: "怒り眉" }, mouthClosed: "むくー" },
    15: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)" } },
    16: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "うへえ" },
    17: { pick: { 眉: "怒り眉", 右腕: "チョップ" }, mouthOpen: "うわー" },
    18: { pick: { 眉: "怒り眉" }, mouthClosed: "むくー" },
    19: { pick: { 眉: "怒り眉2", 目: "ジト目", 右腕: "チョップ" }, mouthOpen: "うわー" },
    20: { pick: { 眉: "怒り眉2", 目: "ジト目" }, mouthClosed: "むくー" },
    21: { pick: { 眉: "困り眉", 目: "ジト目", 枝豆: "枝豆萎え" }, mouthOpen: "んえー", mouthClosed: "んえー" },
    22: { pick: { 眉: "困り眉", 目: "ジト目", 枝豆: "枝豆萎え" }, mouthClosed: "んー" },
    23: { pick: { 目: "基本目→" }, mouthClosed: "お" },
    24: { pick: { 眉: "困り眉", 目: "基本目→" }, toggles: { 汗: true }, mouthClosed: "むくー" },
    25: { pick: { 眉: "怒り眉", 右腕: "手を挙げる", 枝豆: "枝豆立ち" }, mouthOpen: "うわー" },
    26: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    27: { pick: { 眉: "困り眉", 目: "><", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "うへえ", mouthClosed: "うへえ" },
    28: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    29: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    30: { pick: { 眉: "困り眉", 目: "細め目", 右腕: "基本", 左腕: "基本" }, mouthOpen: "ほあ", mouthClosed: "んー" },
    31: { pick: { 眉: "困り眉", 右腕: "基本", 左腕: "基本" }, mouthClosed: "んー" },
    32: { pick: { 目: "基本目→" }, mouthClosed: "ほほえみ" },
    33: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    34: { pick: { 目: "基本目→" } },
    35: { pick: { 目: "基本目→" } },
    36: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    37: { pick: { 目: "にっこり", 右腕: "手を挙げる" }, mouthOpen: "あは", mouthClosed: "えへ" },
    38: { pick: { 目: "基本目↑" }, toggles: { 汗: true }, mouthClosed: "えへ" },
    39: { pick: { 目: "基本目→" } },
    40: { pick: { 目: "基本目↑", 左腕: "あごに指" }, mouthOpen: "ほあ" },
    41: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    42: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    43: { pick: { 目: "基本目→" } },
    44: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    45: { pick: { 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは" },
    46: { pick: { 目: "なごみ目" }, mouthClosed: "ほほえみ" },
    47: { pick: { 眉: "上がり眉", 右腕: "手を挙げる", 左腕: "手を挙げる", 枝豆: "枝豆立ち" }, mouthOpen: "あは" },
    48: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "腰" }, mouthClosed: "えへ" },
    49: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し上" }, mouthOpen: "ほあ" },
    50: { pick: { 眉: "上がり眉", 目: "にっこり" }, mouthClosed: "えへ" },
    51: { pick: { 眉: "怒り眉", 目: "〇〇", 右腕: "指差し横", 枝豆: "枝豆立ち" }, mouthOpen: "うわー" },
    52: { pick: { 眉: "上がり眉", 右腕: "指差し横" }, mouthClosed: "にやり" },
    53: { pick: { 眉: "上がり眉", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)" }, mouthClosed: "にやり" },
    54: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)", 枝豆: "枝豆立ち" }, mouthOpen: "ほあ" },
    55: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    56: { pick: { 眉: "困り眉", 目: "><", 枝豆: "枝豆萎え" }, toggles: { 汗多め: true }, mouthOpen: "うへえ", mouthClosed: "うへえ" },
    57: { pick: { 目: "基本目→" } },
    58: { pick: { 目: "基本目→" } },
    59: { pick: { 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" },
  },
  metan: {
    23: { pick: { 眉: "ごきげん", 右腕: "手をかざす" }, mouthOpen: "お" },
    24: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    25: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    26: { pick: { 眉: "ややおこ", 目: "目閉じ" }, mouthOpen: "▽" },
    27: { pick: { 眉: "ややおこ" }, mouthClosed: "む" },
    28: { pick: { 眉: "太眉こまり", 右腕: "手をかざす" }, mouthOpen: "▽" },
    29: { pick: { 眉: "ごきげん" } },
    30: { pick: { 眉: "ごきげん" } },
    31: { pick: { 眉: "ごきげん", 右腕: "指差す" }, mouthClosed: "にやり" },
    32: { pick: { 目: "目閉じ" } },
    33: { pick: { 眉: "太眉こまり", 左腕: "口元に指" }, mouthClosed: "む" },
    34: { pick: { 右腕: "手をかざす" } },
    36: { pick: { 右腕: "指差す" } },
    37: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    39: { pick: { 目: "目閉じ" } },
    41: { pick: { 右腕: "手をかざす" } },
    42: { pick: { 右腕: "手をかざす" } },
    43: { pick: { 目: "目閉じ" } },
    44: { pick: { 右腕: "指差す" } },
    46: { pick: { 目: "目閉じ", 右腕: "手をかざす" } },
    47: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    48: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    49: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    50: { pick: { 眉: "こまり", 目: "見開き白目" }, mouthOpen: "む", mouthClosed: "む" },
    51: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    52: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    53: { pick: { 眉: "ややおこ", 目: "目閉じ" }, mouthOpen: "▽" },
    54: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    55: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    56: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    57: { pick: { 右腕: "手をかざす" } },
  },
  tsumugi: {
    1: { pick: { 目: "上向き" } },
    2: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" },
    3: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthClosed: "むん" },
    4: { pick: { まゆ: "おこ眉", 目: "><" }, mouthOpen: "おあー" },
    5: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    6: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    7: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" },
    8: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "えあー" },
    9: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    10: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    11: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    12: { pick: { まゆ: "困り眉", 右腕: "口元" }, mouthOpen: "えあー" },
    13: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" },
    14: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    15: { pick: { まゆ: "おこ眉", 目: "〇〇" }, mouthClosed: "△" },
    16: { pick: { まゆ: "おこ眉", 目: "><", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    17: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" },
    18: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    19: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" },
    20: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    21: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    22: { pick: { まゆ: "困り眉" }, mouthOpen: "えあー", mouthClosed: "む" },
    23: { pick: { 目: "上向き" }, mouthClosed: "お" },
    24: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, toggles: { なみだめ: true }, mouthOpen: "おあー" },
    25: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" },
    26: { pick: { まゆ: "おこ眉", 目: "にっこり" }, mouthClosed: "にしー" },
    27: { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" },
    28: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    29: { pick: { まゆ: "困り眉", 右腕: "口元" }, toggles: { 汗: true }, mouthOpen: "えあー", mouthClosed: "む" },
    30: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    31: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    32: { pick: { まゆ: "困り眉", 右腕: "口元" }, mouthOpen: "ほあー" },
    33: { pick: { 目: "上向き" }, mouthClosed: "む" },
    35: { pick: { まゆ: "困り眉" }, mouthOpen: "お" },
    37: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" },
    38: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "えあー" },
    39: { pick: { 目: "にっこり" }, mouthClosed: "にしー" },
    42: { pick: { 目: "〇〇" }, mouthClosed: "△" },
    43: { pick: { まゆ: "困り眉", 右腕: "口元" }, mouthOpen: "ほあー" },
    44: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    46: { pick: { 目: "にっこり" }, mouthClosed: "ほほえみ" },
    48: { pick: { まゆ: "困り眉", 目: "〇〇", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "おあー" },
    49: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "△" },
    50: { pick: { まゆ: "困り眉" }, toggles: { 汗: true }, mouthClosed: "む" },
    51: { pick: { まゆ: "困り眉", 目: "〇〇", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthClosed: "おあー" },
    52: { pick: { まゆ: "おこ眉", 目: "><", 右腕: "ゆびさし" }, mouthOpen: "おあー" },
    53: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    54: { pick: { まゆ: "困り眉", 目: "上向き" }, mouthClosed: "む" },
    55: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "えあー", mouthClosed: "むん" },
    56: { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" },
    58: { pick: { 右腕: "ピース" }, mouthOpen: "わあ" },
    59: { pick: { 目: "にっこり" } },
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

/** めたんが入ってくる台詞（S4 の頭）。ここから3人並びになる */
export const METAN_ENTERS_AT_LINE = 23;

/**
 * 立ち位置（画面幅に対する立ち絵の中心）。台詞の番号から切り替え、前の立ち位置から motion.enterSec で移る。
 * two: 2人の言い合い（style.tachieCenterX の left / right）、trio: 3人並び（trioLeft / center / trioRight）、
 * fridge: S7 の冷蔵庫の図を左寄りに置くため、3人を左右に寄せる
 */
export type Formation = "two" | "trio" | "fridge";
export const FORMATION_FROM_LINE: { from: number; formation: Formation }[] = [
  { from: 1, formation: "two" },
  { from: METAN_ENTERS_AT_LINE, formation: "trio" },
  { from: 48, formation: "fridge" },
  { from: 57, formation: "trio" },
];

/** 背景（public/bg）。台詞の番号から切り替える。S7 の「翌日」（48）で夕方のキッチンに変える */
export const BACKGROUND_FROM_LINE: { from: number; file: string }[] = [
  { from: 1, file: "kitchen_night.png" },
  { from: 48, file: "kitchen_evening.png" },
];

/** 図。台詞の番号の範囲で出す */
export type Panel =
  | { kind: "pudding" }
  | { kind: "title"; text: string }
  | { kind: "counter" }
  | { kind: "rule" }
  | { kind: "houses" }
  | { kind: "fridge" }
  | { kind: "message" };

export const PANELS: { from: number; to: number; panel: Panel }[] = [
  { from: 2, to: 4, panel: { kind: "pudding" } },
  { from: 5, to: 6, panel: { kind: "title", text: "プリン裁判は2人では終わらない" } },
  { from: 7, to: 22, panel: { kind: "counter" } },
  { from: 36, to: 39, panel: { kind: "rule" } },
  { from: 41, to: 46, panel: { kind: "houses" } },
  { from: 48, to: 56, panel: { kind: "fridge" } },
  { from: 57, to: 59, panel: { kind: "message" } },
];

/** 往復カウンター（S3）: 言い分がぶつかった回数。ずんだもん→つむぎ の1往復ごとに増える。19〜22 で「平行線……」 */
export const COUNTER_PARALLEL_FROM_LINE = 19;

/** 3軒の冷蔵庫（S6）: その台詞から何軒目までを見せるか */
export const HOUSES_REVEAL: { from: number; count: number }[] = [
  { from: 41, count: 1 },
  { from: 42, count: 2 },
  { from: 44, count: 3 },
];

/** まとめ（S8）: その台詞から何行目までを見せるか */
export const MESSAGE_REVEAL: { from: number; count: number }[] = [
  { from: 57, count: 1 },
  { from: 58, count: 2 },
  { from: 59, count: 3 },
];

/** 「翌日」の札を出す台詞 */
export const NEXT_DAY_LINE = 48;

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };

export const SE_CUES: SeCue[] = [
  { line: 2, at: "start", file: "nyu3.mp3" }, // 空のプリンの図が出る
  { line: 5, at: "start", file: "pico-pico-hammer1.mp3" }, // 「開廷するのだ！」（裁判の木槌の代わりにおもちゃのハンマー）
  { line: 7, at: "start", file: "data-display1.mp3" }, // 往復カウンターが出る
  { line: 19, at: "start", file: "nyu3.mp3" }, // 「平行線……」
  { line: 23, at: "start", file: "sceneswitch1.mp3" }, // めたんが入ってくる
  { line: 27, at: "start", file: "shock2.mp3" }, // ずんだもん「うっ」
  { line: 36, at: "start", file: "data-display1.mp3" }, // 名前と日付のプリン
  { line: 41, at: "start", file: "data-display1.mp3" }, // 3軒の冷蔵庫
  { line: 48, at: "start", file: "sceneswitch1.mp3" }, // 翌日、貼り紙だらけの冷蔵庫
  { line: 51, at: "start", file: "surprise1.mp3" }, // 「ルール違反なのだ！」
  { line: 56, at: "start", file: "shock2.mp3" }, // ずんだもん「うっ」
  { line: 57, at: "start", file: "nyu3.mp3" }, // まとめの図
  { line: 59, at: "end", file: "tin1.mp3" }, // オチ「貼り紙は、1枚でいいのだ」
];
