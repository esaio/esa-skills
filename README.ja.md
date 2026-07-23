[English](README.md)

# esa-skills

AI エージェントから [esa](https://esa.io) を操作するためのスキル集。

## 概要

esa-skills は、AI エージェントに esa チームを直接操作させるスキルを提供します。
自然言語の指示で、記事の検索・取得・作成・編集、コメント投稿、カテゴリ・タグの
参照、添付ファイルの操作などを、[esa CLI](https://www.npmjs.com/package/@esaio/esa-cli)
経由で行えます。

## スキル

### esa-cli

esa CLI を通じて AI エージェントに esa を操作させるスキル。

#### できること

- **記事** — 検索 / 取得 / 作成 / 更新 / 追記 / 複製 / ロールバック / アーカイブ / 削除
- **コメント** — 一覧 / 取得 / 作成 / 更新 / 削除
- **カテゴリ** — パス一覧
- **タグ / メンバー / チーム** — 一覧 / 統計
- **添付ファイル** — 署名付き URL 取得 / ダウンロード
- **エスケープハッチ** — `esa api` で任意の esa API パスを呼ぶ

#### 利用例

```
「esa で議事録を検索して」
「記事 1234 を見せて」
「今日の作業ログを WIP で esa に投稿して」
「記事 1234 にコメントして」
「esa のタグ一覧を出して」
```

## 前提

- Claude Code / Cursor / Gemini CLI / Codex CLI のいずれか
- [esa CLI](https://www.npmjs.com/package/@esaio/esa-cli)（`@esaio/esa-cli`）のインストール
- esa CLI で認証済み（`esa auth login`）

### esa CLI のインストール

```bash
npm install -g @esaio/esa-cli
```

### 認証

```bash
esa auth login
```

## インストール

### Claude Code

```
claude plugin marketplace add https://github.com/esaio/esa-skills
claude plugin install esa@esa-skills
```

### Codex CLI

```bash
codex plugin marketplace add https://github.com/esaio/esa-skills
codex plugin add esa@esa-skills
```

### Cursor Agent

```bash
cursor-agent plugin marketplace add https://github.com/esaio/esa-skills
```

追加後、`cursor-agent` を対話モードで起動して `/plugin` を開き、Marketplace から
esa をインストールしてください。

### Gemini CLI

```bash
gemini extensions install https://github.com/esaio/esa-skills
```

### 任意のエージェント（npx skills）

[`npx skills`](https://github.com/vercel-labs/skills) は各エージェント横断の
スキルパッケージマネージャです。検出したコーディングエージェントすべてに
esa-cli を 1 コマンドで導入できます。複数のエージェントを併用している場合や、
上記に無いエージェントを使う場合に便利です。

```bash
# 検出した全エージェントに導入（プロジェクト単位）
npx skills add esaio/esa-skills

# 特定のエージェントだけに導入
npx skills add esaio/esa-skills --agent claude-code

# 全プロジェクト共通で導入
npx skills add esaio/esa-skills --global
```

## 作者

[esa LLC](https://esa.io)

## ライセンス

MIT
