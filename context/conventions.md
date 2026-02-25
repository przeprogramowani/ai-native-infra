# Team Engineering Conventions

## Naming
- Variables and functions: descriptive camelCase (no abbreviations except `url`, `id`, `api`, `config`)
- Booleans: prefix with `is`, `has`, `should`, `can`
- Functions: verb-first (`getUserById`, not `user`)
- Files: match primary export (`UserService.ts` exports `UserService`)
- Constants: UPPER_SNAKE_CASE

## Error Handling
- All async operations: try/catch or .catch()
- Error messages MUST include: what operation failed + with what inputs
- No empty catch blocks — at minimum, log the error
- HTTP errors: include status code and actionable message
- Cleanup in `finally` blocks (connections, locks, file handles)

## TypeScript
- Zero `any` without explicit justification comment
- Prefer `interface` over `type` for object shapes
- Use `unknown` for external data, narrow with type guards
- Model states with discriminated unions, not optional fields
- Generic params: descriptive names (`TUser`, not `T`)

## Functions
- Single responsibility — if you need "and" to describe it, split it
- Max 3 parameters; options object beyond that
- Early returns over nested conditionals
- Query functions (`get*`, `find*`, `is*`) must be pure (no side effects)

## Security
- No secrets in code — environment variables only
- Validate user input at system boundaries
- SQL: parameterized statements only
- API responses: never leak stack traces or internal paths

## Testing
- Test names describe behavior: "returns empty array when no results found"
- Each test: own setup, own teardown, no interdependencies
- Specific assertions: `toEqual(expected)` not `toBeTruthy()`
- Cover edge cases: empty, null, boundary values, error paths
