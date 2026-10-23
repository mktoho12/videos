/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・効果音・テロップを決める。
 * hitorigoto の direction.ts を複製し、この動画の台詞に合わせて書き直した。テロップ・場所の文字・名札・登場は src/shots.ts に移した。
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
const zSleepy: Change = { pick: { 眉: "困り眉", 目: "UU" }, mouthOpen: "ほあー", mouthClosed: "むふ" };
const zRant: Change = { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し上" }, mouthOpen: "うわー", mouthClosed: "むふ" };
const zProud: Change = { pick: { 眉: "上がり眉", 目: "^^", ...zFold }, mouthOpen: "あは", mouthClosed: "えへ" };
const zShock: Change = { pick: { 眉: "困り眉", 目: "〇〇", ...zArms, 顔色: "青ざめ", 枝豆: "枝豆立ち" }, mouthOpen: "ほあー", mouthClosed: "お" };
const zHappy: Change = { pick: { 眉: "上がり眉", 目: "にっこり", ...zArms, 枝豆: "枝豆立ち" }, mouthOpen: "あは", mouthClosed: "えへ" };
const zThink: Change = { pick: { 眉: "上がり眉", 目: "基本目→", 左腕: "あごに指" } };
const tSurprise: Change = { pick: { まゆ: "困り眉", 目: "〇〇" } };
const tShock: Change = { pick: { まゆ: "困り眉", 目: "〇〇", 右腕: "口元" } };
const tSide: Change = { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" };
const mSmile: Change = { pick: { 眉: "ごきげん" } };

const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: zSleepy, // ねむいのだ
    3: zThink, // 本当に必要なのだ？
    5: zRant, // まくしたてる
    7: zRant, // アベマでも言ってたのだ
    8: { pick: { 目: "基本目→" } },
    9: zProud, // 反対の賛成なのだ
    12: zThink,
    14: zProud, // 玄関なら、ごふんで終わるのだ
    15: zRealize, // ……台所？
    16: zRealize,
    17: { ...zGame, pick: { 眉: "困り眉", 目: "><", ...zArms } }, // 持ち場なのだ！
    18: zSad,
    19: zProud, // 楽勝なのだ
    20: zHappy, // はい、終わりなのだ
    21: { pick: { 目: "基本目→" } },
    22: zProud, // だれも見ないのだ
    23: zSad,
    24: zSad, // しかたないのだ
    25: zShock, // ミニトマトが
    26: zShock,
    27: { ...zSad, pick: { 眉: "困り眉", 目: "UU", 枝豆: "枝豆萎え", 顔色: "青ざめ" } }, // ボクがこぼしたやつなのだ
    29: zThink, // カレーの日なのだ
    30: zSad,
    32: zShock, // パスタが一本
    33: zSad, // 手元しか見てなかったのだ
    36: { pick: { 目: "基本目←" } },
    38: zHappy, // 自分のミニトマトを見つけたのだ
    39: { pick: { 目: "基本目←" } },
    40: zThink,
    42: zSad, // 気づいてなかったのだ
    44: zSad,
    45: zProud, // 業者さんに頼めばいいのだ
    47: zProud, // 転がす自信があるのだ
    48: zSad,
    50: zRealize, // 自分のトマトを見つける日なのだ？
    53: zThink,
    55: zRealize,
    56: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" }, // がんばるのだ
    57: zThink,
    59: zHappy,
    60: zSad,
    61: zHappy, // ごちそうさまなのだ
    62: zProud, // トマトは転がってないのだ
    64: zProud, // 十秒で終わるのだ
    66: zHappy, // 掃除の日、いるのだ
    68: { ...zGame, pick: { 眉: "上がり眉", 目: "><", ...zArms, 枝豆: "枝豆立ち" } }, // かかってこい
    69: zShock, // 来月はお風呂ね
    70: zSad, // 具合が悪いのだ
    71: zSad,
    73: { pick: { 眉: "困り眉", 目: "基本目→" } }, // 一緒にやって欲しいのだ
    74: zHappy,
    79: zHappy, // ご視聴ありがとうございましたなのだ
  },
  metan: {
    11: mSmile,
    13: mExplain, // 割り振り表を見てちょうだい
    16: mExplain,
    18: mKind, // 持ち場はないのよ
    21: mAsk, // 冷蔵庫の下は、見たかしら
    23: mKind, // だから、見るのよ
    26: mAsk, // ソースかしら
    47: mTired,
    49: mSmile, // プロでも、ずんだもんのトマトは
    54: mExplain, // 来月の台所は、つむぎさんね
    65: mSmile,
    67: mKind,
    69: mAsk, // 来月はお風呂ね
    72: mTired, // 水回りは怖いわよね
    74: mKind, // 一緒にやりましょう
  },
  tsumugi: {
    2: tSmile,
    4: tSurprise, // えっ
    6: tSide, // まくしたてましたね
    8: tFlat, // アベマはそんなこと言わない
    10: tFlat,
    16: tSurprise,
    28: tPoint, // そのミニトマト、いつのですか？
    30: tSide, // 心当たりが、多すぎます
    31: tPoint, // コンロのすき間も
    34: tSmile, // だいじょうぶなはず
    35: tShock, // うわ
    37: tShock, // ほとんど、あーしのです
    38: tPoint, // トマトと一緒にしないで（反応）
    39: tFlat,
    41: tPoint,
    43: tFlat,
    46: tPoint, // 明日もまたトマトを転がしますよね
    48: tSide, // 自信を持たないでください
    51: tSmile,
    52: tSurprise, // あ。だから
    55: tShock, // あーしが拾うんですか
    58: tSmile,
    60: tSide, // それは、知らなくていいです
    63: tSmile, // ネットを付けてみました
    71: tSide, // 何の具合ですか
    74: tSmile,
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
  { line: 4, at: "start", file: "surprise1.mp3" }, // えっ
  { line: 6, at: "start", file: "pico-pico-hammer1.mp3" }, // 朝からまくしたてましたね
  { line: 8, at: "start", file: "pico-pico-hammer1.mp3" }, // アベマはそんなこと言わない
  { line: 15, at: "start", file: "shock2.mp3" }, // ……台所？
  { line: 25, at: "start", file: "surprise1.mp3" }, // ミニトマトが、転がってるのだ
  { line: 27, at: "start", file: "shock2.mp3" }, // ボクがこぼしたやつなのだ
  { line: 32, at: "start", file: "surprise1.mp3" }, // パスタが一本
  { line: 33, at: "start", file: "data-display1.mp3" }, // 見え方の図
  { line: 35, at: "start", file: "shock2.mp3" }, // うわ。髪の毛が
  { line: 48, at: "start", file: "pico-pico-hammer1.mp3" }, // 自信を持たないでください
  { line: 50, at: "start", file: "tin1.mp3" }, // 自分のトマトを見つける日なのだ？
  { line: 52, at: "start", file: "data-display1.mp3" }, // 割り振り表の図
  { line: 61, at: "start", file: "sceneswitch1.mp3" }, // 数日後
  { line: 69, at: "start", file: "shock2.mp3" }, // 来月はお風呂ね
  { line: 71, at: "start", file: "pico-pico-hammer1.mp3" }, // 何の具合ですか
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
const YOU = { file: "you-and-me.mp3", title: "You and Me", composer: "しゃろう", gain: 0.51 };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", ...KYAHHA }, // 掃除の日の朝、ずんだもんがまくしたてる（S2 のタイトルまで）
  { scene: "S3", ...HONWAKA }, // 台所、冷蔵庫の下
  { scene: "S4", ...YOU }, // 洗面所
  { scene: "S5", ...KYAHHA }, // ひと休み、反論
  { scene: "S6", file: "10do.mp3", title: "10℃", composer: "しゃろう", gain: 0.56 }, // 割り振り表の理由
  { scene: "S7", file: "jitaku-nite.mp3", title: "自宅にて", composer: "KK", gain: 1 }, // 数日後とナレーション
  { scene: "outro", file: "morning.mp3", title: "Morning", composer: "しゃろう", gain: 0.46 }, // 最後のあいさつと終了画面（本編と違う曲）
];
