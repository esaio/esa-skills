---
name: esa-cli
description: esa の記事・コメント・カテゴリ・タグ・メンバー・チーム・添付ファイルを操作する CLI ツール。「esa の記事を検索して」「記事読んで」「esa に投稿して」「この記事にコメントして」「添付を保存して」といったリクエストで使う。
---

# esa CLI

esa（esa.io）を `esa` コマンド（`@esaio/esa-cli`）で操作する。

- 出力はすべて JSON で標準出力に出る。人間向けメッセージは標準エラー。`jq` でパースできる。
- ここに載せるのは頻出の操作だけ。サブコマンドとオプションの全体は
  `esa --help` / `esa <command> --help` で確認する。

## 認証

`esa auth status` で確認。未認証なら `esa auth login`（ブラウザで OAuth 認証）。
環境変数 `ESA_ACCESS_TOKEN` が設定されていればそれも使える。

## 対象チームの解決

記事・コメント系はチームを対象に動く。チームは次の順で決まる:

1. `--team <name>`
2. 環境変数 `ESA_TEAM`
3. 既定チーム（`esa config set default-team <name>`）
4. 所属チームが 1 つだけならそれ
5. 複数所属で未指定ならエラー

明示するときは各コマンドに `--team <name>` を付ける。

## コマンドの構成

- `esa post` — 記事。list / search / get / create / update / append / prepend /
  duplicate / rollback / revisions / backlinks / archive / delete
- `esa comment` — コメント。list / get / create / update / delete
- `esa category` / `esa tag` / `esa member` — それぞれ list
- `esa team` — list / stats
- `esa user` — 認証ユーザーの情報
- `esa attachment` — sign / download
- `esa config` — set / get
- `esa api <path>` — 専用コマンドが無い API を直接叩く

## よく使う操作

```bash
esa post list -q "wip:true"        # 検索クエリで絞り込み（search <query> でも同じ）
esa post get 123                   # 記事を 1 件取得
esa post revisions 123             # rollback に渡すリビジョン番号を調べる

# 作成。名前に "/" を含めるとカテゴリになる（--category でも指定可）。既定は WIP
esa post create "dev/docs/新しい記事" --body "本文" --tags a,b --ship

esa post update 123 --name "改題" --ship   # 指定した項目のみ更新
esa post append 123 --body "末尾に追記"

esa comment create 123 --body "コメント本文"

esa post delete 123 --yes          # 非対話環境では --yes が必要（comment delete も同様）
```

## 本文の渡し方

記事・コメントの本文（Markdown）は `--body` でインライン指定するか、
`--body-file <path>`（`-` で標準入力）で渡す。長い本文は `--body-file` か HEREDOC を使う。

```bash
cat note.md | esa post create "タイトル" --body-file -

esa post create "タイトル" --body "$(cat <<'EOF'
## 見出し

本文をここに書く。
EOF
)"
```

## 任意の API を叩く（esa api）

専用コマンドが無いパスは `esa api` で直接叩く。認証・ベース URL・トークン更新は
既存の仕組みをそのまま使う。パス中の `{team}` は対象チームに自動置換される。

```bash
esa api /v1/teams/{team}/posts -f q=wip:true -f per_page=5  # -f はクエリパラメータ
esa api /v1/teams/{team}/comments/456 -X DELETE             # メソッドを明示

# 本文は生 JSON を --input（- で標準入力）で渡す。--input があれば既定で POST
echo '{"post":{"name":"Hi","wip":false}}' | esa api /v1/teams/{team}/posts --input -
```

## Tips

- 記事 URL `https://<team>.esa.io/posts/123` → 番号は `123`。
- 更新時はまず `esa post get <id>` で現在の本文を取得してから変更を加える。
- 本文の受け渡しは 2 種類あるので混同しない:
  - `--body-file -`: 本文テキストだけを標準入力から受け取る（`jq -r` で組み立て）。
  - `esa api ... --input -`: ボディ JSON 全体を標準入力から受け取る（`jq -n` で組み立て）。
