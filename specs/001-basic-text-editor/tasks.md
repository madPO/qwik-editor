# Tasks: Basic Text Editor

**Input**: Design documents from `specs/001-basic-text-editor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in this feature specification, so test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project at repository root
- Source: `src/`
- Component structure: `src/components/editor/`
- Models: `src/models/`
- Services: `src/services/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [x] T001 Install markdown parsing libraries (mdast-util-from-markdown, mdast-util-to-markdown, micromark) via npm
- [x] T002 [P] Install TypeScript types for mdast (@types/mdast) as dev dependency
- [x] T003 [P] Verify TypeScript configuration has strict mode enabled in tsconfig.json
- [x] T004 [P] Run lint baseline check to ensure clean starting point

**Checkpoint**: Dependencies installed, TypeScript strict mode confirmed, lint passes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data structures and markdown service that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create data model types in src/models/document.ts (BlockType, BaseBlock, ParagraphBlock, HeadingBlock, Block, EditorDocument, Selection, EditorState)
- [x] T006 Verify type definitions compile without errors using npm run build.types
- [x] T007 Create markdown service in src/services/markdown.ts with parseMarkdown function
- [x] T008 Implement serializeMarkdown function in src/services/markdown.ts
- [x] T009 Implement convertMdastToBlocks helper function in src/services/markdown.ts
- [x] T010 Implement blockToMdast helper function in src/services/markdown.ts
- [x] T011 Implement extractText helper function in src/services/markdown.ts
- [x] T012 Manually test markdown parsing and serialization bidirectionality
- [x] T013 Create types.ts re-export file in src/components/editor/types.ts

**Checkpoint**: Foundation ready - data model defined, markdown conversion works bidirectionally, user story implementation can now begin

---

## Phase 3: User Story 1 - Basic Text Entry (Priority: P1) 🎯 MVP

**Goal**: Users can open the editor and start typing text immediately. Text appears on screen, editor auto-expands, and Enter key creates new lines.

**Independent Test**: Open editor, click editing area, type text. Success = text appears exactly as entered. Press Enter to create new lines.

### Implementation for User Story 1

- [x] T014 [P] [US1] Create ParagraphBlock component in src/components/editor/paragraph-block.tsx with contentEditable support
- [x] T015 [P] [US1] Create HeadingBlock component in src/components/editor/heading-block.tsx with H1/H2/H3 rendering based on level
- [x] T016 [US1] Create Editor component in src/components/editor/editor.tsx with EditorState initialization
- [x] T017 [US1] Implement handleBlockUpdate handler in Editor component for content changes
- [x] T018 [US1] Implement block rendering logic in Editor component (map blocks to ParagraphBlock/HeadingBlock)
- [x] T019 [US1] Add placeholder text support when editor is empty in Editor component
- [x] T020 [US1] Create basic CSS styles in src/components/editor/editor.css (paragraph, heading sizes, contentEditable focus)
- [x] T021 [US1] Implement onChange$ prop callback with markdown serialization in Editor component
- [x] T022 [US1] Add auto-resize behavior via CSS (no fixed height, natural expansion)
- [x] T023 [US1] Test typing in editor updates block content and triggers onChange$

**Checkpoint**: User Story 1 complete - can type text, see it on screen, editor auto-expands, Enter creates newlines within blocks

---

## Phase 4: User Story 2 - Block Type Conversion (Priority: P2)

**Goal**: Users can convert text blocks between paragraph and header types (H1/H2/H3) to structure content with hierarchy.

**Independent Test**: Type text in a paragraph, use block type selector to convert to header. Success = text displayed with header styling, content preserved.

### Implementation for User Story 2

- [x] T024 [US2] Create BlockTypeSelector component in src/components/editor/block-type-selector.tsx
- [x] T025 [US2] Define block type options array (Paragraph, Heading 1, Heading 2, Heading 3) in BlockTypeSelector
- [x] T026 [US2] Implement convertBlockType handler in Editor component to change block type while preserving content
- [x] T027 [US2] Integrate BlockTypeSelector into Editor component with visibility state management
- [x] T028 [US2] Add keyboard shortcut trigger for BlockTypeSelector (e.g., / or Cmd+K)
- [x] T029 [US2] Implement cursor position preservation during block type conversion
- [x] T030 [US2] Add ARIA labels and keyboard navigation support to BlockTypeSelector
- [x] T031 [US2] Update CSS styles to ensure visual distinction between paragraph and heading types
- [x] T032 [US2] Test block type conversion preserves content and updates visual styling

