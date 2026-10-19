# チャンネルのアイコンとバナー

YouTube チャンネル「ずんだもんのシェアハウス暮らし」のアイコン（800x800）・バナー（2560x1440）と、動画のサムネイル（1280x720、`Thumb` はプリン裁判）を描く Remotion の Still。
立ち絵の部品（`Tachie.tsx`・`font.ts`）と素材（`public/`）は `tadashii-sharehouse/` のものを使う。

書き出し方: 作業用のフォルダに `tadashii-sharehouse` の `package.json`・`tsconfig.json`・`remotion.config.ts`・`src/Tachie.tsx`・`src/font.ts` を置き、
`node_modules` と `public` を `tadashii-sharehouse` へのシンボリックリンクにして、ここの `ArtRoot.tsx`・`index.ts` を `src/` に入れる。
`Panels.tsx`・`style.ts` も `tadashii-sharehouse` から置き、`PuddingCup` を export する。
`npx remotion still src/index.ts Icon out/icon.png`（`Banner`、確認用の枠付き `BannerGuide` も同様）

- バナーで全端末に見えるのは中央の 1546x423 だけ。文字と顔はそこに収める
- 素材の規約: 立ち絵（坂本アヒル）は「動画やアイコン等、自由に」、背景（みんちりえ「アイランドキッチン」）は加工・商用可、素材としての再配布は不可。どちらもクレジット任意
- `out/` の画像は素材を含むので git に入れない
