/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・画角・図・効果音・BGM を決める。
 * 網戸のショート amido の direction.ts を複製し、台詞ごとの変更・画角・図・効果音をこの台本に合わせて書き直した。
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
const tPoint: Change = { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" };
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };
const mTired: Change = { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" };

/** 台詞の番号 → 表情の変更（base からの差分）。話していない人の反応も、その台詞の番号で書く */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: { pick: { 目: "基本目←" } }, // （つむぎ）入れっぱなしですよ
    2: { pick: { 目: "基本目→" }, mouthClosed: "むふ" }, // あとで出すのだ
    4: { ...zProud, pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上" } }, // 明日のボクを信じてほしい
    6: { pick: { 目: "基本目←" } },
    8: zSurprised, // （つむぎ）出しておきました
    9: { pick: { 眉: "困り眉", 目: "なごみ目", 顔色: "ほっぺ赤め" }, mouthOpen: "あは", mouthClosed: "えへ" }, // ありがとうなのだ
    12: { pick: { 眉: "困り眉", 目: "基本目↑", 左腕: "あごに指" }, mouthClosed: "ん" }, // なんで最近みんな細かい？
    13: zSurprised, // （めたん）家がきれいになったから
    14: zPanic, // どういうことなのだ？
  },
  metan: {
    5: mTired, // （つむぎ）何回言えば
    6: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } }, // 言うより、やっちゃったほうが早い
    11: mExplain, // やってもらったほうが、気づく
    13: { pick: { 眉: "ごきげん", 右腕: "指差す" } }, // 家がきれいになったからよ
  },
  tsumugi: {
    1: tPoint, // 入れっぱなしですよ！
    3: { pick: { まゆ: "おこ眉" }, mouthClosed: "む" }, // だいたい明日
    4: tFlat,
    5: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // 何回言えば
    7: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // あーしがですか？
    8: { pick: { まゆ: "普通眉", 黒目: "目逸らし" } }, // 出しておきました
    10: tSmile, // こっちのほうが早かった
    14: tSmile,
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

/** 画角。書いていない台詞は「引き」（図や札を真ん中に、3人を下に並べる）。寄りは話している人に寄る */
export const CLOSE_UPS = [4, 9];

/** 真ん中の図。from の台詞から、次の図の from の前まで出す */
export type Board = "washer" | "basket" | "mainVideo";
export const BOARDS: { from: number; board: Board }[] = [
  { from: 1, board: "washer" },
  { from: 8, board: "basket" },
  { from: 12, board: "mainVideo" },
];

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 1, at: "start", file: "shock2.mp3" }, // 洗濯物、入れっぱなし
  { line: 4, at: "start", file: "nyu3.mp3" }, // 明日のボクを信じてほしい（寄り）
  { line: 8, at: "start", file: "data-display1.mp3" }, // かごに出しておいた
  { line: 9, at: "start", file: "surprise1.mp3" }, // ありがとうなのだ（寄り）
  { line: 12, at: "start", file: "sceneswitch1.mp3" }, // 本編の札
];

/**
 * BGM（public/bgm、OpenTracks）。本編の冒頭（S1 追いかけっこキャッハー → S3 ほんわかぷっぷー）と同じ並びで、本編とつながって聞こえるようにする。
 * そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。gain は本編と同じ（曲ごとの音の大きさをそろえる倍率）
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 }, // 入れっぱなしの言い合い
  { scene: "S3", file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 }, // やっといた・本編へ
];
