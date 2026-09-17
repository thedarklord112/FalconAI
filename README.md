# 🦅 DevClaw AI Assistant for GitHub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini%203.8%20Flash-Powered-purple)](https://ai.google.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-green?logo=github-actions)](https://github.com/features/actions)

> **DevClaw** is an autonomous, open-source AI software engineering assistant designed specifically for GitHub repositories. Inspired by autonomous agent systems and SWE-bench workflows, DevClaw runs both as a local developer CLI and as an automated GitHub Action (ClawSweeper) to triage issues, perform senior-level PR code reviews, generate verified bug patches, and maintain documentation.

---

## 🌟 Key Features

- 🤖 **Autonomous Issue Triage & Bug Resolution**: Parses GitHub issues, searches the codebase for root causes, drafts code patches, and submits ready-to-merge Pull Requests.
- 🔍 **Senior-Level PR Code Reviews**: Automatically reviews opened and updated pull requests with semantic understanding of changes, security scans (OWASP), performance checks, and inline suggestions.
- 🧩 **Modular SKILL.md Architecture**: Extensible skills system where agent capabilities (linting, test execution, database migration checks, API documentation) are declared in structured markdown specs.
- ⚡ **Powered by Gemini 3.8 Flash**: Leverages high-context window, multi-turn reasoning, and sub-second code generation.
- 🛡️ **Safe Execution Sandbox**: Validates patches against existing test suites before pushing code or creating branches.
- 🚀 **Dual Execution Modes**: Run locally in your terminal (`devclaw cli`) or automatically in CI/CD via GitHub Actions.

---

## 🏛️ Architecture Overview

```text
                 +-----------------------------------+
                 |    GitHub Repository / Events     |
                 |  (Pull Request, Issue, Push, CLI) |
                 +-----------------+-----------------+
                                   |
                                   v
                 +-----------------------------------+
                 |    DevClaw Gateway & Ingestion   |
                 |   (Octokit REST / Webhook / CLI)  |
                 +-----------------+-----------------+
                                   |
                                   v
                 +-----------------------------------+
                 |     DevClaw Autonomous Agent     |
                 |   - Codebase Context Packer       |
                 |   - ReAct Reasoning Engine        |
                 |   - Gemini 3.8 Flash Inference    |
                 +-----------------+-----------------+
                                   |
          +------------------------+------------------------+
          |                        |                        |
          v                        v                        v
+------------------+     +-------------------+    +--------------------+
|  Code Reviewer   |     |   Bug Fix Engine  |    |  README & Docs Bot |
|  - Security scan |     |   - File crawler  |    |  - Auto sync docs  |
|  - Inline diffs  |     |   - Unified patch |    |  - Changelog maker |
+------------------+     +-------------------+    +--------------------+
          |                        |                        |
          +------------------------+------------------------+
                                   |
                                   v
                 +-----------------------------------+
                 |       GitHub Output Action        |
                 |  (PR Comments, Patches, Branches) |
                 +-----------------------------------+
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- Node.js `>= 20.0.0` or Bun `>= 1.1`
- Git installed
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- A GitHub Personal Access Token (PAT) with `repo` scope

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/devclaw-assistant.git
cd devclaw-assistant

# Install dependencies (pnpm recommended)
pnpm install
# or: npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your-gemini-api-key"
GITHUB_TOKEN="ghp_your_github_personal_access_token"
REPO_OWNER="your-org"
REPO_NAME="your-repo"
DEVCLAW_MODEL="gemini-3.8-flash"
```

### 4. Run the CLI
```bash
# Build the project
pnpm build

# Run codebase review on current branch
pnpm devclaw review

# Ask DevClaw questions about your repo
pnpm devclaw ask "How does the authentication flow work in src/auth?"

# Fix an issue from GitHub
pnpm devclaw fix --issue 42
```

---

## ⚙️ GitHub Actions Integration (ClawSweeper Bot)

To run DevClaw automatically on every Pull Request or when issues are labeled `devclaw`, add `.github/workflows/devclaw.yml` to your repository:

```yaml
name: DevClaw Repository Assistant

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issues:
    types: [labeled]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  assistant:
    if: github.event_name == 'pull_request' || contains(github.event.issue.labels.*.name, 'devclaw')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run DevClaw Assistant
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            pnpm devclaw review --pr ${{ github.event.pull_request.number }}
          else
            pnpm devclaw fix --issue ${{ github.event.issue.number }}
          fi
```

---

## 📦 Project Structure

```text
devclaw-assistant/
├── .github/
│   └── workflows/
│       └── devclaw-assistant.yml    # CI/CD autonomous bot workflow
├── skills/
│   ├── pr-reviewer/
│   │   └── SKILL.md                  # PR review skill definition
│   ├── bug-fixer/
│   │   └── SKILL.md                  # Issue patcher skill definition
│   └── docs-architect/
│       └── SKILL.md                  # Documentation generator skill
├── src/
│   ├── agent/
│   │   ├── core.ts                   # ReAct agent loop
│   │   ├── context.ts                # Codebase context packager
│   │   └── prompts.ts                # System prompts for code reasoning
│   ├── integrations/
│   │   └── github.ts                 # Octokit GitHub client wrapper
│   ├── skills/
│   │   └── registry.ts               # SKILL.md loader & dispatcher
│   ├── tools/
│   │   ├── file-system.ts            # Safe file reading, writing, and diffing
│   │   └── test-runner.ts            # Local test validation runner
│   ├── cli.ts                        # Command Line Interface (Commander)
│   └── index.ts                      # Main library entrypoint
├── devclaw.config.json              # Assistant settings & skill bindings
├── package.json                      # Scripts & dependencies
├── tsconfig.json                     # TypeScript configuration
└── LICENSE                           # MIT License
```

---

## 🛡️ Security & Sandbox

- **Read-Only Default**: DevClaw operates in read-only analysis mode until explicitly authorized to write patches or branches.
- **Safe Branching**: All code fixes are created on dedicated branches (`devclaw/fix-issue-*`) for human review.
- **Secret Redaction**: File crawler automatically filters `.env`, `*.pem`, `id_rsa`, and keys matching secret regex patterns before sending context to the model.

---

## 🤝 Contributing

Contributions are welcomed! Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
