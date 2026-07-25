---
name: esa-cli
description: esa の記事・コメント・カテゴリ・タグ・メンバー・チーム・添付ファイルを操作する CLI ツール。「esa の記事を検索して」「記事読んで」「esa に投稿して」「この記事にコメントして」「添付を保存して」といったリクエストで使う。 Use for requests to search, read, create, or update esa posts, comment on posts, browse team information, and upload or download attachments from esa.io.
license: MIT
---

# esa CLI

esa（esa.io）を `esa` コマンド（`@esaio/esa-cli`）で操作する。

- API レスポンスは JSON で標準出力に出る。人間向けメッセージは標準エラー。`jq` でパースできる。
- `esa attachment download` は例外で、ファイル本体を出力する。通常は `--output <path>` で保存する。
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
- `esa attachment` — sign / download / upload
- `esa feedback` — create
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

esa attachment upload ./diagram.png

# 非対話環境での削除。ユーザーが明示的に削除を依頼し、対象を確認した後だけ実行する
esa post delete 123 --yes          # comment delete も同様
```

## 変更操作の安全性

- 作成・更新・コメント時は、対象チームと WIP / Ship の状態を依頼から確定できない場合だけ確認する。
- 記事の更新・アーカイブ・ロールバック・削除前に `esa post get <number>` で対象を確認する。
- 削除はユーザーが明示的に依頼した場合だけ行う。対象や意図が曖昧なら確認し、
  `--yes` は対象確認後の非対話実行にだけ使う。
- `esa api` で DELETE などの破壊的操作を行う場合も同じ基準を適用する。

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
- list 系コマンドは通常 1 ページだけ取得する。「すべて」と依頼された場合は出力の
  ページ情報を確認して最終ページまで取得する。`esa category list` では `--all` も使える。
- 本文の受け渡しは 2 種類あるので混同しない:
  - `--body-file -`: 本文テキストだけを標準入力から受け取る（`jq -r` で組み立て）。
  - `esa api ... --input -`: ボディ JSON 全体を標準入力から受け取る（`jq -n` で組み立て）。
