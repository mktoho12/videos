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
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };

/** 台詞の番号 → 表情の変更（base からの差分）。話していない人の反応も、その台詞の番号で書く */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: { pick: { 眉: "困り眉", 目: "><", 右腕: "手を挙げる", 左腕: "手を挙げる" }, mouthOpen: "うわー", mouthClosed: "うへえ" }, // リモコンがないのだ！
    2: { pick: { 眉: "困り眉", 目: "基本目→" } },
    3: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上", 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" }, // ボクの指定席なのだ
    4: { pick: { 目: "基本目→" } },
    5: { pick: { 眉: "上がり眉", 目: "細め目" }, mouthClosed: "むふ" }, // だれも見ないのだ
    6: { pick: { 眉: "困り眉", 目: "〇〇", 左腕: "口元" }, mouthOpen: "ほあー", mouthClosed: "お" }, // ……リモコン、あったのだ
    7: { pick: { 眉: "困り眉", 目: "〇〇", 顔色: "青ざめ" }, toggles: { 汗: true }, mouthClosed: "Δ" }, // （つむぎ）全部、先輩のですね
    8: { pick: { 眉: "上がり眉", 目: "^^", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" }, // うまいこと言う
    9: { pick: { 眉: "困り眉", 目: "UU", 枝豆: "枝豆萎え" }, mouthClosed: "うへえ" }, // （つむぎ）拾うのは先輩ですよ
  },
  metan: {
    1: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    4: { ...mExplain, pick: { 眉: "ごきげん", 右腕: "指差す" } }, // ソファーの下は、のぞいてみた？
    6: { pick: { 眉: "ごきげん" } },
    9: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
  },
  tsumugi: {
    1: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "お" },
    2: tFlat, // いつもソファーで、ゴロゴロ
    6: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "お" },
    7: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // 全部、先輩のですね
    8: tFlat,
    9: tSmile, // 拾うのは先輩ですよ
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

/** 画角。書いていない台詞は「引き」。寄りは話している人に寄る。うまいこと言ったずんだもんに寄り、つむぎのつっこみは引きで終える */
export const CLOSE_UPS = [3, 8];

/** 真ん中の図。from の台詞から、次の図の from の前まで出す */
export type Board = "remote" | "sofa" | "found";
export const BOARDS: { from: number; board: Board }[] = [
  { from: 1, board: "remote" },
  { from: 4, board: "sofa" },
  { from: 6, board: "found" },
];

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 1, at: "start", file: "shock2.mp3" }, // リモコンがないのだ！
  { line: 4, at: "start", file: "data-display1.mp3" }, // ソファーの図
  { line: 6, at: "start", file: "surprise1.mp3" }, // 出てきた物
  { line: 7, at: "start", file: "pico-pico-hammer1.mp3" }, // 全部、先輩のですね
  { line: 9, at: "start", file: "tin1.mp3" }, // 拾うのは先輩ですよ
];

/**
 * BGM（public/bgm、OpenTracks）。前のショートと同じ並び（S1 追いかけっこキャッハー → S2 ほんわかぷっぷー）で、本編とつながって聞こえるようにする。
 * そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。gain は本編と同じ（曲ごとの音の大きさをそろえる倍率）
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 }, // 歌うずんだもん
  { scene: "S2", file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 }, // 聞こえ方
];
