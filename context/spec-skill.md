# Code Review Skill — Requirements

## Goal
Create an Agent Skill for automated code review based on our team's engineering conventions.

## What is an Agent Skill?
A SKILL.md file following the Agent Skills Open Standard (agentskills.io).
It lives in `.claude/skills/<name>/SKILL.md` and is auto-detected by Claude Code
based on the `description` field in frontmatter.

## Input
Our team conventions are documented in `context/conventions.md`. Use them as the
foundation for the skill's review categories and rules.

## Requirements
- Skill name: `code-review`
- Category: quality
- Auto-trigger on: "review code", "check this PR", "review my changes", "code review"
- Description field must be specific and "pushy" — include all trigger phrases
  (Claude Code uses this for auto-detection, generic descriptions undertrigger)

### Output format:
Findings organized by severity: Critical → Warning → Suggestion.
Each finding includes file:line reference.
Summary with pass/fail recommendation (APPROVE / REQUEST CHANGES / NEEDS DISCUSSION).
