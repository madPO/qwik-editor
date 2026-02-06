# Tasks: 002-inline-rich-text

## Phase 1: Infrastructure & Dependencies

- [x] Install dependencies: `rehype-parse`, `rehype-remark`, `remark-rehype`, `hast-util-to-mdast`, `hast-util-from-html`.
- [x] Research/Test the conversion pipeline: `Markdown AST -> HTML -> Markdown AST`.

## Phase 2: Markdown Service Update

- [x] Update `src/services/markdown.ts` to support nested nodes in blocks.
- [x] Implement `htmlToMdast` helper.
- [x] Implement `mdastToHtml` helper.

## Phase 3: Selection & Components

- [x] Refactor `ParagraphBlock` and `HeadingBlock` to use `dangerouslySetInnerHTML`.
- [x] Implement robust selection restoration utility in `src/utils/selection.ts`.
- [x] Update `Editor` to use the new selection utility.

## Phase 4: Formatting UI

- [x] Create `FloatingToolbar` component.
- [x] Implement Bold (Ctrl+B) and Italic (Ctrl+I) commands.
- [x] Implement Link dialog/command.

## Phase 5: Verification

- [x] Test bidirectional sync with complex blocks: `**bold** and *italic* and [link](url)`.
- [x] Ensure Enter/Backspace still works correctly with nested nodes.