**Checkpoint**: User Story 2 complete - can convert blocks between types, content preserved, visual hierarchy clear

---

## Phase 5: User Story 3 - Multi-Block Editing (Priority: P3)

**Goal**: Users can work with multiple text blocks of different types, navigate between them, and perform block-level operations (create, merge, delete).

**Independent Test**: Create several blocks of different types, navigate with arrow keys, press Enter at block end to create new block, press Backspace at block start to merge. Success = smooth navigation and independent block behavior.

### Implementation for User Story 3

- [x] T033 [US3] Implement Enter key handler in ParagraphBlock/HeadingBlock to trigger block split
- [x] T034 [US3] Implement insertBlockAfter operation in Editor component
- [x] T035 [US3] Implement focus management to move cursor to newly created block
- [x] T036 [US3] Implement Backspace key handler at block start in ParagraphBlock/HeadingBlock
- [x] T037 [US3] Implement mergeWithPrevious operation in Editor component
- [x] T038 [US3] Implement Delete key handler at block end in ParagraphBlock/HeadingBlock
- [x] T039 [US3] Implement mergeWithNext operation in Editor component
- [x] T040 [US3] Add arrow key navigation handlers (up/down) for moving between blocks
- [x] T041 [US3] Implement cursor position detection helpers (isAtBlockStart, isAtBlockEnd)
- [x] T042 [US3] Implement cursor restoration using useVisibleTask$ and Selection API
- [x] T043 [US3] Add selection state tracking in Editor component (update on selectionchange event)
- [x] T044 [US3] Debounce selectionchange listener to 16ms for performance
- [x] T045 [US3] Test Enter key creates new paragraph block after current block
- [x] T046 [US3] Test Backspace at block start merges with previous block
- [x] T047 [US3] Test arrow keys navigate between blocks seamlessly
- [x] T048 [US3] Test multi-block document maintains independent block behavior

**Checkpoint**: User Story 3 complete - can create, navigate, merge, and delete blocks. All three user stories work independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalize the MVP

- [x] T049 [P] Add JSDoc documentation to Editor component in src/components/editor/editor.tsx
- [x] T050 [P] Add JSDoc documentation to all public type exports in src/models/document.ts
- [x] T051 Update public API exports in src/index.ts (Editor, EditorProps, Block types, VERSION)
- [x] T052 [P] Add usage examples and documentation to README.md at repository root
- [x] T053 [P] Add ARIA attributes to Editor container (role="textbox", aria-multiline, aria-label)
- [x] T054 [P] Verify WCAG AA color contrast in CSS styles using browser DevTools
- [x] T055 Implement onChange$ callback debouncing (300ms) to optimize performance
- [x] T056 Add markdown serialization debouncing to avoid excessive calls
- [x] T057 [P] Test keyboard navigation accessibility (Tab, arrow keys, Enter, Backspace)
- [x] T058 [P] Test editor performance with 100+ blocks (verify <50ms keystroke response)
- [x] T059 [P] Verify editor ready for input within 1 second of page load
- [x] T060 [P] Verify block type conversion occurs under 100ms
- [x] T061 Run final lint check with npm run lint
- [x] T062 Run final format check with npm run fmt.check
- [x] T063 Manual validation against all 12 functional requirements (FR-001 to FR-012)
- [x] T064 Manual validation against all 6 success criteria (SC-001 to SC-006)

**Checkpoint**: MVP complete, accessible, performant, documented, and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Depends on User Story 1 components (Editor, block components)
  - User Story 3 (P3): Depends on User Story 1 components (Editor, block components)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on US1 (needs Editor and block components to exist)
- **User Story 3 (P3)**: Depends on US1 (needs Editor and block components to exist)

**Recommended Order**: Complete in priority order (P1 → P2 → P3) for incremental delivery

### Within Each User Story

- Models before services (Phase 2 Foundational)
- Components before integration
- Core functionality before polish
- Each story independently testable upon completion

### Parallel Opportunities

