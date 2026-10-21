/**
 * 演出表（段階4）。台詞の通し番号（src/lines.json の順、1 始まり）ごとに、表情・効果音・テロップを決める。
 * omoikomi の direction.ts を複製し、この動画の台詞に合わせて書き直した（元はプリン裁判）。
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
const zAngry: Change = { pick: { 眉: "怒り眉", 目: "><", ...zArms, 枝豆: "枝豆立ち" }, mouthOpen: "うわー", mouthClosed: "むくー" };
const zShocked: Change = { pick: { 眉: "困り眉", 目: "〇〇" }, toggles: { 汗: true }, mouthClosed: "Δ" };
const zHappy: Change = { pick: { 目: "にっこり", 右腕: "指差し上" }, mouthOpen: "あは", mouthClosed: "えへ" };
const zThink: Change = { pick: { 眉: "上がり眉", 目: "基本目→", 左腕: "あごに指" }, mouthClosed: "ん" };
const tPoint: Change = { pick: { まゆ: "おこ眉", 右腕: "ゆびさし" }, mouthOpen: "おあー", mouthClosed: "むん" };
const tFlat: Change = { pick: { まゆ: "困り眉" }, mouthClosed: "む" };
const tSmile: Change = { pick: { まゆ: "ごきげん眉", 目: "にっこり" }, mouthClosed: "にしー" };
const mExplain: Change = { pick: { 右腕: "指差す" } };
const mKind: Change = { pick: { 眉: "ごきげん", 右腕: "手をかざす" } };
const mTired: Change = { pick: { 眉: "太眉こまり", 黒目: "目そらし" }, mouthClosed: "む" };

/** 台詞の番号 → 表情の変更（base からの差分）。話していない人の反応も、その台詞の番号で書く */
const LINE_CHANGES: Record<Speaker, Record<number, Change>> = {
  zundamon: {
    1: { pick: { 目: "基本目←" } }, // 靴、出しっぱなしですよ（言われる）
    2: { pick: { 目: "基本目→" } }, // 今しまおうと思ってた
    4: { pick: { 眉: "上がり眉", 目: "細め目", ...zFold }, mouthOpen: "ほあ" }, // 別のボクなのだ
    6: zAngry, // 最近、みんな厳しいのだ！
    7: { pick: { 眉: "怒り眉", 目: "ジト目", 右腕: "指差し横" }, mouthClosed: "むくー" },
    9: { pick: { 眉: "困り眉", 目: "〇〇", 右腕: "手を挙げる" }, toggles: { 汗: true } }, // めたん、聞いてほしいのだ
    11: { pick: { 眉: "怒り眉", 右腕: "指差し横" }, mouthClosed: "むくー" }, // つむぎが厳しくなった
    13: { pick: { 眉: "困り眉", 目: "UU", 枝豆: "枝豆萎え", 顔色: "青ざめ" }, toggles: { 汗: true, かげり: true }, mouthClosed: "うへえ" }, // いらない子
    16: { pick: { 目: "なごみ目", 右腕: "指差し上" } }, // 靴の山から掘り出す
    18: { pick: { 目: "^^" }, mouthOpen: "あは", mouthClosed: "えへ" }, // サンダルで出かけた
    20: { pick: { 眉: "困り眉", 目: "基本目←" }, mouthClosed: "Δ" }, // 言ってなかった
    23: { pick: { 眉: "上がり眉", 目: "〇〇" }, mouthClosed: "お" }, // （めたん）家がきれいになったのよ
    24: { pick: { 眉: "上がり眉", 目: "〇〇" }, mouthClosed: "お" },
    25: { pick: { 眉: "困り眉", 目: "ジト目", ...zFold }, mouthClosed: "むくー" }, // 窮屈なのだ
    32: { pick: { 目: "にっこり", 右腕: "指差し横" }, mouthOpen: "あは", mouthClosed: "えへ" }, // つむぎがしまってくれる？
    34: { pick: { 眉: "困り眉" }, mouthClosed: "むくー" }, // （めたん）まず自分のぶんから
    37: zThink, // ソースが1本だけ
    38: { pick: { 眉: "困り眉", 目: "ジト目→", 左腕: "あごに指" } },
    42: { pick: { 眉: "上がり眉", 目: "細め目", 右腕: "指差し上" }, mouthOpen: "あは" }, // 毒の沼
    46: { pick: { 目: "細め目ハート", 顔色: "ほっぺ赤め", ...zArms }, mouthOpen: "あは", mouthClosed: "えへ" }, // ずんだ餅づくり
    48: { pick: { 眉: "上がり眉", 目: "^^", 右腕: "指差し上", 枝豆: "枝豆立ち" }, mouthOpen: "あは" }, // MP が回復する
    52: { pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し横" }, mouthOpen: "あは", mouthClosed: "にやり" }, // つむぎも、やらかしてる
    54: { pick: { 眉: "困り眉", 目: "基本目↑" }, toggles: { 汗: true } }, // ついていけない
    55: { pick: { 眉: "困り眉", 目: "〇〇", ...zArms }, toggles: { 汗: true }, mouthOpen: "うわー" }, // 裁判になる
    58: { pick: { 眉: "上がり眉", 目: "〇〇" }, mouthClosed: "お" }, // また散らかる？
    60: { pick: { 眉: "困り眉", 左腕: "あごに指" }, mouthClosed: "んー" }, // どっちも困る
    63: zHappy, // 鍋のときの話
    65: { pick: { 目: "細め目", ...zFold }, mouthClosed: "にやり" }, // 0.9倍の日
    67: zShocked, // 計算が合ってる
    68: { pick: { 目: "なごみ目", 顔色: "ほっぺ赤め" }, mouthOpen: "あは", mouthClosed: "えへ" }, // 気分がいい
    69: { pick: { 眉: "上がり眉", 目: "基本目↑" }, mouthClosed: "ん" }, // ……ん？
    70: { pick: { 眉: "怒り眉", 目: "><", 右腕: "指差し横", 枝豆: "枝豆立ち" }, mouthOpen: "うわー", mouthClosed: "むくー" }, // だれなのだ！
    72: { pick: { 眉: "怒り眉", 目: "ジト目", 左腕: "あごに指" } }, // 犯人を探す
    73: zShocked, // （つむぎ）ずんだ餅のがら
    74: { pick: { 眉: "困り眉", 目: "UU", 枝豆: "枝豆萎え" }, toggles: { 汗: true }, mouthClosed: "うへえ" }, // ボクのなのだ
    76: { pick: { 目: "^^", 左腕: "あごに指" }, mouthOpen: "あは", mouthClosed: "えへ" }, // 靴下の上で寝てた
    79: { pick: { 眉: "困り眉", 目: "〇〇" }, mouthClosed: "お" }, // ボクも、厳しくなってた
    82: { ...zHappy, pick: { 眉: "上がり眉", 目: "にっこり", 右腕: "指差し上", 枝豆: "枝豆立ち" } }, // やっといたのだ！
    83: zShocked, // （つむぎ）先輩の靴です
    84: { pick: { 目: "にっこり", 右腕: "手を挙げる" }, mouthOpen: "あは", mouthClosed: "えへ" }, // あいさつ
  },
  metan: {
    8: { pick: { 眉: "ごきげん" } }, // あら、なにを騒いでいるの？
    10: { pick: { 眉: "こまり" }, mouthClosed: "む" }, // ルールは変わってない
    13: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" }, // （ずんだもん）いらない子
    15: mExplain, // 前の玄関を覚えてる？
    19: { pick: { 右腕: "手をかざす" } },
    21: { pick: { 眉: "こまり" } },
    22: mExplain,
    23: mKind, // 家が、きれいになったのよ
    27: { pick: { 眉: "太眉こまり" } }, // 気にしてたのね
    28: mExplain,
    29: mKind, // やっといたわ
    31: { pick: { 眉: "ややおこ" }, mouthClosed: "む" }, // 窮屈になる
    34: { pick: { 眉: "太眉おこ", 右腕: "指差す" }, mouthClosed: "にやり" }, // まず自分のぶんから
    36: { pick: { 眉: "ごきげん" } },
    40: mExplain,
    41: { pick: { 眉: "太眉こまり" } },
    44: mExplain,
    45: mKind,
    46: mTired, // （ずんだもん）ずんだ餅づくり
    50: mTired, // はいはい
    53: mKind, // そういうときこそ
    55: mTired, // （ずんだもん）裁判になる
    57: mExplain, // 波がある
    59: { pick: { 黒目: "目そらし" } },
    61: mExplain,
    62: { pick: { 眉: "ごきげん", 右腕: "指差す" } }, // 1.1倍
    66: { pick: { 眉: "太眉ごきげん" }, mouthClosed: "にやり" }, // 明日は1.3倍ね
    70: { pick: { 眉: "太眉こまり" }, mouthClosed: "む" }, // （ずんだもん）だれなのだ！
    74: { pick: { 眉: "ごきげん" }, mouthClosed: "にやり" }, // （ずんだもん）ボクのなのだ
    75: { pick: { 眉: "ごきげん", 右腕: "指差す" }, mouthClosed: "にやり" }, // ほらね
    78: mKind, // 当たり前も、上がってた
    80: mKind,
  },
  tsumugi: {
    1: tPoint, // 靴、しまってください
    3: { pick: { まゆ: "おこ眉" }, mouthClosed: "む" },
    5: tPoint,
    6: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // （ずんだもん）最近みんな厳しい
    12: tFlat, // あーしは、前からこう
    13: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // （ずんだもん）いらない子
    14: tPoint, // 非行少年
    17: tSmile, // 宝探し
    26: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // 気まずかった
    30: tSmile,
    33: { pick: { まゆ: "おこ眉" }, mouthClosed: "む" }, // 自分でしまって
    35: { pick: { まゆ: "ごきげん眉", 目: "にっこり", 右腕: "ピース" }, mouthOpen: "わあーい", mouthClosed: "にしー" }, // 片付けておきました
    43: { pick: { 目: "〇〇" }, mouthClosed: "お" }, // 急にわかりやすい
    47: tFlat, // 魔法じゃないんですか
    49: tPoint,
    51: { pick: { まゆ: "困り眉", 目: "><", 右腕: "口元" }, mouthClosed: "む" }, // あーしのです
    52: tFlat,
    56: { pick: { まゆ: "困り眉", 黒目: "目逸らし" }, mouthClosed: "む" }, // プリンの次は
    64: { pick: { まゆ: "ごきげん眉" } },
    71: { pick: { 目: "〇〇" } }, // どうしたんですか
    73: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthClosed: "む" }, // ずんだ餅のがら
    77: tPoint, // 気づいてください
    81: { pick: { まゆ: "ごきげん眉" } },
    83: { pick: { まゆ: "困り眉", 右腕: "ゆびさし" }, mouthClosed: "む" }, // 先輩の靴です
    84: tSmile,
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

/** めたん（管理人）が見回りに来る台詞（S3「あら、玄関でなにを騒いでいるの？」）。それまでは2人 */
export const METAN_ENTERS_AT_LINE = 8;

/** 立ち位置の向き。玄関・台所では、左のずんだもんが右の2人の方を向く。ずんだもんの部屋は styleframe の S7 と同じ */
export const FLIP: Record<"trio" | "room", Record<Speaker, boolean>> = {
  trio: { zundamon: true, metan: false, tsumugi: false },
  room: { zundamon: true, metan: false, tsumugi: false },
};

/** 画面の上に出すテロップ（場所や時間が飛んだことを示す）。台詞の頭から出す */
export const TELOPS: { line: number; text: string }[] = [
  { line: 35, text: "数日後" },
  { line: 68, text: "次の週" },
];

/** 効果音（public/se、効果音ラボ）。台詞の頭（start）か終わり（end）で鳴らす */
export type SeCue = { line: number; at: "start" | "end"; file: string };
export const SE_CUES: SeCue[] = [
  { line: 6, at: "start", file: "surprise1.mp3" }, // 最近、みんな厳しいのだ！（寄り）
  { line: 13, at: "start", file: "shock2.mp3" }, // いらない子
  { line: 14, at: "start", file: "pico-pico-hammer1.mp3" }, // 非行少年
  { line: 15, at: "start", file: "data-display1.mp3" }, // 前の玄関の図
  { line: 22, at: "start", file: "data-display1.mp3" }, // 今の玄関が出る
  { line: 35, at: "start", file: "sceneswitch1.mp3" }, // 数日後、台所
  { line: 37, at: "start", file: "data-display1.mp3" }, // 冷蔵庫の棚
  { line: 41, at: "start", file: "data-display1.mp3" }, // 気力のゲージ
  { line: 42, at: "start", file: "nyu3.mp3" }, // 毒の沼
  { line: 51, at: "start", file: "shock2.mp3" }, // あーしのです
  { line: 55, at: "start", file: "shock2.mp3" }, // 裁判になる
  { line: 56, at: "start", file: "pico-pico-hammer1.mp3" }, // プリンの次は
  { line: 57, at: "start", file: "data-display1.mp3" }, // 波の線
  { line: 67, at: "start", file: "tin1.mp3" }, // 計算が合ってる
  { line: 68, at: "start", file: "sceneswitch1.mp3" }, // 次の週、ずんだもんの部屋
  { line: 69, at: "start", file: "surprise1.mp3" }, // ……ん？（靴下）
  { line: 74, at: "start", file: "tin1.mp3" }, // ボクのなのだ
  { line: 83, at: "start", file: "pico-pico-hammer1.mp3" }, // 先輩の靴です
];

/**
 * BGM（public/bgm）。そのシーンの頭から次の曲のシーンまで流し、切り替わりは audio.bgmCrossSec で重ねる。
 * シーンが変わったら曲も変える。最後のあいさつは本編と違う曲にする（channel/zundamon-guide.md）。
 * scene が "outro" の曲は、本編おわりの合図（ちゃんちゃん♪）が鳴り終わってから始める。その前の曲は合図の前に消し切る
 */
export type BgmCue = { scene: string; file: string; title: string; composer: string; gain: number };
// 曲は OpenTracks（旧 DOVA-SYNDROME）。gain は曲ごとの音の大きさをそろえる倍率で、「自宅にて」（RMS -20.4dB）に合わせた（omoikomi で測った値）
// （90秒の RMS: キャッハー -12.8 / ほんわかぷっぷー -20.5 / You and Me -14.5 / 10℃ -15.3 / Morning -13.7 dB）
const KYAHHA = { file: "oikakekko-kyahha.mp3", title: "追いかけっこキャッハー", composer: "今川彰人オーケストラ", gain: 0.42 };
const HONWAKA = { file: "honwaka-puppu.mp3", title: "ほんわかぷっぷー", composer: "もっぴーさうんど", gain: 1 };
export const BGM_CUES: BgmCue[] = [
  { scene: "S1", ...KYAHHA }, // 玄関で「最近みんな厳しいのだ！」（S2 のタイトルまで）
  { scene: "S3", ...HONWAKA }, // 玄関の今と昔
  { scene: "S4", file: "you-and-me.mp3", title: "You and Me", composer: "しゃろう", gain: 0.51 }, // 言われるほうは窮屈、つむぎの気まずさ
  // わくわくクッキングタイム的なBGM（鷹尾まさき）は、非公開のアップロードで Content ID の申し立て（メロディー）が付いたので替えた（2026-10-21）
  { scene: "S5", ...HONWAKA }, // 台所、冷蔵庫と MP
  { scene: "S6", file: "10do.mp3", title: "10℃", composer: "しゃろう", gain: 0.56 }, // ついていけない、波がある
  { scene: "S7", ...KYAHHA }, // ずんだもんの部屋、靴下の犯人探し
  { scene: "S8", file: "jitaku-nite.mp3", title: "自宅にて", composer: "KK", gain: 1 }, // 着地
  { scene: "outro", file: "morning.mp3", title: "Morning", composer: "しゃろう", gain: 0.46 }, // 最後のあいさつと終了画面（本編と違う曲）
];
