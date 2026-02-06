# Implementation Plan: Basic Text Editor

**Branch**: `001-basic-text-editor` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-basic-text-editor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a foundational text editor component for the Qwik Editor library that supports basic text entry, block-based editing with paragraphs and headers (H1-H3), automatic resizing, and block type conversion. This is the core MVP feature that establishes the component architecture and editing model for all future functionality.

## Technical Context

**Language/Version**: TypeScript 5.4.5 with strict mode enabled  
**Primary Dependencies**: @builder.io/qwik 1.19.0, NEEDS CLARIFICATION: markdown parsing library  
**Storage**: Client-side memory only (no persistence in MVP)  
**Testing**: Deferred to post-MVP (per constitution)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)  
**Project Type**: Single library project (Qwik component library)  
**Performance Goals**:

- Editor ready for input within 1 second
- Keystroke response under 50ms
- Block type conversion under 100ms
- Content resize response under 200ms  
  **Constraints**:
- Must support SSR/resumability (no DOM access during init)
- Must handle 100+ blocks without performance degradation
- Must maintain WYSIWYG integrity (visual === markdown output)  
  **Scale/Scope**:
- Single root editor component
- 4 block types (Paragraph, H1, H2, H3)
- NEEDS CLARIFICATION: Internal data structure (AST, JSON, custom model)
- NEEDS CLARIFICATION: Cursor/selection management approach

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First Architecture

- ✅ **PASS**: Editor will be built as self-contained Qwik component
- ✅ **PASS**: Each block type (paragraph, headers) will be isolated component
- ✅ **PASS**: Props interfaces defined with TypeScript
- ✅ **PASS**: No side effects on import (sideEffects: false in package.json)

### II. TypeScript Safety

- ✅ **PASS**: TypeScript 5.4.5 with strict mode enabled (tsconfig.json)
- ✅ **PASS**: All component props will use typed interfaces
- ✅ **PASS**: Public API exports will have complete type definitions
- ⚠️ **ACTION REQUIRED**: Document any justified `any` types in code comments

### III. WYSIWYG Integrity

- ✅ **PASS**: Visual rendering must match markdown output exactly (core requirement)
- ✅ **PASS**: No metadata loss during block type conversion (FR-005)
- ⚠️ **DEFERRED**: Undo/redo explicitly out of scope for MVP
- ✅ **PASS**: Content mutations atomic (one block change at a time)
- ⚠️ **ACTION REQUIRED**: Design cursor preservation across block transformations

### IV. Markdown Standard Compliance

- ⚠️ **RESEARCH NEEDED**: Choose markdown parser/serializer library
- ⚠️ **RESEARCH NEEDED**: Define supported CommonMark subset for MVP
- ✅ **PASS**: Headers and paragraphs are core CommonMark elements
- ⚠️ **ACTION REQUIRED**: Document edge case handling for unsupported syntax

### V. Accessibility First

- ✅ **PASS**: Keyboard navigation required (FR-009: arrow keys, Enter, Backspace)
- ⚠️ **ACTION REQUIRED**: Define ARIA labels for block type selector (FR-006)
- ⚠️ **ACTION REQUIRED**: Design focus management between blocks
- ✅ **PASS**: Semantic HTML (native contenteditable or semantic block elements)
- ⚠️ **ACTION REQUIRED**: Ensure WCAG AA color contrast in styling

### VI. Server Rendering Support

- ✅ **PASS**: No direct DOM access during init (use Qwik lifecycle hooks)
- ⚠️ **ACTION REQUIRED**: Use useVisibleTask$ for client-only operations
- ⚠️ **ACTION REQUIRED**: Design hydration strategy for existing content
- ✅ **PASS**: Initial render shows editable content immediately

### VII. Data-Transformation-Action Principle

- ⚠️ **RESEARCH NEEDED**: Define data model (Content Block, Editor Document entities)
- ⚠️ **RESEARCH NEEDED**: Define transformation pipeline (user input → model update)
- ⚠️ **ACTION REQUIRED**: Isolate actions in event handlers
- ⚠️ **ACTION REQUIRED**: Use Qwik signals/stores for state management

### VIII. Low Coupling, High Cohesion

- ✅ **PASS**: Component-based architecture naturally enforces low coupling
- ⚠️ **ACTION REQUIRED**: Define clear interfaces between Editor/Block components
- ⚠️ **ACTION REQUIRED**: Ensure block type selector communicates via props/events only
- ✅ **PASS**: High cohesion - each block type handles its own rendering

### Quality Standards

- ✅ **PASS**: Oxlint configured (package.json scripts)
- ✅ **PASS**: Oxfmt configured (package.json scripts)
- ⚠️ **ACTION REQUIRED**: Add JSDoc to all exported components
- ⚠️ **ACTION REQUIRED**: Debounce markdown serialization (performance target)

