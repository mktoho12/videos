/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・効果音・図を決める。
 * 表情は台詞の頭で切り替わり、次の台詞の頭で base に戻ってから、その台詞の変更を当てる（前の変更は引き継がない）。
 * パーツの名前は立ち絵 PSD のレイヤー名（public/tachie/<キャラ>/manifest.json を参照）。
 * 本編 tadashii-sharehouse の direction.ts の作りをそのまま使う。
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
    pick: { まゆ: "普通眉", 目: "基本目セット", 右腕: "基本", 左腕: "基本" },
    toggles: { ほっぺ: true },
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
    // S2 自分のお皿はピカピカ（得意げ）
    1: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "手を挙げる", 顔色: "ほっぺ赤め" }, mouthOpen: "あは", mouthClosed: "えへ" },
    2: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    3: { pick: { 目: "にっこり" }, mouthClosed: "えへ" },
    // S3 鍋は誰の？（目をそらす）
    4: { pick: { 目: "基本目→" }, mouthClosed: "ん" },
    5: { pick: { 目: "基本目→" }, mouthOpen: "ほあ", mouthClosed: "んー" },
    6: { pick: { 目: "基本目→" }, mouthClosed: "んー" },
    7: { pick: { 目: "基本目→" }, mouthClosed: "んー" },
    8: { pick: { 眉: "基本眉2", 目: "ジト目→" }, mouthOpen: "ほあ", mouthClosed: "んー" },
    9: { pick: { 眉: "困り眉", 目: "基本目→" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    // S4 1.1倍（聞いている）
    10: { pick: { 目: "基本目" }, mouthClosed: "ほう" },
    11: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    12: { pick: { 眉: "上がり眉", 目: "基本目↑", 左腕: "あごに指" }, mouthClosed: "んー" },
    // S5 オチ（張り切る → 得意げ）
    13: { pick: { 眉: "上がり眉", 目: "><", 右腕: "手を挙げる", 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "あは" },
    14: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" },
    15: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち" }, mouthClosed: "えへ" },
  },
  metan: {
    1: { mouthClosed: "ほほえみ" },
    2: { mouthClosed: "ほほえみ" },
    // S2 わたくしも完璧（目を閉じて得意げ）
    3: { pick: { 目: "目閉じ" }, mouthOpen: "わあー", mouthClosed: "ほほえみ" },
    4: { pick: { 黒目: "目そらし" }, mouthClosed: "む" },
    5: { pick: { 黒目: "目そらし" }, mouthClosed: "む" },
    6: { pick: { 黒目: "目そらし" }, mouthClosed: "む" },
    // みんなの、ね（すまして目を閉じる）
    7: { pick: { 目: "目閉じ" }, mouthOpen: "▽", mouthClosed: "ほほえみ" },
    8: { pick: { 目: "目閉じ" }, mouthClosed: "ほほえみ" },
    9: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    // S4 気づきを言う
    10: { pick: { 眉: "太眉こまり", 左腕: "口元に指" }, mouthOpen: "わあー", mouthClosed: "んー" },
    11: { pick: { 眉: "太眉ごきげん", 右腕: "指差す" }, mouthOpen: "わあー", mouthClosed: "ほほえみ" },
    12: { pick: { 眉: "太眉ごきげん" }, mouthClosed: "ほほえみ" },
    // S5 オチ（あきれる）
    14: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    15: { pick: { 眉: "太眉こまり", 目: "目閉じ2" }, mouthClosed: "うえー" },
  },
  tsumugi: {
    1: { mouthClosed: "ほほえみ" },
    // S2 あーしもコップは洗いました（ピース）
    2: { pick: { まゆ: "ごきげん眉", 目: "にっこり", 右腕: "ピース" }, mouthOpen: "わあーい", mouthClosed: "むふ" },
    3: { pick: { まゆ: "ごきげん眉", 右腕: "ピース" }, mouthClosed: "むふ" },
    // S3 じゃあ、この鍋は？（指さす）
    4: { pick: { 右腕: "ゆびさし" }, mouthOpen: "お", mouthClosed: "む" },
    5: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    6: { pick: { まゆ: "困り眉" }, mouthOpen: "えあー", mouthClosed: "む" },
    7: { pick: { まゆ: "困り眉" }, mouthClosed: "△" },
    8: { pick: { まゆ: "おこ眉" }, mouthClosed: "む" },
    // 鍋、まだいるんですけど！
    9: { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "いー" },
    10: { mouthClosed: "む" },
    11: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    // ちょっとだけ多めに、ってことですね
    12: { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthOpen: "わあ", mouthClosed: "ほほえみ" },
    13: { pick: { まゆ: "ごきげん眉" }, mouthClosed: "ほほえみ" },
    14: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    // 取っ手だけ！？
    15: { pick: { まゆ: "困り眉", 目: "〇〇", 右腕: "ゆびさし" }, toggles: { 汗: true }, mouthOpen: "おあー", mouthClosed: "お" },
  },
};

/** その台詞のときの表情 */
export const expressionAt = (who: Speaker, lineIndex: number): Expression => {
  const base = BASES[who];
  const change = LINE_CHANGES[who][lineIndex] ?? {};
  return {
    pick: { ...base.pick, ...change.pick },
    toggles: { ...base.toggles, ...change.toggles },
    mouthOpen: change.mouthOpen ?? base.mouthOpen,
    mouthClosed: change.mouthClosed ?? base.mouthClosed,
  };
};

/** 「1日目 → 2日目 → 3日目」の札を出す、台詞の番号（この台詞の前の間に出す） */
export const DAYS_BEFORE_LINE = 9;
/**
 * 日ごとの背景（public/bg）と、鍋の汚れの段階（0〜3）。時の流れを見せる（ユーザーの指示）。
 * 0 日目＝最初（S1〜S3 の夜）。最後の寄りで 0 日目に戻し、ループで S1 とつなぐ
 */
export const DAYS: { background: string; grime: number }[] = [
  { background: "kitchen_night.png", grime: 0 },
  { background: "kitchen_evening.png", grime: 1 },
  { background: "kitchen_night.png", grime: 2 },
  { background: "kitchen_evening.png", grime: 3 },
];

/** 「1.1倍」のテロップを出す台詞の範囲 */
export const MULTIPLIER_LINES = { from: 11, to: 12 };
/** 取っ手を洗う間の、次の台詞（この台詞の頭で取っ手がピカピカになる） */
export const KNOB_SHINES_AT_LINE = 14;

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす。日付の札とループの頭は Nabe.tsx で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };

export const SE_CUES: SeCue[] = [
  { line: 9, at: "start", file: "shock2.mp3" }, // 鍋、まだいるんですけど！
  { line: 11, at: "start", file: "data-display1.mp3" }, // 「1.1倍」のテロップ
  { line: 14, at: "start", file: "tin1.mp3" }, // 取っ手がピカピカ
  { line: 15, at: "start", file: "surprise1.mp3" }, // 取っ手だけ！？
];
/** 日付の札が切り替わるたびの音 */
export const DAY_SE = "sceneswitch1.mp3";
/** ループの頭（S1、大鍋が出る）の音 */
export const OPEN_SE = "nyu3.mp3";
