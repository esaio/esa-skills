# AGENTS.md

## プロジェクト概要

AI エージェント（Claude Code / Cursor / Gemini CLI / Codex CLI）から esa CLI
（`@esaio/esa-cli`）を操作させるためのスキル配布リポジトリ。esa CLI 本体の
実装コードは持たず、スキル定義（SKILL.md）、各エージェント向けの manifest、
配布用 asset、不変条件を検査するスクリプトで構成する。

## 構成

- `skills/esa-cli/SKILL.md` — スキル定義の唯一の正本
- `.claude-plugin/marketplace.json` — Claude Code / Codex マーケットプレイス定義
- `gemini-extension.json` — Gemini CLI 拡張定義
- `.cursor-plugin/marketplace.json` — Cursor チームマーケットプレイス定義
- `.cursor-plugin/plugin.json` — Cursor プラグイン manifest
- `assets/logo.svg` — `.cursor-plugin/plugin.json` が参照するロゴ
- `package.json` — version の在り処の一つ（Validation 参照）
- `scripts/validate.mjs` — 不変条件の検証

4 エージェントすべてが同じ `skills/` を正本にする。複製もコピーも持たない。

- **Claude Code** — marketplace エントリが `source: "./"` ＋ `skills: ["./skills/esa-cli"]`
  でルートを指す。マーケットプレイスルートを `source` にして `skills` でスキル
  ディレクトリを列挙する形は公式ドキュメントに記載のあるパターン。
  https://code.claude.com/docs/en/plugin-marketplaces
- **Codex** — `$REPO_ROOT/.claude-plugin/marketplace.json` を legacy-compatible な
  マーケットプレイスとして読む。プラグインが同梱するスキルはプラグインルートの
  `skills/` に置く規約で、`source: "./"` の本リポジトリはこれを満たす。
  この互換経路を意図的に使うため、Codex ネイティブ形式で必要になる
  `.codex-plugin/plugin.json` は置かない。
  https://learn.chatgpt.com/docs/build-plugins
- **Gemini CLI** — ルートの `gemini-extension.json` ＋ `skills/<name>/SKILL.md` が
  `gemini extensions new <path> skills` が生成する公式テンプレートそのもの。
  `skills` を宣言するフィールドは無く、ディレクトリ規約で発見される。
  https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md
- **Cursor** — marketplace エントリが `source: "./"` でルートを指し、
  `.cursor-plugin/plugin.json` を marketplace.json と同じディレクトリに置く。
  plugin root = リポジトリルートなので `skills` も `logo` もルート基準で解決する。
  https://github.com/cursor/plugin-template

frontmatter の `name` はディレクトリ名と一致させること（Agent Skills 仕様の要件）。
スキル名を変える場合はディレクトリ名・`name`・`.claude-plugin/marketplace.json` の
`skills` を揃えて変更する。

## Validation

```bash
npm run validate
```

`scripts/validate.mjs` が検証するのは次の 4 点。

1. `skills/<name>/SKILL.md` の frontmatter の `name` / `description` が、
   検査対象にしている Agent Skills 仕様の制約を満たすこと
2. Claude Code / Cursor のマニフェストが指すスキルのパスが実在すること
3. `.cursor-plugin/marketplace.json` のトップレベルキーが許可済みのものだけであること
4. version が全マニフェストで一致すること

4 の version は次の 4 箇所にある。上げるときは全部揃える。

- `package.json` の `version`
- `gemini-extension.json` の `version`
- `.claude-plugin/marketplace.json` の `plugins[0].version`
- `.cursor-plugin/plugin.json` の `version`

Claude Code 向けは `.claude-plugin/plugin.json` を置かないので marketplace エントリ側が、
Cursor は逆に marketplace.json へ version を置けない（スキーマが許さない）ので
`.cursor-plugin/plugin.json` が在り処になる。置き場所が違うのはスキーマ都合で、
揃えるべき値は 1 つ。

また `.cursor-plugin/marketplace.json` のトップレベルは `additionalProperties: false` で
`name` / `owner` / `metadata` / `plugins` しか許されない（cursor/plugins の公式スキーマ）。
`logo` や `version` を足したくなったら `metadata` の中か `.cursor-plugin/plugin.json` 側に
置く。validate.mjs はこのキー制約も検査する。

公式ツールでのスキーマ検証:

```bash
claude plugin validate .claude-plugin/marketplace.json
gemini extensions validate .
```

公開前にローカルパスで実際に往復させて確認できる:

```bash
claude plugin marketplace add "$PWD"
claude plugin install esa-cli@esa-skills
claude plugin details esa-cli@esa-skills   # Skills (1) esa-cli が出れば OK
claude plugin uninstall esa-cli@esa-skills && claude plugin marketplace remove esa-skills
```
