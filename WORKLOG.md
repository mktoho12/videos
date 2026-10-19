# WORKLOG

## 現在地（2026-10-19）

- **ブランチ構成（重要）**: GitHub（mktoho12/videos、public）で公開している
  - **作業は `public` ブランチで行い、`git push origin public:main` で GitHub の `main` に上げる**（`public` は `origin/main` を追跡している）
  - ローカルの `main` は公開前の元の履歴で、公開してはいけないファイルを含む。**`main` は push しない**（`git push origin main` や `git push --all` も不可）
  - 公開してはいけないもの（録音・文字起こし・私物の写真・素材）は、各動画の `reference/`（`*/reference/` で除外）や `public/`・`stills/` に置き、commit しない。push する前に `git status` と `git diff --stat origin/main..public` で中身を確かめる
  - **公開しない動画はフォルダごと `.gitignore` に入れる**。`kaji-to-kenryoku/` はフォルダごと除外し、2026-10-19 に未 push の履歴からも消した（em105 の手元にだけ残っている）
- 動画1本目「麦茶」（`mugicha/`）: 完了（2026-09-30）
- `kaji-to-kenryoku/`: 非公開の試作。**公開しない**。git の対象外
- 動画「プリン裁判は2人では終わらない」（`tadashii-sharehouse/`）: **完了**（2026-10-19）。ずんだもん・春日部つむぎ・四国めたんの掛け合い、約4分15秒。motion-kit v0.2.0 に固定済み。完成版は `tadashii-sharehouse/out/tadashii-sharehouse.mp4`（git 管理外、Mac の ~/Downloads/2026-10-19/ に転送済み）
- README.md（2026-10-19）: 共同制作者向けに、リポジトリの中身・掛け合い動画の作り方・守っていること・動かし方を書いた
- 掛け合い動画の作り方: 合意して録った雑談 → `tools/transcribe.sh`（ElevenLabs Scribe v2、キーは `~/.config/elevenlabs/api_key`）で話者付き文字起こし → ネタ選び → 段階0〜6。台本は VOICEVOX（localhost:50021）で合成し、試聴用の音声で確認する
- 環境の注意: `~/.local/bin/npm`（mise の npm へのリンク）は npm-cli.js を見つけられず動かない。`/home/mktoho/.local/share/mise/installs/node/lts/bin` を PATH の先頭に入れて使う（未修正）
- YouTube チャンネル「ずんだもんのシェアハウス暮らし」（@zundamon-sharehouse）を作成済み（2026-10-19）。操作は agent-browser の `--session youtube --restore` でログイン済み
- ショート「みんな自分の分は完璧」（`nabe/`）: **完了**（2026-10-19）。縦長 48.6秒、ループで最初と最後がつながる。motion-kit v0.2.0 に固定済み。完成版は `nabe/out/nabe.mp4`（git 管理外）。YouTube に公開済み（https://youtube.com/shorts/Ln2KiMeGmhQ、関連動画に本編を設定）
- 次にやること: 特になし。次の動画は、合意して録った雑談からネタを選ぶところから。motion-kit への提案（各動画の notes.md）は motion-kit 側で取り込み待ち

## 記録

### 2026-09-26
- HQ セッションの依頼（ユーザー承認済み）で初期準備: `git init`、WORKLOG.md 作成
- HQ の依頼でブランチ名を master から main に変更（まだコミットなし）
- motion-kit セッションから、templates と workflow.md 初版ができたと連絡があった
- motion-kit セッションから、ブリーフはそちらでユーザーと詰めていると連絡があった。確定版が届くまで待つ
- ブリーフ確定の連絡を受け、`mugicha/` を作って雛形を複製。brief.md に転記し、段階1の構成3案を structure.md に書いた
- ユーザーが構成案Bを選択。structure.md と notes.md に記録
- ユーザーの了承を得て Remotion を導入し、段階2の静止画3枚と styleframe.md を作成
- ユーザーがスタイルフレームを確定。段階3のアニマティックを用意
- ユーザーがアニマティックを確定。段階4 本実装 `Mugicha` を作成（キーフレームを still で確認、崩れなし）

