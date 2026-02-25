---
name: code-review
description: >
  Use this skill when the user asks to review code, check this PR, review my changes,
  code review, look at my code, give feedback on code quality, check for issues,
  audit this file, or wants a conventions check on their implementation.
license: MIT
metadata:
  author: team
  version: "1.0.0"
  category: quality
---

# Code Review

Review code against team engineering conventions and flag violations with actionable fixes.

## Process

1. Read every file in scope (changed files, PR diff, or specified files)
2. Check each convention category below
3. Report findings grouped by severity

## Naming

- Variables and functions use descriptive camelCase (no abbreviations except `url`, `id`, `api`, `config`)
- Booleans prefixed with `is`, `has`, `should`, `can`
- Functions are verb-first (`getUserById`, not `user`)
- Files match their primary export (`UserService.ts` exports `UserService`)
- Constants use UPPER_SNAKE_CASE

## Error Handling

- All async operations wrapped in try/catch or .catch()
- Error messages include: what operation failed + with what inputs
- No empty catch blocks — at minimum, log the error
- HTTP errors include status code and actionable message
- Cleanup happens in `finally` blocks (connections, locks, file handles)

## TypeScript

- Zero `any` without an explicit justification comment
- `interface` preferred over `type` for object shapes
- `unknown` used for external data, narrowed with type guards
- States modeled with discriminated unions, not optional fields
- Generic params use descriptive names (`TUser`, not `T`)

## Functions

- Single responsibility — if describing requires "and", it should be split
- Max 3 parameters; use options object beyond that
- Early returns over nested conditionals
- Query functions (`get*`, `find*`, `is*`) must be pure — no side effects

## Security

- No secrets in code — environment variables only
- User input validated at system boundaries
- SQL uses parameterized statements only
- API responses never leak stack traces or internal paths

## Testing

- Test names describe behavior: "returns empty array when no results found"
- Each test has own setup and teardown, no interdependencies
- Specific assertions: `toEqual(expected)` not `toBeTruthy()`
- Edge cases covered: empty, null, boundary values, error paths

## Output Format

Present findings as a structured review:

```
### Review Summary
- **Files reviewed**: <count>
- **Issues found**: <count by severity>

### Critical (must fix)
- `file:line` — <violation> → <fix>

### Warning (should fix)
- `file:line` — <violation> → <fix>

### Nitpick (consider)
- `file:line` — <suggestion>

### What looks good
- <positive observations>
```

Severity guide:
- **Critical**: Security issues, empty catch blocks, `any` without justification, secrets in code
- **Warning**: Naming violations, missing error context, nested conditionals, impure query functions
- **Nitpick**: Style preferences, minor naming suggestions, extra parameter that could use options object
