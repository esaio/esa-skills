[日本語](README.ja.md)

# esa-skills

A collection of skills for operating [esa](https://esa.io) from AI agents.

## Overview

esa-skills provides skills that let AI agents operate your esa team directly.
With natural language instructions, you can search, read, create, and edit posts,
post comments, browse categories and tags, and manage attachments — all through
the [esa CLI](https://www.npmjs.com/package/@esaio/esa-cli).

## Skills

### esa-cli

A skill that enables AI agents to operate esa through the esa CLI.

#### Features

- **Posts** — Search, get, create, update, append/prepend, duplicate, rollback, archive, delete
- **Comments** — List, get, create, update, delete
- **Categories** — List paths
- **Tags / Members / Team** — List, stats
- **Attachments** — Sign, download
- **Escape hatch** — Call any esa API path via `esa api`

#### Usage Examples

```
"Search esa for meeting notes"
"Show me post 1234"
"Post today's work log as a WIP to esa"
"Add a comment to post 1234"
"List all tags on esa"
```

## Prerequisites

- Claude Code, Cursor, Gemini CLI, or Codex CLI installed
- [esa CLI](https://www.npmjs.com/package/@esaio/esa-cli) (`@esaio/esa-cli`) installed
- Authenticated with the esa CLI (`esa auth login`)

### Install the esa CLI

```bash
npm install -g @esaio/esa-cli
```

### Authentication

```bash
esa auth login
```

## Installation

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

Then start `cursor-agent` in interactive mode, open `/plugin`, and install esa
from the Marketplace.

### Gemini CLI

```bash
gemini extensions install https://github.com/esaio/esa-skills
```

## Author

[esa LLC](https://esa.io)

## License

MIT
