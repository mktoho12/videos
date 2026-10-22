/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・画角・図・効果音・BGM を決める。
 * 前のショート yattoita の direction.ts を複製し、台詞ごとの変更・画角・図・効果音をこの台本に合わせて書き直した。
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
const zSing: Change = { pick: { 眉: "上がり眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる", 顔色: "ほっぺ赤め", 枝豆: "枝豆立ち" }, mouthOpen: "うわー", mouthClosed: "むふ" };
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };

/** 台詞の番号 → 表情の変更（base からの差分）。話していない人の反応も、その台詞の番号で書く */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: zSing, // ずんだー、ずんだー（歌う）
    2: { ...zSing, mouthClosed: "えへ" }, // （つむぎ）なにを唱えてるんですか
    3: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上", 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" }, // 流行ってる曲を歌ってる
    4: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // （つむぎ）声しか聞こえない
    5: { pick: { 眉: "困り眉", 目: "基本目↑" }, mouthClosed: "ん" }, // （めたん）聞こえるのは声だけ
    6: { pick: { 眉: "困り眉", 目: "〇〇", 左腕: "口元" }, mouthOpen: "ほあー", mouthClosed: "お" }, // ボクの歌だけ……？
    7: { pick: { 眉: "困り眉", 目: "〇〇", 顔色: "青ざめ" }, toggles: { 汗: true }, mouthClosed: "Δ" }, // （つむぎ）ずっと、ひとりで
    8: { pick: { 眉: "困り眉", 目: "><", 右腕: "口元", 左腕: "口元", 顔色: "ほっぺ赤め" }, toggles: { 汗: true }, mouthOpen: "うわー", mouthClosed: "うへえ" }, // 恥ずかしいのだ
  },
  metan: {
    1: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    5: { ...mExplain, pick: { 眉: "ごきげん", 右腕: "指差す" } }, // 聞こえるのは、ずんだもんの声だけ
    8: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
  },
  tsumugi: {
    1: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "お" }, // （ずんだもん）歌う
    2: tFlat, // なにを唱えてるんですか
    3: tFlat,
    4: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // 声しか聞こえない
    7: { pick: { まゆ: "困り眉" }, mouthClosed: "む" }, // ずっと、ひとりで
    8: tSmile,
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

/** 画角。書いていない台詞は「引き」（図や札を真ん中に、3人を下に並べる）。寄りは話している人に寄る。最後は「恥ずかしいのだ」の寄りで終える */
export const CLOSE_UPS = [3, 8];

/** 真ん中の図。from の台詞から、次の図の from の前まで出す */
export type Board = "singing" | "hearing";
export const BOARDS: { from: number; board: Board }[] = [
  { from: 1, board: "singing" },
  { from: 5, board: "hearing" },
];

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 2, at: "start", file: "shock2.mp3" }, // なにを唱えてるんですか
  { line: 3, at: "start", file: "nyu3.mp3" }, // 流行ってる曲を歌ってる（寄り）
  { line: 5, at: "start", file: "data-display1.mp3" }, // 聞こえ方の図
  { line: 8, at: "start", file: "surprise1.mp3" }, // 恥ずかしいのだ（寄り）
]

/**
 * BGM（public/bgm、OpenTracks）。前のショートと同じ並び（S1 追いかけっこキャッハー → S2 ほんわかぷっぷー）で、本編とつながって聞こえるようにする。
 * そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。gain は本編と同じ（曲ごとの音の大きさをそろえる倍率）
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 }, // 歌うずんだもん
  { scene: "S2", file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 }, // 聞こえ方
];
