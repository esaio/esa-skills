# esa の検索オプション

`esa post search <query>` / `esa post list -q <query>` / `esa api ... -f q=<query>` に
渡すクエリの記法。出典: https://docs.esa.io/posts/104

使用例:

```
category:日報
created:>2023-07-05 @alice wip:false
```

| 記法                                            | 説明                                                          |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `keyword`                                       | 記事名 or カテゴリ or 本文に keyword を含む（表記揺れを考慮） |
| `"keyword"`                                     | 同上（語句の完全一致）                                        |
| `name:keyword` / `title:keyword`                | 記事名に keyword を含む                                       |
| `full_name:keyword`                             | "[カテゴリ名]/[記事名]" に keyword を含む                     |
| `number`                                        | 記事 ID（URL 末尾の番号）                                     |
| `wip:true` / `wip:false`                        | WIP or Shipped                                                |
| `kind:stock` / `kind:flow`                      | Stock or Flow                                                 |
| `category:keyword`                              | カテゴリ名に keyword を含む（部分一致）                       |
| `in:keyword`                                    | カテゴリ名が keyword で始まる（前方一致）                     |
| `on:keyword`                                    | カテゴリ名が keyword である（完全一致）                       |
| `body:keyword`                                  | 本文に keyword を含む                                         |
| `#tag1` / `tag:tag1`                            | tag1 タグが付いている（大文字小文字を区別しない）             |
| `#tag1 case_sensitive:true`                     | 同上（大文字小文字を区別する）                                |
| `@screen_name` / `user:screen_name`             | 記事作成者                                                    |
| `updated_by:screen_name`                        | 最終更新者                                                    |
| `comment:keyword`                               | コメント本文に keyword を含む記事                             |
| `starred:true` / `starred:false`                | 自分が Star している記事                                      |
| `watched:true` / `watched:false`                | 自分が Watch している記事                                     |
| `watched_by:screen_name`                        | そのメンバーが Watch している記事                             |
| `sharing:true` / `sharing:false`                | 外部公開状態                                                  |
| `stars:>3`                                      | Star 数が 3 より大きい                                        |
| `watches:>4`                                    | Watch 数が 4 より大きい                                       |
| `comments:>5`                                   | コメント数が 5 より大きい                                     |
| `done:>=6`                                      | 完了したタスクが 6 以上                                       |
| `undone:>0`                                     | 未完了のタスクが 0 より大きい                                 |
| `created:>2015-07-05`                           | 2015-07-05 以降に作成                                         |
| `updated:>2015-07`                              | 2015-07-01 以降に更新                                         |
| `keyword1 keyword2`                             | AND 検索（スペース区切り）                                    |
| `keyword1 OR keyword2` / `keyword1 \| keyword2` | OR 検索                                                       |
| `-keyword`                                      | 否定検索                                                      |

## 優先順位

左から順に処理される。`()` で優先順位を変えられる。

- `in:日報 えさ OR 餌` → (`in:日報` AND `えさ`) OR (`餌`)
- `in:日報 (えさ OR 餌)` → (`in:日報`) AND (`えさ` OR `餌`)

## 数値・日付の比較

`stars` / `watches` / `comments` / `number` / `done` / `undone` / `created` / `updated`
は比較演算子を取れる: `stars:3` `stars:>3` `stars:<3` `stars:>=3` `stars:<=3`。

## ソート順（`sort:<キー>`）

`best_match-desc`（ベストマッチ）/ `updated-desc` / `updated-asc` /
`created-desc` / `created-asc` / `stars-desc` / `watches-desc` / `comments-desc` /
`full_name-asc`（カテゴリ・タイトル順）/ `name-asc` / `number-desc` / `number-asc`

ベストマッチの優先度には Ship It 状態・タイトルへのキーワード含有・Stock/Flow・
Star / Watch / コメント数・アーカイブ状態が影響する。

## 検索例

- `help` — 記事名 or カテゴリ or 本文に `help` を含む記事
- `-in:help user:alice` — カテゴリに `help` を含まず、`alice` が作成した記事
- `name:テーブル #markdown` — 記事名に `テーブル` を含み、`markdown` タグが付いた記事
