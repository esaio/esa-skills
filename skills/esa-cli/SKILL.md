---
name: esa-cli
description: esa の記事・コメント・カテゴリ・タグ・メンバー・チーム・添付ファイルを操作する CLI ツール。「esa の記事を検索して」「記事読んで」「esa に投稿して」「この記事にコメントして」「添付を保存して」といったリクエストで使う。 Use for requests to search, read, create, or update esa posts, comment on posts, browse team information, and upload or download attachments from esa.io.
license: MIT
---

# esa CLI

esa（esa.io）を `esa` コマンド（`@esaio/esa-cli`）で操作する。

ここに載せるのは頻出の操作だけ。サブコマンドとオプションの全体は
`esa --help` / `esa <command> --help` で確認する。

## 出力の形式

コマンドの結果は stdout、確認・エラーなど人間向けのメッセージは stderr に出る。
結果の形は出力先で変わり、端末では読みやすく整形され、パイプでは機械が扱いやすい
テキストになる。一覧は TSV（見出し無しのタブ区切り。タブ・改行は空白に均される）、
1 件表示は `key<TAB>value` の行（本文を持つものは `--` の後に本文が続く）。

JSON で受け取りたいときは `--json <fields>` を付ける。指定したフィールドだけが
JSON になり、フィールド名を省いて `--json` だけ渡すと候補が表示される。

```bash
esa post list --json number,full_name,url   # 機械的に扱うならこれ
esa post view 123 --json body_md            # 本文だけを取り出す
esa post list --json                        # 指定できるフィールドを確認
```

- 作成・更新（create / update / append / prepend / archive / duplicate / rollback /
  `attachment upload`）の stdout は URL だけ。削除は stdout に何も出さない。
- `esa api` は API のレスポンスをそのまま JSON で返す。
- `esa attachment download` はファイル本体を出す（通常は `--output <path>` で保存）。

## 認証

`esa auth status` で確認。未認証なら `esa auth login`（ブラウザで OAuth 認証）。
環境変数 `ESA_ACCESS_TOKEN` が設定されていればそれも使える。

トークンのスコープは絞られていることがある。許可されたスコープは `esa auth status`
で分かる。スコープ不足で失敗したら、必要なスコープを添えた
`esa auth login --scopes read:post,...` をユーザーに促す（ブラウザ操作が要るので
勝手に実行しない）。

## 対象チームの解決

記事・コメント系はチームを対象に動く。チームは次の順で決まる:

1. `--team <name>`
2. 環境変数 `ESA_TEAM`
3. 既定チーム（`esa config set default-team <name>`）
4. 所属チームが 1 つだけならそれ
5. 複数所属で未指定ならエラー

明示するときは各コマンドに `--team <name>` を付ける。4 の所属チームの取得には
`read:team` が必要なので、このスコープが無いトークンでは 1〜3 で指定する。

## コマンドの構成

- `esa post` — 記事。list / search / view（`get` は別名）/ create / update /
  append / prepend / duplicate / rollback / revisions / backlinks / archive / delete
- `esa comment` — コメント。list / view（`get` は別名）/ create / update / delete
- `esa category` / `esa tag` / `esa member` — それぞれ list
- `esa team` — list / stats
- `esa user` — 認証ユーザーの情報
- `esa attachment` — upload / sign / download
- `esa feedback` — create（esa.io 運営へのフィードバック送信）
- `esa config` — set / get。キーは `default-team` と `language`（`esa config --help` で一覧）
- `esa api <path>` — 専用コマンドが無い API を直接叩く

## よく使う操作

```bash
esa post list -q "wip:true"        # 検索クエリで絞り込み（search <query> でも同じ）
esa post view 123                  # 記事を 1 件表示（本文込み）
esa post view 123 --json body_md   # 本文だけを JSON で取り出す
esa post revisions 123             # rollback に渡すリビジョン番号を調べる

# 作成。名前に "/" を含めるとカテゴリになる（--category でも指定可）。既定は WIP
esa post create "dev/docs/新しい記事" --body "本文" --tags a,b --ship

esa post update 123 --name "改題" --ship   # 指定した項目のみ更新
esa post append 123 --body "末尾に追記"

esa comment create 123 --body "コメント本文"

esa attachment upload ./diagram.png   # stdout に添付の URL が出る

# 非対話環境での削除。ユーザーが明示的に削除を依頼し、対象を確認した後だけ実行する
esa post delete 123 --yes          # comment delete も同様
```

## 検索クエリ

`esa post search <query>` と `esa post list -q <query>` に渡すクエリは esa の検索記法。
よく使うのは `in:`（カテゴリ前方一致）/ `on:`（完全一致）/ `#tag` / `@screen_name` /
`wip:` / `created:>2025-01-01` / `-` による否定 / `sort:updated-desc`。
記法の一覧・比較演算子・ソートキーは
[references/search-options.md](references/search-options.md) を参照する。

```bash
esa post search 'in:日報 @alice wip:false sort:created-desc'
```

## 変更操作の安全性

- 作成・更新・コメント時は、対象チームと WIP / Ship の状態を依頼から確定できない場合だけ確認する。
- 記事の更新・アーカイブ・ロールバック・削除前に `esa post view <number>` で対象を確認する。
- 削除はユーザーが明示的に依頼した場合だけ行う。対象や意図が曖昧なら確認し、
  `--yes` は対象確認後の非対話実行にだけ使う。
- `esa api` で DELETE などの破壊的操作を行う場合も同じ基準を適用する。

## 本文の渡し方

記事・コメントの本文（Markdown）は `--body` でインライン指定するか、
`--body-file <path>`（`-` で標準入力）で渡す。長い本文は `--body-file` か HEREDOC を使う。
`esa feedback create` だけは `-m, --message` / `--message-file`（`--body` / `--body-file` は別名）。

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
- 更新時はまず `esa post view <id> --json body_md` で現在の本文を取得してから変更を加える。
- list 系コマンドは通常 1 ページだけ取得する。ページ情報（`total_count` / `next_page` など）は
  `--json` の出力に含まれるので、「すべて」と依頼された場合は `next_page` を見ながら
  `--page` を進める。`esa category list` では `--all` も使える。
- 本文の受け渡しは 2 種類あるので混同しない:
  - `--body-file -`: 本文テキストだけを標準入力から受け取る（`jq -r` で組み立て）。
  - `esa api ... --input -`: ボディ JSON 全体を標準入力から受け取る（`jq -n` で組み立て）。
- API リクエストに既定のタイムアウトは無い。待たせたくないときはコマンド名の前に
  グローバルオプションを置く: `esa --timeout 30 post list`。
