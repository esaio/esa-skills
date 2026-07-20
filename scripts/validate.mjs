#!/usr/bin/env node
// リポジトリの不変条件を検証する。
//
//   1. skills/<name>/SKILL.md の frontmatter が Agent Skills 仕様を満たすこと
//      （name はディレクトリ名と一致、小文字英数字とハイフンのみ、64 文字以内。
//        description は 1〜1024 文字）
//   2. 各マニフェストが列挙するスキルのパスが実在すること
//   3. version が全マニフェストで一致すること
//
// 使い方: node scripts/validate.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const fail = (msg) => errors.push(msg);
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const exists = (rel) => {
  try {
    statSync(join(root, rel));
    return true;
  } catch {
    return false;
  }
};

// --- 1. SKILL.md の frontmatter ---------------------------------------------

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const skillDirs = readdirSync(join(root, "skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (skillDirs.length === 0) fail("skills/ にスキルが 1 つもない");

for (const dir of skillDirs) {
  const rel = `skills/${dir}/SKILL.md`;
  if (!exists(rel)) {
    fail(`${rel} がない`);
    continue;
  }

  const source = readFileSync(join(root, rel), "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    fail(`${rel}: YAML frontmatter がない`);
    continue;
  }

  const field = (key) => {
    const line = frontmatter[1]
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${key}:`));
    return line ? line.slice(key.length + 1).trim() : null;
  };

  const name = field("name");
  const description = field("description");

  if (!name) fail(`${rel}: name がない`);
  else if (name !== dir)
    fail(`${rel}: name "${name}" がディレクトリ名 "${dir}" と一致しない`);
  else if (!NAME_RE.test(name) || name.length > 64)
    fail(`${rel}: name "${name}" が命名規則に違反している`);

  if (!description) fail(`${rel}: description がない`);
  else if (description.length > 1024)
    fail(`${rel}: description が 1024 文字を超えている (${description.length})`);
}

// --- 2. マニフェストが指すスキルのパス ---------------------------------------

// Claude Code: source: "./" ＋ skills 配列でルートの skills/ を直接指す。
for (const plugin of readJson(".claude-plugin/marketplace.json").plugins ?? []) {
  for (const path of plugin.skills ?? []) {
    const skillMd = join(path, "SKILL.md");
    if (!exists(skillMd))
      fail(`.claude-plugin/marketplace.json: ${plugin.name} が指す ${skillMd} がない`);
  }
}

// Cursor: source: "./" でルートを指し、marketplace.json と同じ .cursor-plugin/ に
// 置いた plugin.json がルートの skills/ を読む。Claude Code と同じ正本を共有するので
// 複製は持たない。
//
// marketplace.json のトップレベルは additionalProperties: false で
// name / owner / metadata / plugins しか許されない（cursor/plugins の公式スキーマ）。
// logo などを足すときは metadata の中か plugin.json 側に置くこと。
const CURSOR_MARKETPLACE_KEYS = new Set(["name", "owner", "metadata", "plugins"]);

const cursorMarketplace = readJson(".cursor-plugin/marketplace.json");
for (const key of Object.keys(cursorMarketplace)) {
  if (!CURSOR_MARKETPLACE_KEYS.has(key))
    fail(`.cursor-plugin/marketplace.json: 未許可のトップレベルキー "${key}"`);
}

for (const plugin of cursorMarketplace.plugins ?? []) {
  const source = typeof plugin.source === "string" ? plugin.source : null;
  if (!source) continue; // git ソースなどは対象外

  const pluginJson = join(source, ".cursor-plugin/plugin.json");
  if (!exists(pluginJson)) {
    fail(`.cursor-plugin/marketplace.json: ${plugin.name} の source に ${pluginJson} がない`);
    continue;
  }

  const skillsDir = readJson(pluginJson).skills ?? "./skills/";
  const dir = join(source, skillsDir);
  if (!exists(dir)) {
    fail(`${pluginJson}: skills ディレクトリ ${dir} がない`);
    continue;
  }

  const found = readdirSync(join(root, dir), { withFileTypes: true }).some(
    (entry) => entry.isDirectory() && exists(join(dir, entry.name, "SKILL.md")),
  );
  if (!found) fail(`${dir}: <name>/SKILL.md が 1 つもない`);
}

// --- 3. version の一致 -------------------------------------------------------

// version を持つファイルと、その取り出し方。
// Claude Code は marketplace.json 側で持つ（plugin.json を置かないため）。
// Cursor は marketplace.json に version を置けないので plugin.json 側で持つ。
const versionSources = [
  ["package.json", (m) => m.version],
  ["gemini-extension.json", (m) => m.version],
  [".claude-plugin/marketplace.json", (m) => m.plugins?.[0]?.version],
  [".cursor-plugin/plugin.json", (m) => m.version],
];

const versions = {};
for (const [rel, pick] of versionSources) {
  if (!exists(rel)) {
    fail(`${rel} がない`);
    continue;
  }
  const version = pick(readJson(rel));
  if (!version) fail(`${rel}: version が取り出せない`);
  else versions[rel] = version;
}

const unique = [...new Set(Object.values(versions))];
if (unique.length > 1) {
  fail(
    `version が一致しない:\n` +
      Object.entries(versions)
        .map(([file, version]) => `    ${version}  ${file}`)
        .join("\n"),
  );
}

// --- 結果 --------------------------------------------------------------------

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\n${errors.length} 件の問題があります。`);
  process.exit(1);
}

console.log(`ok: skills (${skillDirs.join(", ")}) / manifests / version ${unique[0]}`);