**GATE STATUS**: ⚠️ **CONDITIONAL PASS** - Proceed to Phase 0 research to resolve NEEDS CLARIFICATION items and ACTION REQUIRED tasks

---

## Post-Phase 1 Constitution Re-Check

**Date**: 2026-02-04  
**Status**: All research completed, design finalized

### Resolution Summary

All NEEDS CLARIFICATION and ACTION REQUIRED items have been resolved through research and design phases:

### I. Component-First Architecture

- ✅ **RESOLVED**: Component hierarchy defined in contracts/component-api.md
- ✅ **RESOLVED**: Editor → Block → (ParagraphBlock | HeadingBlock) structure
- ✅ **RESOLVED**: All props interfaces fully typed in contracts

### II. TypeScript Safety

- ✅ **RESOLVED**: All types defined in data-model.md and contracts
- ✅ **PASS**: No `any` types needed for MVP implementation

### III. WYSIWYG Integrity

- ✅ **RESOLVED**: Cursor preservation strategy defined in research.md (hybrid approach)
- ✅ **RESOLVED**: Block transformations preserve content via immutable updates
- ✅ **PASS**: Virtual cursor state + DOM restoration ensures position preservation

### IV. Markdown Standard Compliance

- ✅ **RESOLVED**: mdast-util-from-markdown + mdast-util-to-markdown chosen (research.md)
- ✅ **RESOLVED**: CommonMark subset defined: Paragraphs + Headings (H1-H3)
- ✅ **RESOLVED**: Edge cases documented in research.md Decision 4

### V. Accessibility First

- ✅ **RESOLVED**: ARIA labels defined in contracts/component-api.md
- ✅ **RESOLVED**: Focus management strategy in quickstart.md Phase 9
- ✅ **RESOLVED**: Keyboard navigation fully specified in contracts
- ✅ **RESOLVED**: WCAG AA contrast requirements in quickstart.md Phase 9

### VI. Server Rendering Support

- ✅ **RESOLVED**: useVisibleTask$ usage patterns in quickstart.md
- ✅ **RESOLVED**: Hydration strategy: virtual state serialized, cursor restored post-hydration
- ✅ **RESOLVED**: No DOM access during init (research.md Decision 3)

### VII. Data-Transformation-Action Principle

- ✅ **RESOLVED**: Data model fully defined in data-model.md
- ✅ **RESOLVED**: Transformation pipeline: User input → Block update → Qwik reactivity → Re-render
- ✅ **RESOLVED**: Actions isolated in $ handlers (contracts specify all callbacks)
- ✅ **RESOLVED**: Qwik stores used for EditorState (data-model.md)

### VIII. Low Coupling, High Cohesion

- ✅ **RESOLVED**: Interfaces defined in contracts/component-api.md
- ✅ **RESOLVED**: BlockTypeSelector communicates via onTypeChange$ prop only
- ✅ **RESOLVED**: Clear module boundaries: components/, models/, services/

### Quality Standards

- ✅ **RESOLVED**: JSDoc requirements in quickstart.md Phase 8
- ✅ **RESOLVED**: Debouncing strategy in quickstart.md Phase 6 (300ms for onChange$)

**FINAL GATE STATUS**: ✅ **PASS** - All constitution principles satisfied, ready for implementation

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── editor/                    # New: Editor component
│   │   ├── editor.tsx             # Root editor component
│   │   ├── block.tsx              # Base block component
│   │   ├── paragraph-block.tsx   # Paragraph block implementation
│   │   ├── heading-block.tsx     # Heading block implementation (H1-H3)
│   │   ├── block-type-selector.tsx # UI control for changing block types
│   │   └── types.ts              # TypeScript interfaces for blocks
│   ├── counter/                   # Existing demo component
│   └── logo/                      # Existing demo component
├── models/                        # New: Data models
│   └── document.ts               # Document and block data structures
├── services/                      # New: Business logic
│   └── markdown.ts               # Markdown parsing/serialization
├── index.ts                       # Public API exports
├── root.tsx                       # Existing root component
├── entry.dev.tsx                  # Existing dev entry
└── entry.ssr.tsx                  # Existing SSR entry

tests/                             # Future: Testing (post-MVP)
├── unit/
├── integration/
└── contract/
```

**Structure Decision**: Single library project structure. The editor component will live under `src/components/editor/` as a feature module with supporting models and services for markdown handling. This follows the existing Qwik library structure and maintains clear separation of concerns (components, models, services).

## Complexity Tracking

**No violations requiring justification** - All constitution principles can be followed for this feature.