- **Setup (Phase 1)**: T002, T003, T004 can run in parallel
- **Foundational (Phase 2)**: T007-T011 markdown service functions can be developed in parallel after T005-T006
- **User Story 1 (Phase 3)**: T014, T015 (block components) can run in parallel
- **User Story 2 (Phase 4)**: No parallel tasks (sequential dependencies)
- **User Story 3 (Phase 5)**: T033, T036, T038 (keyboard handlers) can run in parallel
- **Polish (Phase 6)**: T049, T050, T052, T053, T054, T057, T058, T059, T060 can run in parallel after core tasks complete

---

## Parallel Example: User Story 1

```bash
# Launch block components together:
Task: "Create ParagraphBlock component in src/components/editor/paragraph-block.tsx"
Task: "Create HeadingBlock component in src/components/editor/heading-block.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T014-T023)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Can type text? ✓
   - Text appears on screen? ✓
   - Editor auto-expands? ✓
   - Enter creates newlines? ✓
5. Deploy/demo if ready (basic typing works!)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T014-T023) → Test independently → Deploy/Demo (MVP - typing works!)
3. Add User Story 2 (T024-T032) → Test independently → Deploy/Demo (can change block types!)
4. Add User Story 3 (T033-T048) → Test independently → Deploy/Demo (full multi-block editing!)
5. Add Polish (T049-T064) → Final validation → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phase 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T023)
   - After US1 complete, Developer A starts US2 while Developer B starts US3
3. Stories integrate smoothly due to shared foundation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1, US2, US3) for traceability
- Each user story should be independently completable and testable
- Tests are NOT included (not requested in specification)
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story independently
- Phase 2 (Foundational) is CRITICAL - all stories depend on it being complete
- User Story 2 and 3 both depend on User Story 1 components existing
- Recommended: Complete stories in priority order (P1 → P2 → P3) for best incremental delivery

---

## Task Summary

- **Total Tasks**: 64
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 9 tasks
- **User Story 1 (P1)**: 10 tasks
- **User Story 2 (P2)**: 9 tasks
- **User Story 3 (P3)**: 16 tasks
- **Polish Phase**: 16 tasks
- **Parallel Opportunities**: 15 tasks marked [P]

---

## MVP Scope (Recommended First Delivery)

**Phases 1-3 Only** (23 tasks):

- Setup (T001-T004)
- Foundational (T005-T013)
- User Story 1 (T014-T023)

**Delivers**: Working text editor where users can type and see text on screen. Editor auto-expands. Markdown conversion works.

**Time Estimate**: ~8-10 hours for experienced developer

**Value**: Core foundation + immediate usability for basic text entry

---

## Independent Test Criteria

### User Story 1 - Basic Text Entry

- Open editor in browser
- Click in editing area
- Type "Hello World"
- **Expected**: Text appears on screen
- Press Enter multiple times
- **Expected**: New lines created within block
- Type until text exceeds viewport height
- **Expected**: Editor expands automatically

### User Story 2 - Block Type Conversion

- Type "Introduction" in a paragraph block
- Trigger block type selector (keyboard shortcut or UI)
- Select "Heading 1"
- **Expected**: Text displayed as H1 with larger size/weight, content "Introduction" preserved
- Change to "Heading 2"
- **Expected**: Text displayed as H2 with medium size/weight, content preserved
- Change to "Paragraph"
- **Expected**: Text displayed as regular paragraph, content preserved

### User Story 3 - Multi-Block Editing

- Type "Title" in first block, press Enter at end
- **Expected**: New paragraph block created below
- Type "Content" in second block
- Use Up arrow key
- **Expected**: Cursor moves to first block
- Use Down arrow key
- **Expected**: Cursor returns to second block
- Place cursor at start of second block, press Backspace
- **Expected**: Second block merges with first block
- Place cursor at end of first block, press Delete
- **Expected**: First block merges with next block

---

## Format Validation

✅ All tasks follow required format: `- [ ] [ID] [P?] [Story?] Description with file path`

✅ Checklist format used throughout (markdown checkboxes)

✅ Task IDs sequential (T001-T064)

✅ [P] marker included for parallelizable tasks (15 tasks)

✅ [Story] labels included for all user story tasks (US1, US2, US3)

✅ File paths specified for all implementation tasks

✅ Setup phase: No story labels (correct)

✅ Foundational phase: No story labels (correct)

✅ User Story phases: All have story labels (correct)

✅ Polish phase: No story labels (correct)
