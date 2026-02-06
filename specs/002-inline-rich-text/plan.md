# Feature Plan: 002-inline-rich-text

## Goal

Add support for inline rich text formatting (Bold, Italic, Link) within paragraph and heading blocks, ensuring bidirectional synchronization with Markdown.

## Proposed Changes

### 1. Data Model Update

- The `content` field in `ParagraphBlock` and `HeadingBlock` will now store **HTML strings** instead of plain text.
- Update `EditorState` to track `selection` more precisely (anchor/focus paths or offsets).

### 2. Markdown Service Enhancement (`src/services/markdown.ts`)

- **Parser**: Update `convertMdastToBlocks` to recursively process inline children (Strong, Emphasis, Link) and convert them to HTML tags (`<strong>`, `<em>`, `<a>`).
- **Serializer**: Update `blockToMdast` to parse the HTML content back into mdast inline nodes. Use `rehype-parse` and `rehype-remark` for robust conversion.

### 3. Component Updates

- **ParagraphBlock/HeadingBlock**:
  - Change `target.textContent` to `target.innerHTML` in `onInput$`.
  - Use `dangerouslySetInnerHTML` for rendering.
  - Implement a "Floating Toolbar" that appears upon text selection.
- **Editor**:
  - Improve cursor restoration logic to handle nested DOM nodes (e.g., cursor inside a `<strong>` tag).

### 4. Selection Management

- Implement a utility to get and set character offsets across multiple text nodes within a `contentEditable` element.

## Task List

- [ ] Install `rehype-parse`, `rehype-remark`, and `hast-util-to-mdast`.
- [ ] Update `src/services/markdown.ts` to handle inline nodes.
- [ ] Update block components to use `innerHTML`.
- [ ] Implement floating formatting toolbar.
- [ ] Implement keyboard shortcuts (Ctrl+B, Ctrl+I).
- [ ] Fix selection restoration for nested nodes.
- [ ] Verify bidirectional Markdown sync for `**bold**`, `*italic*`, and `[links](url)`.
