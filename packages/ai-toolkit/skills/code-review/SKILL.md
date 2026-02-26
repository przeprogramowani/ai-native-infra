---
name: code-review
description: >
  Use this skill when the user asks to "review code", "check this PR",
  "review my changes", "code review", "check code quality", "review this diff",
  "give feedback on my code", or wants automated code review based on team
  engineering conventions.
license: MIT
metadata:
  author: team
  version: "1.0.0"
  category: quality
---

# Code Review

Automated code review based on team engineering conventions. Analyzes code changes and reports findings organized by severity.

## Process

### 1. Identify Changes

Determine what to review:
- If a PR number or URL is provided: fetch the diff with `gh pr diff`
- If "my changes" or "staged": use `git diff --cached` (or `git diff` for unstaged)
- If specific files are mentioned: review those files directly

### 2. Review Categories

Check each change against ALL of the following categories.

#### Naming

- Variables and functions use descriptive camelCase (no abbreviations except `url`, `id`, `api`, `config`)
- Booleans are prefixed with `is`, `has`, `should`, `can`
- Functions are verb-first (`getUserById`, not `user`)
- Files match their primary export (`UserService.ts` exports `UserService`)
- Constants use UPPER_SNAKE_CASE

#### Error Handling

- All async operations have try/catch or .catch()
- Error messages include: what operation failed + with what inputs
- No empty catch blocks — at minimum, log the error
- HTTP errors include status code and actionable message
- Cleanup happens in `finally` blocks (connections, locks, file handles)

#### TypeScript

- Zero `any` without explicit justification comment
- `interface` preferred over `type` for object shapes
- `unknown` used for external data, narrowed with type guards
- States modeled with discriminated unions, not optional fields
- Generic params have descriptive names (`TUser`, not `T`)

#### Functions

- Single responsibility — if you need "and" to describe it, split it
- Max 3 parameters; options object beyond that
- Early returns over nested conditionals
- Query functions (`get*`, `find*`, `is*`) are pure (no side effects)

#### Security

- No secrets in code — environment variables only
- User input validated at system boundaries
- SQL uses parameterized statements only
- API responses never leak stack traces or internal paths

#### Testing

- Test names describe behavior: "returns empty array when no results found"
- Each test has own setup and teardown, no interdependencies
- Specific assertions: `toEqual(expected)` not `toBeTruthy()`
- Edge cases covered: empty, null, boundary values, error paths

### 3. Classify Findings

Assign severity to each finding:

- **Critical**: Security vulnerabilities, missing error handling on external calls, use of `any` without justification, secrets in code, SQL injection risk
- **Warning**: Naming convention violations, missing cleanup in `finally`, impure query functions, more than 3 function parameters, empty catch blocks
- **Suggestion**: Preference for `interface` over `type`, generic parameter naming, test name style, early return opportunities

## Output Format

Present findings in this exact structure:

```
## Code Review Results

### Critical
- **[category]** `file:line` — description of the issue and how to fix it

### Warning
- **[category]** `file:line` — description of the issue and how to fix it

### Suggestion
- **[category]** `file:line` — description of the issue and how to fix it

---

**Summary**: X critical, Y warnings, Z suggestions
**Recommendation**: APPROVE | REQUEST CHANGES | NEEDS DISCUSSION
```

### Decision Rules

- Any **Critical** finding → **REQUEST CHANGES**
- 3+ **Warnings** with no Critical → **NEEDS DISCUSSION**
- Only **Suggestions** (or minor warnings) → **APPROVE**

### Empty Sections

Omit severity sections that have no findings. If everything passes:

```
## Code Review Results

No issues found.

**Recommendation**: APPROVE
```
