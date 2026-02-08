# Tasks: Markdown Formatting Support

**Feature Branch**: `003-markdown-formatting`
**Status**: Completed

## Phase 1: Setup
**Goal**: Initialize project structure and dependencies for the new feature.
**Independent Test**: Verify dependencies are installed and directories exist.

- [x] T001 Install GFM dependencies (mdast-util-gfm, micromark-extension-gfm) using package manager
- [x] T002 Create feature directory structure in `src/features/formatting/input-rules` and `src/features/formatting/commands`

## Phase 2: Foundational
**Goal**: Establish core data models and types required for all user stories.
**Independent Test**: TypeScript compilation passes with new types defined.

- [x] T003 Update `BlockType` and `Block` unions in `src/entities/document/model/document.ts` to include `list-item`, `blockquote`, `code-block`, `horizontal-rule`
- [x] T004 Define `ListItemBlock`, `BlockquoteBlock`, `CodeBlockBlock`, and `HorizontalRuleBlock` interfaces in `src/entities/document/model/document.ts`

## Phase 3: User Story 1 - Inline Text Formatting (P1)
**Goal**: Enable Strikethrough, Inline Code, and Links.
**Independent Test**: Users can apply formatting via toolbar/shortcuts; content survives round-trip.

### Implementation
- [x] T005 [US1] Update `src/entities/markdown/markdown.ts` to include GFM extensions in parser and serializer
- [x] T006 [US1] Implement `applyFormat` support for `strike`, `code`, `link` in `src/widgets/editor/lib/hooks/use-formatting.ts`
- [x] T007 [US1] Update `FloatingToolbar` in `src/widgets/editor/ui/floating-toolbar.tsx` to include Strikethrough, Code, and Link buttons
- [x] T008 [US1] Update `src/entities/markdown/markdown.ts` to handle HAST conversions for `del`, `code`, `a` tags

## Phase 4: User Story 2 - Lists Management (P1)
**Goal**: Enable Ordered and Unordered Lists.
**Independent Test**: Users can create lists using markdown shortcuts; lists render correctly.

### Implementation
- [x] T009 [P] [US2] Create `ListItemBlock` component in `src/widgets/editor/ui/list-item-block.tsx`
- [x] T010 [US2] Update `BlockTypeSelector` options in `src/widgets/editor/ui/block-type-selector.tsx` to include list types (if applicable)
- [x] T011 [US2] Update `src/widgets/editor/ui/editor.tsx` to render `list-item` blocks in the switch statement
- [x] T012 [US2] Update `src/entities/markdown/markdown.ts` to handle list serialization (grouping) and deserialization (flattening)
- [x] T013 [US2] Implement list input rules (bullet, ordered) in `src/features/formatting/input-rules/index.ts`
- [x] T014 [US2] Integrate input rules hook in `src/widgets/editor/ui/editor.tsx`

## Phase 5: User Story 3 - Quotes and Code Blocks (P2)
**Goal**: Enable Blockquotes and Fenced Code Blocks.
**Independent Test**: Users can create quotes and code blocks; they render distinctly.

### Implementation
- [x] T015 [P] [US3] Create `BlockquoteBlock` component in `src/widgets/editor/ui/blockquote-block.tsx`
- [x] T016 [P] [US3] Create `CodeBlockBlock` component in `src/widgets/editor/ui/code-block-block.tsx`
- [x] T017 [US3] Update `src/widgets/editor/ui/editor.tsx` to render `blockquote` and `code-block` types
- [x] T018 [US3] Update `src/entities/markdown/markdown.ts` to handle quote and code block conversions
- [x] T019 [US3] Implement block input rules (>, ```) in `src/features/formatting/input-rules/index.ts`

## Phase 6: User Story 4 - Structural Separators (P3)
**Goal**: Enable Horizontal Rules.
**Independent Test**: Users can insert horizontal rules.

### Implementation
- [x] T020 [P] [US4] Create `HorizontalRuleBlock` component in `src/widgets/editor/ui/horizontal-rule-block.tsx`
- [x] T021 [US4] Update `src/widgets/editor/ui/editor.tsx` to render `horizontal-rule` type
- [x] T022 [US4] Update `src/entities/markdown/markdown.ts` to handle thematic breaks
- [x] T023 [US4] Implement HR input rule (---) in `src/features/formatting/input-rules/index.ts`

## Phase 7: Polish & Cross-Cutting Concerns
**Goal**: Ensure quality, performance, and edge case handling.

- [x] T024 Verify Markdown Roundtrip (SC-002) for all new types manually
- [x] T025 Verify Input Rules (SC-001) for all triggers manually
- [x] T026 Ensure all new blocks support basic navigation (Up/Down) in `src/widgets/editor/lib/hooks/use-block-operations.ts` if needed
- [x] T027 Fix nested blockquote data loss by introducing `quoteLevel` in data model (SC-002 deviation fix)
- [x] T028 Support multi-block formatting in `toggleFormat`