### 2026-09-30
- 初回コミット（段階4 本実装まで。人の Studio 確認待ちの状態）
- ユーザーが本実装を確認して承認（「いい感じだね」）。段階5 詰めへ
- 詰め完了（変更なし）。mp4 を書き出し（yuv420p / bt709 に指定し直した）
- ユーザーが書き出し結果を確認して完了。motion-kit セッションにタグ付けと、notes.md の提案の取り込みを依頼
- motion-kit に v0.1.0 のタグが付いた（59f761f）。package.json をそのタグに固定し、書き出しが同一であることを確認
- ユーザーが案a（動画ごとに package.json）を選択。package.json 一式を mugicha/ へ移し、依存が1つにまとまること・書き出しが同一（md5 一致）であることを確認
- ユーザーの指示（推奨案で進めてよい）で、CLAUDE.md を今の構成に合わせて更新（動画ごとの package.json、`file:../../motion-kit`、タグ固定の書き方、`styleframe.md`、置き場所 `<slug>/`）
- セッション終了。HQ に報告

### 2026-10-17
- `kaji-to-kenryoku/`（非公開の試作）を制作

### 2026-10-19
- ユーザーの判断で `kaji-to-kenryoku/` は公開しないことに決定。以後の動画は、合意して録った会話だけを使い、個人を特定できない一般的な問題提起にする
- `tadashii-sharehouse/` を制作。録音を ElevenLabs Scribe v2 で文字起こしし、ネタ「プリン裁判は2人では終わらない」を選んで段階0〜6を完了
- 3人目の立ち絵は東北きりたん（太ももまでの絵で不自然）→ 春日部つむぎ 3.0 に変更。つむぎの公式 FAQ で、自分で用意した立ち絵でも個人の範囲なら収益化してよいことを確認
- `kaji-to-kenryoku/` を未 push の履歴からフォルダごと消し、`.gitignore` に追加。README.md を追加して GitHub に push（f6347e5）
- シェアハウスの管理人さんの許可を得て、YouTube チャンネル「ずんだもんのシェアハウス暮らし」（https://www.youtube.com/@zundamon-sharehouse 、ID UCbc8K8Eucb1_UjDz0LDLARw）を作成。ユーザーの Google アカウントが管理するブランドアカウント（@mktoho-dev とは別名義）。説明文に「非公式の二次創作チャンネル」と VOICEVOX のクレジットを記載。アイコン・バナーは未設定
- キャラ名をチャンネル名に使うことは、ずんだもん（zunko.jp/guideline.html）・つむぎ（FAQ）の規約上、個人なら可。条件: 公式と誤解されない名前と説明、動画ごとに概要欄へ `VOICEVOX:〇〇` のクレジット、商標登録しない、企業スポンサー案件は有償扱い
- チャンネルのアイコン（ずんだもんの顔）とバナー（キッチンの背景＋タイトル＋3人）を作って設定。作り方は `channel/art/README.md`。立ち絵（坂本アヒル）・背景（みんちりえ）の規約はアイコン・バナーへの利用も可と確認
- プリン裁判の手直し（立ち絵の部品を Remotion の `<Img>` に替えてちらつきを解消、クレジットに「企画・原案 EngineMaker新宿」）。手直し版を `tadashii-sharehouse/out/tadashii-sharehouse.mp4` とし、前の版は `-before-fix.mp4` に改名して残した
- プリン裁判を YouTube にアップロードし、ときさばさんの OK をもらって **公開**（2026-10-19）（https://youtu.be/iCaRi3eyvCw）。タイトル「プリン裁判は2人では終わらないのだ【ずんだもん・めたん・つむぎ】」、説明文にチャプター・クレジット、サムネイルは `channel/art/out/thumb-pudding.png`
- 動画の説明文のクレジットに EngineMaker新宿 の URL（https://enginemaker.space/）を追加。説明文のリンクをクリックできるようにする確認のため、ユーザーが身分証明書を提出し、YouTube の確認待ち（2026-10-19）。通ったらリンクがクリックできるか確かめる
- ショート「みんな自分の分は完璧」（`nabe/`）を段階0〜6まで制作して完了。本編の一部を切り出す案はやめ、ショート単体で完結する1本にした（ユーザーの判断）。ネタは同じ会話から「共有の大鍋・1.1倍」
- YouTube のリミックス: 一般のチャンネルでは「許可しない」を選べない（完全なオプトアウトはパートナーのみ、長尺も同じ）。ショートは「音声のみ許可」にした。規約を確認し、効果音ラボは FAQ でショートの音声再利用を明文で許可、ずんだもん・めたんは該当する禁止なし、OpenTracks（BGM）とつむぎは明文なし（台詞と混ざった音声で YouTube の外に出ないので配布には当たりにくい）と判断。気になれば BGM を、ショートでの再利用を明文で許す配布元のものに差し替える
- ユーザーの判断で、ショートの BGM は今後も「自宅にて」のまま（差し替えない）。リミックスは「音声のみ許可」で運用
