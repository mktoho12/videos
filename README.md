# videos

ずんだもんたちの掛け合い動画など、短い動画を1本ずつ作るためのリポジトリです。
動画は [Remotion](https://www.remotion.dev/)（React で動画を作る道具）で組み立て、作り方の手順・動きの決まり・共通の部品は [motion-kit](https://github.com/mktoho12/motion-kit) に従います。
作業の多くは AI（Claude Code）が進め、人は各段階の終わりで確認して「次へ」を決めます。

## 何が入っているか

| フォルダ | 中身 |
|---|---|
| `mugicha/` | 1本目「麦茶」（モーショングラフィックス） |
| `tadashii-sharehouse/` | 「プリン裁判は2人では終わらない」（ずんだもん・春日部つむぎ・四国めたんの掛け合い、横長、約4分） |
| `nabe/` | ショート「みんな自分の分は完璧なのに、鍋だけ残る」（縦長、約49秒） |
| `omoikomi/` | 「「難しそう」は、だいたい思い込みなのだ」（横長、約7分。めたんが管理人になった最初の動画） |
| `amido/` | ショート「網戸に穴があいたら、業者を呼ぶのだ！」（縦長、約50秒。`omoikomi` と組） |
| `atarimae/` | 「最近みんな厳しいのは、家がきれいになったからなのだ」（横長、約6分。`omoikomi` を複製して作った3本目） |
| `yattoita/` | ショート「注意するより、黙ってやっといたほうが早かったのだ」（縦長、約48秒。`atarimae` と組） |
| `hitorigoto/` | 「イヤホンの向こうは、まわりに聞こえないのだ」（横長、約6分39秒。`atarimae` を複製して作った4本目） |
| `hanauta/` | ショート「聞こえるのは、自分の声だけ」（縦長、約34秒。`hitorigoto` と組） |
| `channel/` | チャンネルの決め事（[zundamon-guide.md](channel/zundamon-guide.md)）、YouTube の運営方針（[youtube-guide.md](channel/youtube-guide.md)）、BGM の申し立ての記録（[bgm-checks.md](channel/bgm-checks.md)）、アイコン・バナー |

動画ごとのフォルダには、次のファイルがあります。

| ファイル | 中身 |
|---|---|
| `brief.md` | 段階0。何を伝える動画か（メッセージ・音・参考動画など） |
| `structure.md` | 段階1。シーンの構成案と、選んだ案 |
| `script.md` | 台本（掛け合い動画のとき） |
| `styleframe.md` | 段階2。見た目と動きの決まり |
| `notes.md` | 判断の記録と、motion-kit への改善の提案 |
| `src/` | 動画の中身（Remotion のコード） |
| `tools/` | 文字起こし・音声合成・立ち絵の分解などのスクリプト |

`WORKLOG.md` は作者の手元の作業記録です。作者の環境（作業用の機械、ブランチの運用など）の話が含まれていて、clone した人には関係しないところがあります。

## 掛け合い動画の作り方

1. **雑談を録る**：素材にしてよいと2人で合意してから録音する
2. **文字起こし**：`tadashii-sharehouse/tools/transcribe.sh` で、話者付きの文字起こしを作る（ElevenLabs Scribe。話者は2人で固定）
3. **ネタ選び**：AI が会話の中からネタの候補を出し、人が1つ選ぶ
4. **段階0 ブリーフ**：伝えたいこと・音・参考動画などを決める。長さは決めない
5. **段階1 構成と台本**：シーンの構成案から1つ選び、台本を書く。VOICEVOX で合成して読み間違いを直し、試聴して確定する
6. **段階2 スタイルフレーム**：代表的な場面の静止画を見て、見た目を決める
7. **段階3 アニマティック**：四角と台詞の音声だけの動画で、タイミングを確かめる
8. **段階4 本実装**：立ち絵・字幕・図を入れた動画を確かめる
9. **段階5 詰め**：Studio で細かい値を調整する
10. **段階6 音と書き出し**：BGM・効果音を入れて、完成版を書き出す

各段階の終わりで AI は止まり、人が「次へ」と言うまで先に進みません。

キャラの関係・台本の作り・画角・BGM など、動画に共通する決め事と、新しい動画の始め方は [channel/zundamon-guide.md](channel/zundamon-guide.md) にまとめています。motion-kit の工程の文書と食い違うところは、zundamon-guide.md を優先します。

## 守っていること

- **会話の録音・文字起こしは git に入れない**：各動画の `reference/` に置き、`.gitignore` で除外している
- **個人を特定できる内容は動画にしない**：名前・住まい・地域・仕事・人数・金額・特定の人の話は、誰にでもありそうな場面に置き換える。台本は公開前に確認してもらう
- **素材（立ち絵・背景・BGM・効果音・合成した音声）は git に入れない**：各動画の `public/` に置き、除外している。素材の規約で再配布が禁じられているものがあるため
- 公開しない動画は、フォルダごと git の対象から外す

そのため、このリポジトリを clone しただけでは、素材がなくて動画を書き出せません。素材の入手先は、次の「必要な外部素材と入手方法」にまとめています。

## 必要な外部素材と入手方法

掛け合いの8本（`tadashii-sharehouse`、`nabe`、`omoikomi`、`amido`、`atarimae`、`yattoita`、`hitorigoto`、`hanauta`）を書き出すのに必要で、このリポジトリに入っていないものの一覧です。素材は、各動画のフォルダの `public/` に、下の名前で置きます。規約はこの節を書いた 2026-10-20 時点のものなので、使う前に配布元で確かめてください。

### 8本に共通するもの

| 素材 | 入手先 | 規約の要点 | 置く場所・ファイル名 |
|---|---|---|---|
| 立ち絵 | 坂本アヒルさんの立ち絵素材（ニコニコ静画）。[ずんだもん V3.2](https://seiga.nicovideo.jp/seiga/im11206626)、[四国めたん 2.1](https://seiga.nicovideo.jp/seiga/im10791276)、[春日部つむぎ 3.0](https://seiga.nicovideo.jp/seiga/im10849150)。ダウンロードは各ページに書いてあるアップローダーから（パスワードもページに書いてある）。使う PSD は `ずんだもん立ち絵素材V3.2_基本版.psd`（上向き版・全部詰め版ではない）、`四国めたん立ち絵素材2.1.psd`、`春日部つむぎ立ち絵素材3.0.psd` | 動画に使ってよい。改変可、クレジット任意。つむぎは、収益化は個人の範囲なら可、グッズなど二次創作以外の展開は不可（[春日部つむぎの規約](https://tsumugi-official.studio.site/rule)）。素材の再配布は不可 | 下の「立ち絵の分け方」で `public/tachie/<zundamon・metan・tsumugi>/` に、レイヤーごとの PNG（`NNN.png`）と `manifest.json` を作る。4本とも同じ一式 |
| 声 | [VOICEVOX](https://voicevox.hiroshiba.jp/)（ENGINE 0.25.1 で作成）。ずんだもん（id 3）・四国めたん（id 2）・春日部つむぎ（id 8）、どれもノーマル | 商用・収益化可。動画のどこかに「VOICEVOX:キャラ名」の表記が必要（[ずんだもん・めたんの規約](https://zunko.jp/con_ongen_kiyaku.html)、[つむぎの規約](https://tsumugi-official.studio.site/rule)） | VOICEVOX を `localhost:50021` で起動して `python3 -I tools/synth_voice.py`。`public/voice/NNN.wav` ができ、git で管理している `src/lines.json`（台詞ごとの長さと口パク）も書き直す。ENGINE の版が違うと長さが変わることがあるので、同じ版を使う。話す速さは、`omoikomi`・`amido` が 1.15倍（`SPEED` の既定値）、`tadashii-sharehouse`・`nabe` は VOICEVOX の初期値 |
| 効果音 | [効果音ラボ](https://soundeffect-lab.info/)。サイトでの名前は下の表 | 商用・収益化可、クレジット任意、加工可。ファイルの再配布は不可（[利用規約](https://soundeffect-lab.info/agreement/)） | `public/se/<ファイル名>.mp3` |
| BGM | [OpenTracks](https://opentracks.com/)（旧 DOVA-SYNDROME）。曲は下の動画ごとの表 | 商用・収益化可、表記は任意、フェード・ループ・切り出し可（[ライセンス](https://opentracks.com/help/articles/license/)）。曲によっては YouTube の Content ID が付くことがあるので、公開の前に非公開でアップロードして確かめる | `public/bgm/<ファイル名>.mp3`。ファイル名は自分で付け替える（動画ごとの表） |
| 背景 | [みんちりえ](https://min-chi.material.jp/)。サイト内の検索で、素材名から探す | 商用可、加工して作品に使ってよい、クレジット任意。素材としての再配布は不可 | `public/bg/<ファイル名>`（動画ごとの表） |
| フォント | M PLUS Rounded 1c（`@remotion/google-fonts` が読み込む） | SIL Open Font License | 置かなくてよい。書き出すときにネットにつながっている必要がある |
| motion-kit | [mktoho12/motion-kit](https://github.com/mktoho12/motion-kit) | MIT | 4本とも `package.json` で `v0.2.0` のタグに固定しているので、`npm ci` で入る |

効果音（ファイル名 ← 効果音ラボでの名前）:

| ファイル名 | 効果音ラボでの名前 | ページ |
|---|---|---|
| `surprise1.mp3` | 驚く | [アニメ](https://soundeffect-lab.info/sound/anime/) |
| `shock2.mp3` | ショック2 | アニメ |
| `nyu3.mp3` | ニュッ3 | アニメ |
| `tin1.mp3` | チーン1 | アニメ |
| `sceneswitch1.mp3` | シーン切り替え1 | アニメ |
| `pico-pico-hammer1.mp3` | ピコッ（ハンマーのおもちゃ） | アニメ |
| `chan-chan1.mp3` | ちゃんちゃん♪1 | アニメ |
| `data-display1.mp3` | データ表示1 | [ボタン・システム音](https://soundeffect-lab.info/sound/button/) |

どの動画でどの音を使うかは、各動画の `src/direction.ts` にあります。

### 動画ごとのもの

| 動画 | 書き出し | 背景 | BGM（曲名 / 作者 → ファイル名） |
|---|---|---|---|
| `tadashii-sharehouse` | `npm run render -- Pudding out/pudding.mp4` | みんちりえ「アイランドキッチン」の夜（照明あり）と夕方 → `bg/kitchen_night.png`、`bg/kitchen_evening.png`（配布されている 1920x1080 の PNG） | 自宅にて / KK → `bgm/jitaku-nite.mp3` |
| `nabe` | `npm run render -- Nabe out/nabe.mp4` | `tadashii-sharehouse` と同じ | 自宅にて / KK → `bgm/jitaku-nite.mp3` |
| `omoikomi` | `npm run render -- Omoikomi out/omoikomi.mp4`（サムネイルは `npx remotion still src/index.ts Thumb out/thumb.png`） | みんちりえ「リビング」（「リビング２」ではない）の照明あり → `bg/living_night_on.jpg`、「アパートの浴室」の昼・湯気なし → `bg/bathroom_day.jpg`。洗濯機置き場の3枚 `bg/laundry_{before,removed,new}.png` は下の「再現できないもの」を参照。`bg/hallway_on.jpg`（「アパートの玄関ホール」）はスタイルフレームの確認用で、書き出しには要らない | 追いかけっこキャッハー / 今川彰人オーケストラ → `oikakekko-kyahha.mp3`、ほんわかぷっぷー / もっぴーさうんど → `honwaka-puppu.mp3`、You and Me / しゃろう → `you-and-me.mp3`、10℃ / しゃろう → `10do.mp3`、わくわくクッキングタイム的なBGM / 鷹尾まさき → `wakuwaku-cooking.mp3`、Morning / しゃろう → `morning.mp3`（使う場面と音量は `src/direction.ts`） |
| `atarimae` | `npm run render -- Atarimae out/atarimae.mp4`（サムネイルは `npx remotion still src/index.ts Thumb out/thumb.png`） | みんちりえ「家の玄関ホール」の3番（夜・照明あり）→ `bg/house_hallway_3.jpg`、「一人部屋３」の3番（カーテンを閉めた夜）→ `bg/single_room3_3.jpg`、台所は `tadashii-sharehouse` と同じ「アイランドキッチン」の夜 → `bg/kitchen_night.png` | 追いかけっこキャッハー、ほんわかぷっぷー、You and Me、10℃、Morning（`omoikomi` と同じファイル）、自宅にて / KK → `jitaku-nite.mp3`（使う場面と音量は `src/direction.ts`） |
| `yattoita` | `npm run render -- Yattoita out/yattoita.mp4` | `amido` と同じリビング。最後に出す本編のサムネイルは、`atarimae` で書き出した `out/thumb.png` を `public/thumb-main.png` に置く | 追いかけっこキャッハー、ほんわかぷっぷー（`omoikomi` と同じファイル） |
| `hitorigoto` | `npm run render -- Hitorigoto out/hitorigoto.mp4`（サムネイルは `npx remotion still src/index.ts Thumb out/thumb.png`） | `omoikomi` と同じリビング → `bg/living_night_on.jpg`、台所は `tadashii-sharehouse` と同じ「アイランドキッチン」の夜 → `bg/kitchen_night.png` | 追いかけっこキャッハー、ほんわかぷっぷー、You and Me、10℃、Morning（`omoikomi` と同じファイル）、自宅にて / KK → `jitaku-nite.mp3`（使う場面と音量は `src/direction.ts`） |
| `hanauta` | `npm run render -- Hanauta out/hanauta.mp4` | `omoikomi` と同じリビング | 追いかけっこキャッハー、ほんわかぷっぷー（`omoikomi` と同じファイル） |
| `amido` | `npm run render -- Amido out/amido.mp4` | `omoikomi` と同じリビング。最後に出す本編のサムネイルは、`omoikomi` で書き出した `out/thumb.png` を `public/thumb-main.png` に置く（下の「再現できないもの」を参照） | 追いかけっこキャッハー、ほんわかぷっぷー（`omoikomi` と同じファイル） |

### 立ち絵の分け方

PSD を、レイヤーごとの PNG と `manifest.json` に分けます。[uv](https://docs.astral.sh/uv/) があれば、`psd-tools` を別に入れなくても動きます。

```sh
cd omoikomi   # 置きたい動画のフォルダで
uv run --with psd-tools python -I ../tadashii-sharehouse/tools/extract_psd.py ずんだもん立ち絵素材V3.2_基本版.psd public/tachie/zundamon
uv run --with psd-tools python -I ../tadashii-sharehouse/tools/extract_psd.py 四国めたん立ち絵素材2.1.psd public/tachie/metan
uv run --with psd-tools python -I ../tadashii-sharehouse/tools/extract_psd.py 春日部つむぎ立ち絵素材3.0.psd public/tachie/tsumugi
```

ほかの動画には、できた `public/tachie/` をそのままコピーします。コードは表情をレイヤー名（「上がり眉」など）で選ぶので、違う版の PSD を使うと、エラーにならずに表情が崩れることがあります。

### 再現できないもの

- **元になった会話**：どの動画も、住人の会話から気づきを取り出して作っています。会話の録音と文字起こしは公開しません。台本（`script.md`）は確定したものが入っているので、声と映像はそこから作れます
- **台本を AI に書かせたときの揺れ**：台本と演出は Claude Code（Claude Opus 5.5）が書き、人が直して確定しました。同じ指示をしても、毎回同じ台本にはなりません
- **`omoikomi` の洗濯機置き場の背景3枚**：住人が撮った写真をもとに、ChatGPT で絵に寄せたものです。使ったモデル名とプロンプトの全文は記録していません。頼み方の要点は `omoikomi/notes.md` にあります。元の写真は公開しません。`omoikomi` のサムネイルもこの背景を使うので、`amido` の最後に出す本編のサムネイルも同じ物は作れません。代わりの画像を同じ名前で置けば、書き出しはできます
- **素材ページの URL と、どのファイルを選んだか**：みんちりえの各背景と、OpenTracks の曲ページ（You and Me の 13787 以外）は URL を記録していません。素材名・曲名で探してください。OpenTracks の曲によっては、ページにファイルが2つ（ループ用など）ありますが、どちらを使ったかも記録していません

## 動かすには

必要なもの: Node.js（24 で動作確認）、[VOICEVOX](https://voicevox.hiroshiba.jp/)（音声合成。`localhost:50021` で起動しておく）、[uv](https://docs.astral.sh/uv/)（Python のスクリプトを動かす）、ElevenLabs の API キー（文字起こしをするときだけ。`~/.config/elevenlabs/api_key` に置く）

### いまある動画を書き出す

コマンドは動画のフォルダの中で実行します（例: `cd omoikomi`）。

1. `npm ci` で依存を入れる。`npm install` だと `package-lock.json` が書き換わることがあるので、`npm ci` を使う
2. **立ち絵を最初に用意する**（上の「立ち絵の分け方」）。立ち絵の `manifest.json` がないと、型チェックも Studio も、立ち絵を使わないアニマティックも動かない
3. ほかの素材（背景・BGM・効果音）を `public/` に置く
4. VOICEVOX を起動して、声を作る
5. 書き出す。初回は、Remotion が書き出し用のブラウザ（Chrome Headless Shell、約92MB）を自動でダウンロードする

```sh
npm ci                     # 初回だけ
python3 -I tools/synth_voice.py              # script.md の台詞を VOICEVOX で合成する
npm run studio             # Studio を開いて、ブラウザで見ながら調整する
npm run render -- Omoikomi out/omoikomi.mp4  # 書き出す（コンポジション名は動画ごとの表）
npm run typecheck          # 型チェック
```

`mugicha` だけは、`npm run render` にコンポジション名と出力先が入っているので、`npm run render` だけで書き出せます。

### 新しい動画を作る

動画を作るときの工程の文書（`docs/workflow.md`・`docs/grammar.md`）は motion-kit にあります。このリポジトリと同じ階層に motion-kit も clone して、motion-kit の中でも `npm install` しておきます。

```sh
git clone https://github.com/mktoho12/videos.git
git clone https://github.com/mktoho12/motion-kit.git
(cd motion-kit && npm install)
```

`videos/` と `motion-kit/` が隣に並ぶ形です。いまある動画を書き出すだけなら、motion-kit の clone は要りません。

掛け合い動画は、motion-kit の雛形（モーショングラフィックス用）からではなく、いちばん新しい動画を複製して始めます。手順は [channel/zundamon-guide.md](channel/zundamon-guide.md) の「新しい動画の始め方」にあります。

## クレジット

- 音声: VOICEVOX:ずんだもん、VOICEVOX:四国めたん、VOICEVOX:春日部つむぎ
- 立ち絵: 坂本アヒル
- 背景: みんちりえ（`omoikomi` の洗濯機置き場は、住人の写真から ChatGPT で作成）
- BGM（OpenTracks）: 自宅にて / KK（`tadashii-sharehouse`・`nabe`・`atarimae`・`hitorigoto`）。追いかけっこキャッハー / 今川彰人オーケストラ、ほんわかぷっぷー / もっぴーさうんど（`omoikomi`・`amido`・`atarimae`・`yattoita`・`hitorigoto`・`hanauta`）。You and Me / しゃろう、10℃ / しゃろう、Morning / しゃろう（`omoikomi`・`atarimae`・`hitorigoto`）。わくわくクッキングタイム的なBGM / 鷹尾まさき（`omoikomi`）
- 効果音: 効果音ラボ
