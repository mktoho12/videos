import { loadDefaultJapaneseParser } from "budoux";
import React from "react";
import { fontFamily } from "./font";
import { Character } from "./Tachie";
import { Style } from "./style";

/** 字幕: 話者の側の範囲（画面幅の regionRatio）に収め、その中で中央に寄せる。長ければ文節の切れ目で折り返す。
 * side が center のときは、画面の中央に同じ幅の範囲を取る（3人並びの真ん中の話者） */
export const Caption: React.FC<{
  style: Style;
  speaker: Character;
  side: "left" | "right" | "center";
  text: string;
  opacity?: number;
}> = ({ style, speaker, side, text, opacity = 1 }) => {
  const { caption, colors } = style;
  return (
    <div
      style={{
        position: "absolute",
        bottom: caption.bottom,
        ...(side === "center" ? { left: `${(1 - caption.regionRatio) * 50}%` } : { [side]: caption.margin }),
        width: `${caption.regionRatio * 100}%`,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        lang="ja"
        style={{
          background: colors.captionFill,
          color: colors.captionText,
          border: `${caption.border}px solid ${colors[speaker]}`,
          borderRadius: caption.radius,
          padding: `${caption.paddingY}px ${caption.paddingX}px`,
          fontFamily,
          fontWeight: 800,
          fontSize: caption.fontSize,
          lineHeight: 1.25,
          textAlign: "center",
          boxShadow: "0 6px 0 rgba(0,0,0,0.18)",
          // 文節の切れ目で折り返し、行の長さをそろえる（「騒いでるん／ですか」のような切れ方を避ける）
          ...({ wordBreak: "auto-phrase", textWrap: "balance" } as React.CSSProperties),
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 長い台詞を、字幕1枚あたり maxChars 文字までに分ける（1枚は2行まで）。
 * まず文の終わり（。！？）で分けて詰め、1文がまだ長ければ、真ん中に近い「、」で分ける（「、」は前の枚に残す）。
 * - 1文が上限を2文字だけ超えるくらいなら分けない（「てっきり、」のような短すぎる1枚を作らない）。分けたあとの片方が6文字より短くなる「、」でも分けない
 * - 文の途中で分けた枚（「、」で終わる枚）には、続きをつなげない
 * 声は1本のまま、各枚の文字数の割合で切り替える（timeline 側） */
export const captionPages = (text: string, maxChars: number): string[] => {
  if (text.length <= maxChars) return [text];
  // 文の終わりで区切る。かぎかっこの中の「！」などでは区切らない
  const sentences: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    current += ch;
    if (ch === "「") depth++;
    if (ch === "」") depth = Math.max(0, depth - 1);
    const next = text[i + 1] ?? "";
    if (depth === 0 && /[。！？!?]/.test(ch) && !/[。！？!?」]/.test(next)) {
      sentences.push(current);
      current = "";
    }
  }
  if (current) sentences.push(current);
  const splitLong = (s: string): string[] => {
    if (s.length <= maxChars + 2) return [s];
    const commas = [...s.matchAll(/、/g)].map((m) => (m.index ?? 0) + 1).filter((i) => i >= 6 && s.length - i >= 6);
    if (commas.length === 0) return [s];
    const cut = commas.reduce((a, b) => (Math.abs(b - s.length / 2) < Math.abs(a - s.length / 2) ? b : a));
    return [...splitLong(s.slice(0, cut)), ...splitLong(s.slice(cut))];
  };
  const pages: string[] = [];
  for (const part of sentences.flatMap(splitLong)) {
    const last = pages.length - 1;
    const endsSentence = (t: string) => /[。！？!?」…]$/.test(t);
    if (last >= 0 && endsSentence(pages[last]) && pages[last].length + part.length <= maxChars) pages[last] += part;
    else pages.push(part);
  }
  return pages;
};

const phraseParser = loadDefaultJapaneseParser();

/** 台詞を、1行の吹き出しに入る長さ（maxLineChars 文字まで）に分ける（積み上げ表示で使う）。
 * 文節（BudouX）の切れ目でだけ切る。「、」で終わった所は、その文の残りが同じ行に入りきらないなら、そこで改める
 * （「使ってなかったのに、リビングをまる／ごと」のような切れ方を避ける）。文の終わり（。！？）では必ず改める */
export const captionLines = (text: string, maxLineChars: number): string[] => {
  const phrases = phraseParser.parse(text);
  const lines: string[] = [];
  let current = "";
  phrases.forEach((phrase, i) => {
    if (current && current.length + phrase.length > maxLineChars) {
      lines.push(current);
      current = "";
    }
    current += phrase;
    const rest = phrases.slice(i + 1).join("");
    const untilPause = rest.match(/^[^、。！？!?]*[、。！？!?」…]*/)?.[0] ?? rest;
    const sentenceEnd = /[。！？!?]$/.test(current) && !/^[」]/.test(rest);
    const pause = /[、]$/.test(current) && current.length >= 6 && current.length + untilPause.length > maxLineChars;
    if (rest && (sentenceEnd || pause)) {
      lines.push(current);
      current = "";
    }
  });
  if (current) lines.push(current);
  return lines;
};

/** 吹き出しを積み上げる字幕。話す時間に合わせて1行ずつ増やす（visible 本まで出す）。
 * 1回に積むのは style.caption.stackMax 本まで。それを超えたら、いちばん古い吹き出しを押し出す（前の行とのつながりを残す） */
export const StackCaption: React.FC<{
  style: Style;
  speaker: Character;
  side: "left" | "right" | "center";
  lines: string[];
  visible: number;
  /** 差し込み場面（積む本数を stackMaxInsert に減らす） */
  insert?: boolean;
  opacity?: number;
  /** いちばん新しい吹き出しの入り（t: 0〜1、下から distance px） */
  newest?: { t: number; distance: number };
}> = ({ style, speaker, side, lines, visible, insert = false, opacity = 1, newest }) => {
  const { caption, colors } = style;
  const max = insert ? caption.stackMaxInsert : caption.stackMax;
  const shown = Math.max(1, Math.min(visible, lines.length));
  const groupStart = Math.max(0, shown - max);
  const group = lines.slice(groupStart, shown);
  return (
    <div
      style={{
        position: "absolute",
        bottom: caption.bottom,
        ...(side === "center" ? { left: `${(1 - caption.regionRatio) * 50}%` } : { [side]: caption.margin }),
        width: `${caption.regionRatio * 100}%`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
      }}
    >
      {group.map((line, i) => (
        <div
          key={groupStart + i}
          lang="ja"
          style={{
            marginTop: i === 0 ? 0 : -caption.border * 2,
            transform: `translate(${caption.stackShift[(groupStart + i) % caption.stackShift.length]}px, ${
              newest && i === group.length - 1 ? (1 - newest.t) * newest.distance : 0
            }px)`,
            opacity: newest && i === group.length - 1 ? newest.t : 1,
            background: colors.captionFill,
            color: colors.captionText,
            border: `${caption.border}px solid ${colors[speaker]}`,
            borderRadius: caption.radius,
            padding: `${caption.paddingY * 0.7}px ${caption.paddingX}px`,
            fontFamily,
            fontWeight: 800,
            fontSize: caption.fontSize,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            boxShadow: "0 6px 0 rgba(0,0,0,0.18)",
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

/** 積み上げる吹き出しを足す時刻（台詞の長さに対する割合、0〜1）。声は1本なので、各行の読む長さの割合で決める。
 * 読む長さは文字数で見積もる：漢字は読みが長いので 1.8、句読点や「…」は間なので 0.5、ほかは 1 */
export const stackStarts = (lines: string[]): number[] => {
  const weight = (t: string) =>
    [...t].reduce((sum, ch) => sum + (/[一-鿿々]/.test(ch) ? 1.8 : /[、。！？!?…「」]/.test(ch) ? 0.5 : 1), 0);
  const weights = lines.map(weight);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return weights.map((w) => {
    const start = acc / total;
    acc += w;
    return start;
  });
};
