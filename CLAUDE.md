# videos — 個別のモーショングラフィックス動画

## このプロジェクトの目的
個々の動画を制作する場所。工程・動きの文法・共通部品は motion-kit（`../motion-kit`）に従う。
作業開始時に必ず `../motion-kit/docs/workflow.md` と `../motion-kit/docs/grammar.md` を読むこと。

## motion-kit との依存
- package.json は動画ごとに持つ（`<slug>/package.json`）。リポジトリ直下には置かない（2026-09-30 決定）
- 制作中の動画は `"motion-kit": "file:../../motion-kit"` で最新を参照してよい（npm は `link:` に非対応）
- 完成した動画は、使った motion-kit の git タグに固定し（`"motion-kit": "git+https://github.com/mktoho12/motion-kit.git#vX.Y.Z"`）、以後の kit の変更で見た目が変わらないようにする。固定後に書き出しが変わらないことを確認する

## ディレクトリ構成（動画ごと）
このリポジトリ直下の `<slug>/`（例: `mugicha/`）
- `brief.md` — 段階0の内容（人間が書く）
- `structure.md` — 段階1の確定したシーン表
- `styleframe.md` — 段階2の確定事項（色・書体・採用した文法）。静止画は `stills/`
- `src/` — Remotion のコンポジション
- `package.json` ほか（`package-lock.json`・`tsconfig.json`・`remotion.config.ts`）— この動画だけの依存。コマンドは `<slug>/` の中で実行する
- `notes.md` — 段階ごとの記録、人間の指摘、motion-kit への提案

新しい動画は `../motion-kit/src/templates/` から雛形を複製して始める。

## 進め方
- workflow.md の段階を飛ばさない。各段階の成果物を出したら停止し、承認を待つ
- 現在どの段階にいるかを notes.md の先頭に常に書いておく
- 前の段階の変更を求められたら差し戻しとして扱い、その旨を確認してから戻る
- 人間の指摘は「シーン番号＋時刻＋何が問題か」で受け取る。曖昧なら位置を確認する

## 実装ルール
- 所要時間・イージング・スタッガー・hold はハードコードしない。motion-kit のトークンか、zod スキーマの props 経由にする
- 動画固有の値でトークンから外れるものは、理由を notes.md に書く
- AI は `remotion still` で静止フレームを確認してよいが、タイミングの良し悪しは人間が判断する

## motion-kit への還元（重要）
作業中に次のどれかに気づいたら、notes.md の「motion-kit への提案」に記録する:
- 工程の問題（段階の順番、ゲートの位置、成果物の不足）
- 文法の問題（トークンが足りない、値が合わない、文法から外れる必要があった）
- 部品の問題（kit の部品が使いにくい、同じ演出をまた自前で書いた）

記録形式: 日付 / 対象（工程・文法・部品）/ 何が起きたか / 提案

motion-kit のコードや docs をこのリポジトリから直接書き換えない。還元は提案として残し、motion-kit 側で取り込む。
