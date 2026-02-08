# Research: Markdown Formatting Support

**Status**: Complete
**Branch**: `003-markdown-formatting`

## 1. GFM Support for Strikethrough

**Decision**: Install `mdast-util-gfm` and `micromark-extension-gfm`.
**Rationale**: `mdast-util-from-markdown` strictly follows CommonMark. Strikethrough (del) is a GFM extension. We need these packages to parse `~~strike~~` correctly into the AST.
**Alternatives**: Custom parser (rejected: too complex/fragile).

## 2. Input Rules Implementation

**Decision**: Implement `useInputRules` hook hooked into `handleBlockUpdate`.
**Rationale**: When text changes, check for patterns (e.g., `* ` at start). If matched:
1. Convert block type (Paragraph -> ListItem).
2. Remove the trigger characters.
3. Update selection to start of content.
**Mechanism**: Regex matching on the leading text of the block.

## 3. Inline Styling in Block Model

**Decision**: Extend `useFormatting` to support 'strikethrough', 'code', 'link'.
**Mechanism**:
- **Strikethrough/Code**: Same as Bold/Italic (toggle).
- **Link**: Requires a new UI flow (prompt or inline popover). For MVP (as per spec FR-003), we will implement a basic prompt or extension of the FloatingToolbar.
- **Parsing**: `mdast-util-to-hast` will handle the HTML generation.

## 4. Selection Restoration

**Decision**: Enhance existing `useVisibleTask$` selection logic.
**Observation**: The current implementation in `Editor` already attempts to restore selection using `requestAnimationFrame`. We need to ensure that when a block type changes (e.g., Paragraph -> Heading), the selection is correctly placed in the *new* block element.
**Risk**: Component remounting might lose focus.
**Mitigation**: Ensure keys are stable or predictable during type conversion.

## 5. List Handling

**Decision**: Lists are complex (nested blocks).
**MVP Approach**:
- Support `ListItemBlock` which renders `<li>...</li>` inside a wrapper?
- **Correction**: The editor is "Block-Based". Usually, each list item is a block.
- We need a `ListNode` or `ListBlock` wrapper?
- **Simplification**:
  - `ListItemBlock` type.
  - Render as `<ul><li><Content/></li></ul>`? No, that breaks structure.
  - **Flat List Items**: Each block is `type: 'list-item'`.
  - **Visuals**: CSS handles the bullets.
  - **Markdown Export**: Serializer groups adjacent `list-item` blocks into a single `List` node.
  - **Rationale**: Keeps the editor model flat and simple.

## 6. Blockquotes and Code Blocks

**Decision**:
- **Blockquote**: New block type `blockquote`. Render as `<blockquote><p>content</p></blockquote>` or just `<blockquote>content</blockquote>`.
- **Code Block**: New block type `code-block`. Render as `<pre><code>content</code></pre>`.
- **Note**: Code blocks are usually plain text, not rich text. We must disable inline formatting inside code blocks.
