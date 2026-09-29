# WORKLOG

## 現在地（2026-09-30）

- **ブランチ構成（重要）**: 2026-09-30 に GitHub（mktoho12/videos、public）で公開した
  - **作業は `public` ブランチで行う**。`public` は `origin/main` を追跡していて、公開してよいものだけが入っている
  - ローカルの `main` は公開前の元の履歴で、公開してはいけないファイルを含む。リモートには無い。**`main` は push しない**（`git push origin main` や `git push --all` も不可）。`main` に戻って作業もしない
  - 公開してはいけないファイル（参考にした私物の写真など）は、`.gitignore` に入れた場所（今は `mugicha/reference/`）に置いて、commit しない。新しく作ったら、commit する前に `.gitignore` に足す。push する前に `git status` と `git diff --cached --stat` で中身を確かめる
- 動画1本目「麦茶」（`mugicha/`）は **完了**（2026-09-30）。`mugicha/out/mugicha.mp4`（git 管理外、`mugicha/` で `npm run render` を実行すると再生成）
- 段階5 詰めは値の変更なしで完了、段階4 本実装は 2026-09-30 に承認
- 段階3 アニマティックは秒数変更なしで確定
- 段階2 スタイルフレームは確定（ポットは現物の写真に合わせた。写真は公開しないので、git 管理外の `mugicha/reference/` に置いている）
- 段階1 構成は案B（冷たさの理由を添える）で確定
- 段階0 ブリーフは確定済み（motion-kit セッションでユーザーが確定したものを `mugicha/brief.md` に転記）
- 複製元は motion-kit v0.1.0（未タグ・未コミット）。docs/grammar.md と src/tokens.ts は未承認の叩き台なので、確定値として扱わない
- Node の構成: **動画ごとに package.json を持つ**（2026-09-30 ユーザー決定、案a）。麦茶は `mugicha/package.json`・`package-lock.json`・`tsconfig.json`・`remotion.config.ts`。コマンドは `mugicha/` の中で実行する（`npm run studio` / `npm run render` / `npm run typecheck`）。リポジトリ直下に package.json はない
- 新しい動画を始めるときは、その動画のディレクトリに package.json を作り、制作中は motion-kit を `file:../../motion-kit` で参照し、完成したらタグ（`git+https://github.com/mktoho12/motion-kit.git#vX.Y.Z`）に固定する
- 静止画の書き出し（`mugicha/` で）: `npx remotion still src/index.ts Mugicha-SF-S2 stills/sf-S2.png`（S3・S4 も同様）
- motion-kit は `git+https://github.com/mktoho12/motion-kit.git#v0.1.0` に固定済み（2026-09-30 に git+file から変更し、書き出しが md5 まで一致することを確認した）（コピーでインストールされるので、kit の変更は反映されない）。remotion.config.ts の alias は害がないので残している（file: 参照に戻したときに必要）
- motion-kit への提案16件は motion-kit セッションが受け取り済み。取り込み案をユーザーに出してから反映する予定（結果の連絡は未着）
- 次にやること: 特になし（麦茶は完了）。2本目を始めるときは brief.md（段階0）から。motion-kit の取り込み結果が来たら、雛形の変更点を確認する
- 雛形を複製するときの注意（motion-kit セッションより）:
  - composition/Animatic.tsx の `../../tokens` の import は `motion-kit/src/tokens` に書き換えた
  - 雛形・工程への改善案は notes.md の「motion-kit への提案」に書く
- 動画ディレクトリはリポジトリ直下の `<slug>/`（CLAUDE.md に反映済み）

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
