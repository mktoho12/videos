/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・効果音・テロップを決める。
 * atarimae の direction.ts を複製し、この動画の台詞に合わせて書き直した（元はプリン裁判）。テロップ・場所の文字・名札・登場は src/shots.ts に移した。
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
const zArms = { 右腕: "手を挙げる", 左腕: "手を挙げる" };
const zFold = { 左腕: "腕組み(右腕は非表示に)", 右腕: "(非表示)" };
const tPoint: Change = { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" };
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };
const mKind: Change = { pick: { 眉: "ごきげん", 右腕: "手をかざす" } };
const mTired: Change = { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" };
const zGame: Change = { pick: { 眉: "上がり眉", 目: "><", 右腕: "手を挙げる", 枝豆: "枝豆立ち" }, mouthOpen: "うわー", mouthClosed: "むふ" };
const zSad: Change = { pick: { 眉: "困り眉", 目: "UU", 枝豆: "枝豆萎え" }, mouthClosed: "うへえ" };
const zRealize: Change = { pick: { 眉: "困り眉", 目: "〇〇", 左腕: "口元" }, mouthOpen: "ほあー", mouthClosed: "お" };
const mAsk: Change = { pick: { 眉: "ごきげん", 右腕: "手をかざす" }, mouthClosed: "ほほえみ" };

/** 台詞の番号 → 表情の変更（base からの差分）。話していない人の反応も、その台詞の番号で書く */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: zGame, // 撃つのだー！
    2: { ...zGame, pick: { 眉: "上がり眉", 目: "^^", ...zArms, 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" }, // やったのだー！
    3: { pick: { 目: "基本目→" } }, // （つむぎ）なにを騒いでるんですか
    4: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し上" }, mouthClosed: "むふ" }, // 仲間が4人いる
    6: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" }, // ヘッドホンの中なのだ
    8: { pick: { 眉: "怒り眉", 目: "ジト目" }, mouthClosed: "むくー" }, // さみしくないのだ
    10: { pick: { 眉: "怒り眉", 目: "ジト目", ...zFold }, mouthClosed: "むくー" }, // ボクだって住人なのだ
    12: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し上" }, mouthClosed: "むふ" }, // 声を出したほうが強くなる
    14: { pick: { 眉: "上がり眉", 目: "^^", ...zFold }, mouthOpen: "あは", mouthClosed: "にやり" }, // 肺活量
    16: { pick: { 眉: "困り眉", 目: "〇〇", ...zArms }, toggles: { 汗: true }, mouthOpen: "うわー", mouthClosed: "Δ" }, // やられたのだ！
    17: { pick: { 眉: "怒り眉", 目: "ジト目→" }, mouthClosed: "むくー" },
    19: { pick: { 眉: "困り眉", 目: "基本目→", 右腕: "指差し横" }, mouthClosed: "むくー" }, // めたん、聞いてほしい
    22: { pick: { 眉: "困り眉", 目: "〇〇", 右腕: "口元", 左腕: "口元" }, toggles: { 汗: true }, mouthOpen: "うわー", mouthClosed: "Δ" }, // いいところなのだ
    23: { pick: { 眉: "困り眉", 目: "ジト目" }, mouthClosed: "むくー" }, // （めたん）ちょっとだけよ
    24: { pick: { 眉: "困り眉", 目: "ジト目←" }, mouthClosed: "むくー" }, // ……外したのだ（しぶしぶ）
    25: { pick: { 目: "基本目↑" }, mouthClosed: "ん" }, // （めたん）お友だちの声と自分の声
    28: { pick: { 眉: "上がり眉", 左腕: "あごに指" }, mouthClosed: "んー" }, // 当たり前なのだ
    29: { ...zSad, pick: { 眉: "困り眉", 目: "UU", 枝豆: "枝豆萎え", 顔色: "青ざめ" } }, // つむぎには、聞こえてなかったのか……
    31: { pick: { 眉: "困り眉", 目: "基本目↑" }, mouthClosed: "ん" }, // （めたん）電車の中の電話
    33: zRealize, // 電車で電話してる人だったのだ？
    35: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" }, // 禁止なのだ？
    37: { pick: { 眉: "困り眉", 目: "基本目→" }, mouthClosed: "んー" },
    40: { pick: { 眉: "上がり眉", 左腕: "あごに指" }, mouthClosed: "ん" }, // お茶を飲みに来た？
    43: { pick: { 眉: "困り眉", 目: "基本目←", 右腕: "指差し横" }, mouthClosed: "んー" }, // 半分空いてた
    45: { pick: { 眉: "困り眉", 目: "〇〇" }, mouthClosed: "Δ" }, // （つむぎ）部屋に戻って飲みますね
    46: zRealize, // リビングをまるごと使ってた
    48: { ...zSad, toggles: { 汗: true } }, // 王様になってた
    49: { pick: { 眉: "困り眉", 目: "><" }, mouthClosed: "うへえ" }, // （つむぎ）声が大きすぎました
    50: { pick: { 目: "なごみ目", 顔色: "ほっぺ赤め" }, mouthClosed: "えへ" }, // （めたん）えらいわよ
    53: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し横" }, mouthClosed: "にやり" }, // 女王様になってる
    55: { pick: { 目: "ジト目→" }, mouthClosed: "む" },
    57: { pick: { 眉: "上がり眉", 目: "細め目", ...zFold }, mouthClosed: "むふ" }, // 自分では気づけない
    58: { pick: { 目: "^^" }, mouthClosed: "にやり" }, // （つむぎ）くやしい
    59: { pick: { 眉: "上がり眉", 目: "基本目→", 左腕: "あごに指" }, mouthClosed: "ん" }, // で、ねこは
    61: { pick: { 目: "なごみ目", 右腕: "口元" }, mouthClosed: "むふ" }, // もしもしなのだ（小声のつもり）
    62: { pick: { 眉: "困り眉", 目: "><", ...zArms }, mouthOpen: "うわー", mouthClosed: "むくー" }, // 駅の、前、なのだ！
    63: { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" }, // （めたん）よく響くのよ
    64: { pick: { 眉: "困り眉", 目: "〇〇", ...zArms, 顔色: "青ざめ", 枝豆: "枝豆立ち" }, toggles: { 汗多め: true }, mouthOpen: "うわー", mouthClosed: "Δ" }, // ひっ！
    65: { pick: { 目: "なごみ目", 左腕: "あごに指" }, mouthClosed: "むふ" }, // 人が増えた気がする
    67: { pick: { 目: "にっこり" }, mouthOpen: "あは", mouthClosed: "えへ" }, // お茶を飲んでるだけ
    70: { pick: { 眉: "困り眉", 目: "〇〇" }, mouthClosed: "Δ" }, // （つむぎ）出づらかった
    71: { ...zSad, toggles: { 汗: true } }, // 扉を閉めさせてた
    73: { pick: { 眉: "困り眉", 目: "基本目↑", ...zFold }, mouthClosed: "むくー" }, // たまには叫びたい
    75: { pick: { 眉: "上がり眉", 目: "〇〇", 左腕: "あごに指" }, mouthClosed: "お" }, // みんなでできるゲーム
    76: { pick: { 眉: "上がり眉", 目: "にっこり", ...zArms, 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" }, // いっしょにやるのだ！
    79: zGame, // みんなで叫ぶ場所だった
    80: { pick: { 目: "^^" }, mouthClosed: "えへ" },
    82: { pick: { 目: "にっこり", 右腕: "指差し上", 顔色: "ほっぺ赤め" }, mouthOpen: "あは", mouthClosed: "えへ" }, // みんなで使ったほうが楽しい
    84: { pick: { 目: "なごみ目", ...zFold }, mouthClosed: "むふ" }, // ただの住人に戻る
    85: { pick: { 目: "にっこり", 右腕: "手を挙げる" }, mouthOpen: "あは", mouthClosed: "えへ" }, // あいさつ
  },
  metan: {
    18: { pick: { 眉: "ややおこ" } }, // 廊下まで聞こえていたわよ
    19: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    21: mAsk, // ちょっと外してみて
    22: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" }, // （ずんだもん）いいところなのだ
    23: mAsk, // ちょっとだけよ
    25: mExplain, // お友だちの声と自分の声
    26: mExplain,
    29: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" }, // （ずんだもん）聞こえてなかったのか
    31: mExplain, // 電車の中の電話
    33: mKind,
    34: mKind, // 悪気がないのは、わかってる
    36: { pick: { 眉: "ごきげん" } }, // 禁止したいわけじゃない
    38: mExplain,
    39: mAsk, // なにをしに来たのかしら
    42: mAsk, // だれが座っていたの？
    44: { pick: { 眉: "ごきげん", 右腕: "指差す" }, mouthClosed: "にやり" }, // 叫ばれていたら？
    47: mKind, // ひとりじめしていないか
    48: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    50: { pick: { 眉: "太眉ごきげん" }, mouthClosed: "ほほえみ" }, // えらいわよ
    63: { pick: { 眉: "ややおこ" }, mouthClosed: "にやり" }, // よく響くのよ
    64: { pick: { 眉: "太眉ごきげん" }, mouthClosed: "にやり" }, // （ずんだもん）ひっ！
    66: { pick: { 眉: "ごきげん" } }, // 今夜はにぎやかね
    68: mExplain, // 人が出てきたくなる場所
    69: mExplain,
    72: mKind, // みんなの場所でいられれば
    73: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" },
    74: mExplain,
    78: { pick: { 眉: "ごきげん" } },
    80: mTired, // 叫ばなくていいのよ
    83: mKind, // 王様は卒業ね
  },
  tsumugi: {
    1: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "お" }, // （ずんだもん）撃つのだー！
    2: { pick: { まゆ: "困り眉", 目: "〇〇" }, mouthClosed: "お" },
    3: { pick: { まゆ: "困り眉" }, mouthClosed: "む" }, // なにを騒いでるんですか
    5: { pick: { まゆ: "困り眉", 目: "〇〇" } }, // 4人？
    7: { pick: { まゆ: "普通眉", 右腕: "口元" }, mouthClosed: "にしー" }, // 画面に話しかけてるのかと
    9: tPoint, // みんなが使うところですよ
    11: tPoint, // 声が大きいって話です
    13: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // そういうものなんですか？
    15: tFlat, // そんなわけないでしょ
    16: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    17: tPoint, // あーしのせいにしないで
    20: { pick: { まゆ: "おこ眉" }, mouthClosed: "む" }, // じゃましてないです
    27: tFlat, // ひとりで叫んでるようにしか
    30: tFlat, // 1人も聞こえてないです
    32: { pick: { まゆ: "困り眉" }, mouthClosed: "む" },
    41: { pick: { まゆ: "ごきげん眉" }, mouthClosed: "ほほえみ" }, // ゆっくり飲もうと
    45: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // 部屋に戻って飲みますね
    49: tSmile, // 王様にしては
    51: { pick: { まゆ: "ごきげん眉", 目: "〇〇", 右腕: "口元" }, mouthOpen: "わあ", mouthClosed: "お" }, // こたつに戻るんですか！
    52: { pick: { まゆ: "ごきげん眉", 目: "><", 右腕: "口元" }, mouthOpen: "わあーい", mouthClosed: "にしー" }, // ずるいです！
    53: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // （ずんだもん）女王様
    54: { pick: { まゆ: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "む" }, // すみません
    56: tFlat,
    58: { pick: { まゆ: "おこ眉" }, mouthClosed: "むん" }, // くやしいです
    60: tPoint, // 気になってるじゃないですか
    66: { pick: { まゆ: "ごきげん眉" } },
    70: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // 出づらかった
    74: { pick: { まゆ: "ごきげん眉" } },
    77: { pick: { まゆ: "ごきげん眉", 目: "〇〇", 右腕: "ピース" }, mouthOpen: "わあーい", mouthClosed: "にしー" }, // あーしも入れて
    79: { pick: { 目: "〇〇" }, mouthClosed: "お" },
    80: tSmile,
    81: tSmile, // ずっと楽しそう
    84: tSmile,
    85: { pick: { まゆ: "ごきげん眉", 目: "にっこり", 右腕: "ピース" }, mouthClosed: "にしー" },
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


/** 立ち位置の向き。左のずんだもんが右の2人の方を向く */
export const FLIP: Record<Speaker, boolean> = { zundamon: true, metan: false, tsumugi: false };

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 3, at: "start", file: "surprise1.mp3" }, // ……先輩、ひとりでなにを騒いでるんですか？
  { line: 15, at: "start", file: "pico-pico-hammer1.mp3" }, // そんなわけないでしょ
  { line: 16, at: "start", file: "shock2.mp3" }, // やられたのだ！
  { line: 22, at: "start", file: "surprise1.mp3" }, // えっ！？今、いいところなのだ
  { line: 25, at: "start", file: "data-display1.mp3" }, // 聞こえ方の図（左）
  { line: 26, at: "start", file: "data-display1.mp3" }, // 聞こえ方の図（右が出る）
  { line: 29, at: "start", file: "shock2.mp3" }, // つむぎには、聞こえてなかったのか
  { line: 46, at: "start", file: "surprise1.mp3" }, // リビングをまるごと使ってた
  { line: 49, at: "start", file: "pico-pico-hammer1.mp3" }, // 王様にしては、声が大きすぎました
  { line: 51, at: "start", file: "sceneswitch1.mp3" }, // 次の日
  { line: 61, at: "start", file: "sceneswitch1.mp3" }, // その夜中
  { line: 64, at: "start", file: "shock2.mp3" }, // ひっ！
  { line: 65, at: "start", file: "sceneswitch1.mp3" }, // 次の週
  { line: 68, at: "start", file: "data-display1.mp3" }, // リビングの図
  { line: 71, at: "start", file: "shock2.mp3" }, // ボクが、扉を閉めさせてた
  { line: 80, at: "start", file: "pico-pico-hammer1.mp3" }, // 叫ばなくていいのよ
  { line: 84, at: "start", file: "tin1.mp3" }, // ただの住人に戻るのだ
];

/**
 * BGM（public/bgm）。そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。
 * シーンが変わったら曲も変える。最後のあいさつは本編と違う曲にする（channel/zundamon-guide.md）。
 * scene が "outro" の曲は、本編おわりの合図（ちゃんちゃん♪）が鳴り終わってから始める。その前の曲は合図の前に消し切る
 * 曲を選ぶ前に channel/bgm-checks.md（申し立ての記録）を見る
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
// 曲は OpenTracks（旧 DOVA-SYNDROME）。gain は曲ごとの音の大きさをそろえる倍率で、「自宅にて」（RMS -20.4dB）に合わせた（omoikomi で測った値）
const KYAHHA = { file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 };
const HONWAKA = { file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", ...KYAHHA }, // 通話しながらのゲームと、つむぎとの軽口（S2 のタイトルまで）
  { scene: "S3", ...HONWAKA }, // 聞こえ方
  { scene: "S4", file: "you-and-me.mp3", title: "You and Me", composer: "しゃろう", gain: 0.51 }, // ひとりじめに気づく
  { scene: "S5", ...KYAHHA }, // 次の日、つむぎの動画
  { scene: "S6", file: "10do.mp3", title: "10℃", composer: "しゃろう", gain: 0.56 }, // 夜中の電話
  { scene: "S7", ...HONWAKA }, // 人が出てくるリビング
  { scene: "S8", file: "jitaku-nite.mp3", title: "自宅にて", composer: "KK", gain: 1 }, // 着地
  { scene: "outro", file: "morning.mp3", title: "Morning", composer: "しゃろう", gain: 0.46 }, // 最後のあいさつと終了画面（本編と違う曲）
];
