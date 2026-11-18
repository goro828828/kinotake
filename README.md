# きのたけカップ

Vite + TypeScript（フレームワークなし）の Web ゲーム。仕様は `CLAUDE.md`、見た目の参考は `prototype/`。

## 種目（3種類）

流れ：陣営選択 → 種目選択 → 3,2,1,START → ゲーム → 結果。勝ち点＝参加点50＋種目ごとの成績ボーナス。1日3回（＋QR 1回）の上限は3種目で共通。

| 種目 | 遊び方 | 成績ボーナス | 陣営の違い |
|---|---|---|---|
| きのたけ積み上げ | 往復するお菓子をタップで落として30秒積む | 段数×10、PERFECT×20 | きのこ：広く安定／たけのこ：細く難しい |
| 産地の収穫リレー | カゴを動かして原料をキャッチ。10秒ごとにカカオ→小麦→ミルクへバトンタッチ。虫に当たると0.7秒動けない | 収穫×10、5連続コンボ×20 | きのこ：カゴが広い／たけのこ：動きが速い |
| 産地クイズ | 商品に使われている原料の産地をあてる（1問10秒、最大5問）。いまはマンゴーの山＝インドのマンゴー、ピスタチオの里＝イタリアのピスタチオの4問 | 正解×40、残り秒×2のスピードボーナス | きのこ：まちがいを消すヒント1回（3択の問題のみ）／たけのこ：スピードボーナス×1.5 |

操作：積み上げ＝タップ／スペース、収穫＝ドラッグ／◀▶ボタン／←→キー、クイズ＝タップ／1・2・3キー。

## 必要なもの

- Node.js 18 以上（https://nodejs.org/ の LTS 版を推奨）

## 開発

```bash
npm install
npm run dev        # http://localhost:5173 （スマホ実機は同じWi-Fiで表示される Network URL へ）
```

## ビルドと公開

```bash
npm run build      # dist/ に静的ファイルを出力
npm run preview    # ビルド結果をローカルで確認
```

**Claudeのリンクで公開（現在の方法）**：`npm run build && node scripts/artifact.mjs` で 1ファイルの `artifact/kinotake-cup.html` を作り、Claudeに「きのたけのアーティファクトを更新して」と頼む。公開URL：https://claude.ai/artifact/PVVGLmLA4FWZFLRXYbZVCQ （共有範囲はページ右上の Share から）

`vite.config.ts` で `base: './'` にしているので、`dist/` をそのまま置けばどこでも動きます。

- **GitHub Pages（公開中）**：https://goro828828.github.io/kinotake/ 。mirai-denwa と同じく、ソースは `main`、公開ファイルは `gh-pages` ブランチ。更新は `npm run build && node scripts/deploy-gh.mjs`（GitHub CLI `gh` にログイン済みであること。git は不要）。
- **Vercel / Netlify**：Build command `npm run build`、Output directory `dist`。

## 構成

```
src/
  main.ts               画面の組み立て・種目の振り分け・ダブルタップ拡大の防止・効果音トグル
  games.ts              種目の一覧（名前・説明）と結果の共通型
  state.ts              陣営・勝ち点・プレイ回数（localStorage／使えない環境ではメモリ）
  sound.ts              効果音（Web Audio、オン/オフ保存）
  game/config.ts        積み上げのパラメータ・スコア・回数（CLAUDE.md §4〜§6）
  game/stack.ts         積み上げ本体（ループ・判定・カメラ・リサイズ）
  game/harvest-config.ts / game/harvest.ts   収穫リレーのパラメータと本体
  game/quiz-data.ts     クイズの問題とパラメータ
  ui/select.ts / ui/events.ts / ui/game.ts / ui/harvest.ts / ui/quiz.ts / ui/result.ts
  ui/common.ts          画面切替・トースト・勝ち点バー・カウントダウン
  assets/sprites.ts     SVGシンボル（キャラ・ピースは prototype と同一、収穫・クイズ用はオリジナル）
  styles.css
```

クイズの問題を増やすときは `src/game/quiz-data.ts` の `QUESTIONS` に追加（`choices` の1つ目が正解。2択か3択。表示時にシャッフルされます）。5問以上あれば毎回ランダムに5問出ます。

## テスト用メモ

プレイ回数をリセットしたいときは、ブラウザの開発者ツールで `localStorage.clear()`。
