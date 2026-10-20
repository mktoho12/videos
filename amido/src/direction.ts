/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・画角・図・効果音・BGM を決める。
 * 本編 omoikomi の direction.ts から、表情の決まり（base・まばたき・口パク）とよく使う表情をそのまま持ってきて、台詞ごとの変更をこの台本に合わせて書いた。
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
const zWork: Change = { pick: { 眉: "困り眉", 目: "基本目↑", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "んえー", mouthClosed: "んー" };
const tPoint: Change = { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" };
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };
const mTired: Change = { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" };

/** 台詞の番号 → 表情の変更（base からの差分） */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: zPanic, // たいへんなのだ！
    2: { ...zPanic, pick: { ...zPanic.pick, 枝豆: "枝豆立ち" }, toggles: { 汗多め: true } }, // 業者を呼ぶのだ！
    3: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" },
    4: { pick: { 眉: "上がり眉", 目: "細め目", 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)" }, mouthOpen: "ほあ" }, // プロの仕事なのだ
    5: { pick: { 眉: "困り眉", 目: "ジト目" }, mouthClosed: "むくー" },
    6: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    7: { pick: { 目: "基本目→" }, mouthClosed: "ほう" },
    8: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    9: { pick: { 眉: "上がり眉", 目: "ジト目", 右腕: "指差し横" }, mouthOpen: "ほあ", mouthClosed: "むくー" }, // 罠があるのだ
    10: zWork, // 端っこがよれた
    11: { ...zWork, pick: { ...zWork.pick, 眉: "上がり眉" } },
    12: zSurprised, // えっ……これだけ
    13: { pick: { 眉: "困り眉", 目: "基本目→" }, mouthClosed: "えへ" },
    14: { ...zProud, pick: { ...zProud.pick, 右腕: "手を挙げる", 左腕: "手を挙げる" } }, // 乾燥機まで
    15: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し横" }, mouthOpen: "あは", mouthClosed: "えへ" }, // 続きは本編で
  },
  metan: {
    1: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    2: { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" },
    3: mTired, // 網戸の穴よ？
    4: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    5: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
    6: { pick: { 眉: "ごきげん", 右腕: "手をかざす" } },
    7: mExplain,
    8: { pick: { 目: "目閉じ", 右腕: "指差す" } }, // これだけよ
    9: mTired,
    10: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    11: mExplain,
    12: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    13: { pick: { 眉: "ごきげん", 目: "目閉じ" } },
    14: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    15: { pick: { 目: "目閉じ" }, mouthClosed: "にやり" },
  },
  tsumugi: {
    1: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    2: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "△" },
    3: tFlat,
    4: tFlat,
    5: tPoint, // やる前からあきらめてません？
    6: tFlat,
    9: { pick: { まゆ: "困り眉", 目: "閉じ" }, mouthClosed: "む" },
    10: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    12: tSmile,
    13: { ...tPoint, pick: { ...tPoint.pick, まゆ: "ごきげん眉" }, mouthClosed: "にしー" }, // だから言ったじゃないですか
    14: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "△" },
    15: tSmile,
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
export const CLOSE_UPS = [2, 9, 12];

/** 真ん中の図。from の台詞から、次の図の from の前まで出す */
export type Board = "hole" | "diagram" | "handsWrinkled" | "handsPulled" | "mainVideo";
export const BOARDS: { from: number; board: Board }[] = [
  { from: 1, board: "hole" },
  { from: 6, board: "diagram" },
  { from: 10, board: "handsWrinkled" },
  { from: 11, board: "handsPulled" },
  { from: 14, board: "mainVideo" },
];

/** 断面図の手順を、台詞の中のこの言葉を言うときに1つずつ光らせる（文字数の割合で時刻を出す） */
export const DIAGRAM_STEPS = { line: 7, marks: ["古い網", "新しい網", "ゴムで"] };

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 1, at: "start", file: "shock2.mp3" }, // 網戸に穴
  { line: 2, at: "start", file: "surprise1.mp3" }, // 「業者を呼ぶのだ！」に寄る
  { line: 6, at: "start", file: "data-display1.mp3" }, // 断面図が出る
  { line: 10, at: "start", file: "nyu3.mp3" }, // よれた
  { line: 12, at: "start", file: "surprise1.mp3" }, // 「えっ……これだけ、なのだ！？」
  { line: 14, at: "start", file: "sceneswitch1.mp3" }, // 本編の札
];

/**
 * BGM（public/bgm、OpenTracks）。本編の冒頭と同じ2曲で、本編とつながって聞こえるようにする。
 * そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。gain は本編と同じ（曲ごとの音の大きさをそろえる倍率）
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 }, // 大さわぎ
  { scene: "S3", file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 }, // 中を見る・やってみる・本編へ
];
