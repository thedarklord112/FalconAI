---
name: "pr-reviewer"
description: "Autonomous code review agent for GitHub Pull Requests"
triggers:
  - pull_request.opened
  - pull_request.synchronize
---

# Pull Request Reviewer Skill

## Goal
Provide thorough, constructive, and actionable feedback on incoming pull requests.

## Checklist
1. **Logic & Architecture**: Does the code solve the intended issue without regressions?
2. **Security**:
   - Check input sanitization
   - Ensure no hardcoded secrets or API tokens
   - Verify CORS, JWT validation, SQL parameters
3. **Performance**: Avoid memory leaks, duplicate renders, unindexed queries.
4. **Testing**: Require accompanying tests for newly introduced functions.
5. **Formatting**: Ensure clean Markdown with code blocks and file line indicators.
