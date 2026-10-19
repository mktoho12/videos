# videos

ずんだもんたちの掛け合い動画など、短い動画を1本ずつ作るためのリポジトリです。
動画は [Remotion](https://www.remotion.dev/)（React で動画を作る道具）で組み立て、作り方の手順・動きの決まり・共通の部品は [motion-kit](https://github.com/mktoho12/motion-kit) に従います。
作業の多くは AI（Claude Code）が進め、人は各段階の終わりで確認して「次へ」を決めます。

## 何が入っているか

| フォルダ | 中身 |
|---|---|
| `mugicha/` | 1本目「麦茶」（モーショングラフィックス） |
| `tadashii-sharehouse/` | 「プリン裁判は2人では終わらない」（ずんだもん・春日部つむぎ・四国めたんの掛け合い、約4分） |

動画ごとのフォルダには、次のファイルがあります。

| ファイル | 中身 |
|---|---|
| `brief.md` | 段階0。何を伝える動画か（メッセージ・尺・音・参考動画など） |
| `structure.md` | 段階1。シーンの構成案と、選んだ案 |
| `script.md` | 台本（掛け合い動画のとき） |
| `styleframe.md` | 段階2。見た目と動きの決まり |
| `notes.md` | 判断の記録と、motion-kit への改善の提案 |
| `src/` | 動画の中身（Remotion のコード） |
| `tools/` | 文字起こし・音声合成・立ち絵の分解などのスクリプト |

## 掛け合い動画の作り方

1. **雑談を録る**：素材にしてよいと2人で合意してから録音する
2. **文字起こし**：`tools/transcribe.sh` で、話者付きの文字起こしを作る（ElevenLabs Scribe）
3. **ネタ選び**：AI が会話の中からネタの候補を出し、人が1つ選ぶ
4. **段階0 ブリーフ**：メッセージ・尺・音などを決める
5. **段階1 構成と台本**：シーンの構成案から1つ選び、台本を書く。VOICEVOX で合成して読み間違いを直し、試聴して確定する
6. **段階2 スタイルフレーム**：代表的な場面の静止画を見て、見た目を決める
7. **段階3 アニマティック**：四角と台詞の音声だけの動画で、タイミングを確かめる
8. **段階4 本実装**：立ち絵・字幕・図を入れた動画を確かめる
9. **段階5 詰め**：Studio で細かい値を調整する
10. **段階6 音と書き出し**：BGM・効果音を入れて、完成版を書き出す

各段階の終わりで AI は止まり、人が「次へ」と言うまで先に進みません。

## 守っていること

- **会話の録音・文字起こしは git に入れない**：各動画の `reference/` に置き、`.gitignore` で除外している
- **個人を特定できる内容は動画にしない**：名前・住まい・地域・仕事・人数・金額・特定の人の話は、誰にでもありそうな場面に置き換える。台本は公開前に確認してもらう
- **素材（立ち絵・背景・BGM・効果音・合成した音声）は git に入れない**：各動画の `public/` に置き、除外している。素材の規約で再配布が禁じられているものがあるため
- 公開しない動画は、フォルダごと `.gitignore` に入れる

そのため、このリポジトリを clone しただけでは、素材がなくて動画を書き出せません。素材の入手先は各動画の `notes.md` に書いてあります。

## 動かすには

必要なもの: Node.js（24 で動作確認）、[VOICEVOX](https://voicevox.hiroshiba.jp/)（音声合成。`localhost:50021` で起動しておく）、[uv](https://docs.astral.sh/uv/)（Python のスクリプトを動かす）、ElevenLabs の API キー（文字起こしをするとき。`~/.config/elevenlabs/api_key` に置く）

コマンドは動画のフォルダの中で実行します（例: `cd tadashii-sharehouse`）。

```sh
npm install                # 初回だけ
npm run studio             # Studio を開いて、ブラウザで見ながら調整する
npm run render -- Pudding out/pudding.mp4   # 書き出す
npm run typecheck          # 型チェック
python3 tools/synth_voice.py                 # script.md の台詞を VOICEVOX で合成する
tools/transcribe.sh 録音.m4a reference/stt_result.json   # 話者付きで文字起こしする
```

## クレジット（tadashii-sharehouse）

- 音声: VOICEVOX:ずんだもん、VOICEVOX:四国めたん、VOICEVOX:春日部つむぎ
- 立ち絵: 坂本アヒル
- 背景: みんちりえ
- BGM: 自宅にて / KK（OpenTracks）
- 効果音: 効果音ラボ
