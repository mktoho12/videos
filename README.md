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

キャラの関係・台本の作り・画角・BGM など、動画に共通する決め事は [channel/zundamon-guide.md](channel/zundamon-guide.md) にまとめています。

## 守っていること

- **会話の録音・文字起こしは git に入れない**：各動画の `reference/` に置き、`.gitignore` で除外している
- **個人を特定できる内容は動画にしない**：名前・住まい・地域・仕事・人数・金額・特定の人の話は、誰にでもありそうな場面に置き換える。台本は公開前に確認してもらう
- **素材（立ち絵・背景・BGM・効果音・合成した音声）は git に入れない**：各動画の `public/` に置き、除外している。素材の規約で再配布が禁じられているものがあるため
- 公開しない動画は、フォルダごと `.gitignore` に入れる

そのため、このリポジトリを clone しただけでは、素材がなくて動画を書き出せません。素材の入手先は、次の「必要な外部素材と入手方法」にまとめています。

## 必要な外部素材と入手方法

公開している4本（`tadashii-sharehouse`、`nabe`、`omoikomi`、`amido`）を書き出すのに必要で、このリポジトリに入っていないものの一覧です。素材は、各動画のフォルダの `public/` に、下の名前で置きます。規約はこの節を書いた 2026-10-20 時点のものなので、使う前に配布元で確かめてください。

### 4本に共通するもの

| 素材 | 入手先 | 規約の要点 | 置く場所・ファイル名 |
|---|---|---|---|
| 立ち絵 | 坂本アヒルさんの立ち絵素材（ニコニコ静画）。[ずんだもん V3.2](https://seiga.nicovideo.jp/seiga/im11206626)、[四国めたん 2.1](https://seiga.nicovideo.jp/seiga/im10791276)、[春日部つむぎ 3.0](https://seiga.nicovideo.jp/seiga/im10849150)。ダウンロードは各ページの案内から | 動画に使ってよい。改変可、クレジット任意。つむぎは、収益化は個人の範囲なら可、グッズなど二次創作以外の展開は不可（[春日部つむぎの規約](https://tsumugi-official.studio.site/rule)）。素材の再配布は不可 | PSD を `tadashii-sharehouse/tools/extract_psd.py 入力.psd public/tachie/<zundamon・metan・tsumugi>` でレイヤーごとの PNG（`NNN.png`）と `manifest.json` に分ける。4本とも同じ一式 |
| 声 | [VOICEVOX](https://voicevox.hiroshiba.jp/)（ENGINE 0.25.1 で作成）。ずんだもん（id 3）・四国めたん（id 2）・春日部つむぎ（id 8）、どれもノーマル | 商用・収益化可。動画のどこかに「VOICEVOX:キャラ名」の表記が必要（[ずんだもん・めたんの規約](https://zunko.jp/con_ongen_kiyaku.html)、[つむぎの規約](https://tsumugi-official.studio.site/rule)） | VOICEVOX を `localhost:50021` で起動して `python3 tools/synth_voice.py`。`public/voice/NNN.wav` ができる。話す速さは、`omoikomi`・`amido` が 1.15倍（`SPEED` の既定値）、`tadashii-sharehouse`・`nabe` は VOICEVOX の初期値 |
| 効果音 | [効果音ラボ](https://soundeffect-lab.info/)。ファイル名は効果音ラボでの名前（例: `surprise1.mp3`、`shock2.mp3`、`chan-chan1.mp3`）。使う音は各動画の `src/direction.ts` に書いてある | 商用・収益化可、クレジット任意、加工可。ファイルの再配布は不可（[利用規約](https://soundeffect-lab.info/agreement/)） | `public/se/<名前>.mp3` |
| BGM | [OpenTracks](https://opentracks.jp/)（旧 DOVA-SYNDROME）。曲は下の動画ごとの表 | 商用・収益化可、表記は任意、フェード・ループ・切り出し可（[ライセンス](https://opentracks.com/help/articles/license/)）。曲によっては YouTube の Content ID が付くことがあるので、公開の前に非公開でアップロードして確かめる | `public/bgm/<名前>.mp3` |
| 背景 | [みんちりえ](https://min-chi.material.jp/)。素材ページの URL は記録していないので、素材名で探す | 商用可、加工して作品に使ってよい、クレジット任意。素材としての再配布は不可 | `public/bg/<名前>`（動画ごとの表） |
| フォント | M PLUS Rounded 1c（`@remotion/google-fonts` が読み込む） | SIL Open Font License | 置かなくてよい。書き出すときにネットにつながっている必要がある |
| motion-kit | [mktoho12/motion-kit](https://github.com/mktoho12/motion-kit) | MIT | 4本とも `package.json` で `v0.2.0` のタグに固定しているので、`npm install` で入る |

### 動画ごとのもの

| 動画 | 書き出し | 背景 | BGM（曲名 / 作者） |
|---|---|---|---|
| `tadashii-sharehouse` | `npm run render -- Pudding out/pudding.mp4` | みんちりえ「アイランドキッチン」の夜と夕方 → `bg/kitchen_night.png`、`bg/kitchen_evening.png`（1920x1080 の PNG にしたもの） | 自宅にて / KK → `bgm/jitaku-nite.mp3` |
| `nabe` | `npm run render -- Nabe out/nabe.mp4` | `tadashii-sharehouse` と同じ | 自宅にて / KK |
| `omoikomi` | `npm run render -- Omoikomi out/omoikomi.mp4`（サムネイルは `npx remotion still src/index.ts Thumb out/thumb.png`） | みんちりえ「リビング」の照明あり → `bg/living_night_on.jpg`、「アパートの浴室」の昼・湯気なし → `bg/bathroom_day.jpg`。洗濯機置き場の3枚 `bg/laundry_{before,removed,new}.png` は下の「再現できないもの」を参照 | 追いかけっこキャッハー / 今川彰人オーケストラ、ほんわかぷっぷー / もっぴーさうんど、You and Me / しゃろう、10℃ / しゃろう、わくわくクッキングタイム的なBGM / 鷹尾まさき、Morning / しゃろう（ファイル名・使う場面・音量は `src/direction.ts`） |
| `amido` | `npm run render -- Amido out/amido.mp4` | `omoikomi` と同じリビング。最後に出す本編のサムネイルは、`omoikomi` で書き出した `out/thumb.png` を `public/thumb-main.png` に置く | 追いかけっこキャッハー、ほんわかぷっぷー（`omoikomi` と同じファイル） |

### 再現できないもの

- **元になった会話**：どの動画も、住人の会話から気づきを取り出して作っています。会話の録音と文字起こしは公開しません。台本（`script.md`）は確定したものが入っているので、声と映像はそこから作れます
- **台本を AI に書かせたときの揺れ**：台本と演出は Claude Code（Claude Opus 5.5）が書き、人が直して確定しました。同じ指示をしても、毎回同じ台本にはなりません
- **`omoikomi` の洗濯機置き場の背景3枚**：住人が撮った写真をもとに、ChatGPT で絵に寄せたものです。使ったモデル名とプロンプトの全文は記録していません。頼み方の要点は `omoikomi/notes.md` にあります。元の写真は公開しません
- **素材ページの URL**：みんちりえの各背景と、OpenTracks の曲ページ（You and Me の 13787 以外）は、URL を記録していません。素材名・曲名で探してください

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
