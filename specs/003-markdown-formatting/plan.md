# Implementation Plan: Markdown Formatting Support

**Branch**: `003-markdown-formatting` | **Date**: 2026-02-08 | **Spec**: [specs/003-markdown-formatting/spec.md](spec.md)
**Input**: Feature specification from `/specs/003-markdown-formatting/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement comprehensive markdown formatting support including inline styles (strikethrough, code, links), block types (lists, quotes, code blocks), and horizontal rules. The implementation will extend the existing `mdast`/`hast` pipeline, ensuring GFM compliance and preserving the WYSIWYG experience through Qwik components and input rules.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.4.5 (Strict Mode)
**Primary Dependencies**: 
- `@builder.io/qwik` (v1.19.0)
- `mdast` / `hast` / `micromark` ecosystem
- `mdast-util-gfm` / `micromark-extension-gfm` (to be added)
**Storage**: In-memory `EditorDocument` state
**Testing**: Manual verification (Automated testing is Post-MVP per Constitution)
**Target Platform**: Web (Qwik SSR/SPA)
**Project Type**: Qwik Component Library
**Performance Goals**: <16ms response to typing (60fps); parse/serialize only on idle/save or debounced.
**Constraints**: Must work within `contentEditable` limitations; no new heavy dependencies if possible.
**Scale/Scope**: Core editor feature; affects all text rendering.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
| :--- | :--- | :--- |
| **I. Component-First** | ✅ | Formatting tools (toolbar) will be components. |
| **II. TypeScript Safety** | ✅ | All new entities/props will be typed. |
| **III. WYSIWYG Integrity** | ✅ | Design uses controlled block updates & input rules. |
| **IV. Markdown Std** | ✅ | GFM extensions will be used for Strikethrough. |
| **V. Accessibility** | ✅ | Toolbar must be keyboard accessible. |
| **VI. SSR Support** | ✅ | No direct DOM access in render; use `useVisibleTask$`. |
| **IX. FSD Structure** | ✅ | Will use `entities/markdown`, `features/formatting`. No `shared`. |

## Project Structure

### Documentation (this feature)

```text
specs/003-markdown-formatting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── entities/
│   ├── document/          # Existing: Block types update
│   ├── markdown/          # Existing: Parser/Serializer updates (GFM)
│   └── selection/         # Existing: Selection utils
├── features/
│   └── formatting/        # NEW: Input rules, toolbar actions
│       ├── input-rules/
│       └── commands/
└── widgets/
    └── editor/            # Existing: Editor component updates
```

**Structure Decision**: Adhering to FSD. Extending `entities/markdown` for core logic. Creating `features/formatting` for the interactive aspects (shortcuts, commands).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
