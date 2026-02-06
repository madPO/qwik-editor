# Research Report: Basic Text Editor

**Feature**: 001-basic-text-editor  
**Date**: 2026-02-04  
**Phase**: 0 - Outline & Research

## Overview

This document consolidates research findings for technical decisions required to implement the basic text editor feature. All NEEDS CLARIFICATION items from the Technical Context have been resolved through systematic research.

---

## Decision 1: Markdown Parsing Library

### Decision

**Use mdast-util-from-markdown + mdast-util-to-markdown** (unified/remark ecosystem)

### Rationale

The unified ecosystem provides the best balance of features, extensibility, and ecosystem support for bidirectional conversion (markdown ↔ AST). This is the foundation that powers remark and provides a robust, well-typed AST-based approach perfect for building an editor.

**Key Benefits**:

- Full CommonMark compliance (passes all spec tests)
- Bidirectional: parse markdown → AST and serialize AST → markdown
- TypeScript-first with complete type definitions
- Extensible plugin ecosystem for future features
- SSR-safe (pure JavaScript, no DOM dependencies)
- Tree-shakeable ESM modules (~56-60kb min+gzip)

### Alternatives Considered

1. **marked** (~31kb min+gz)
   - Rejected: One-way HTML compiler, lacks native serialization back to markdown
   - Token-based rather than AST-based
   - Good for rendering only, not editing workflows

2. **markdown-it** (~80kb min+gz)
   - Rejected: Primarily HTML renderer, not designed for markdown serialization
   - Would require custom serialization logic
   - Larger bundle size

3. **micromark** (~14kb min+gz)
   - Rejected: Too low-level for direct use
   - Excellent as underlying engine (which it is for unified)
   - Requires mdast-util-from-markdown anyway to get usable AST

4. **simple-markdown**
   - Rejected: Archived/deprecated (moved to Perseus repo)
   - Lacks active maintenance and TypeScript support

### Implementation Notes

**Installation**:

```bash
npm install mdast-util-from-markdown mdast-util-to-markdown micromark
```

**Basic usage**:

```typescript
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import type { Root, Paragraph, Heading } from "mdast";

// Parse markdown to AST
export function parseMarkdown(markdown: string): Root {
  return fromMarkdown(markdown);
}

// Serialize AST back to markdown
export function serializeMarkdown(ast: Root): string {
  return toMarkdown(ast);
}
```

**Qwik integration considerations**:

- Pure JavaScript, works in SSR
- Synchronous API (no async complications)
- Tree-shakeable with Vite
- No framework dependencies

---

## Decision 2: Internal Data Structure

### Decision

**Hybrid JSON Document Model with Signal-Based Blocks**

### Rationale

A custom JSON document model with signal-based reactivity provides the perfect balance for Qwik:

1. **Perfect Qwik Integration**: Each block can be a Qwik signal/store, enabling fine-grained reactivity
2. **Simplicity for MVP**: Much simpler than ProseMirror's schema system
3. **Markdown-First**: Designed specifically for markdown use cases
4. **Lightweight**: No heavy dependencies, full control over data structure
5. **Type-Safe**: Clean TypeScript interfaces

### Schema Definition

```typescript
// Core block types
type BlockType = "paragraph" | "heading";

interface BaseBlock {
  id: string; // Unique block ID (crypto.randomUUID)
  type: BlockType;
}

interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: string;
}

interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3;
  content: string;
}

type Block = ParagraphBlock | HeadingBlock;

// Document structure
interface EditorDocument {
  version: string; // Schema version for migrations
  blocks: Block[];
}

// Selection/Cursor state
interface Selection {
  blockId: string;
  offset: number; // Character offset within block
  isCollapsed: boolean;
  focus?: {
    blockId: string;
    offset: number;
  };
}

// Complete editor state
interface EditorState {
  document: EditorDocument;
  selection: Selection;
}
```

### Alternatives Considered

1. **AST-based (mdast format)**
   - Rejected: Too complex for real-time editing
   - Designed for parsing/transformation, not interactive editing
   - Lacks built-in cursor/selection primitives
   - Better suited as serialization target

2. **ProseMirror document model**
   - Rejected: Heavyweight, steep learning curve
   - Token-based positioning overkill for block-based editing
   - Built for React-like reconciliation, not signals

3. **Draft.js ContentState**
   - Rejected: Deprecated, React-specific
   - ImmutableJS dependency
   - Character-level metadata over-engineered for markdown

### Implementation Notes

**State management with Qwik**:

```typescript
import { useStore } from "@builder.io/qwik";

export const useEditorStore = () => {
  return useStore<EditorState>({
    document: {
      version: "1.0",
      blocks: [{ id: crypto.randomUUID(), type: "paragraph", content: "" }],
    },
    selection: {
      blockId: "",
      offset: 0,
      isCollapsed: true,
    },
  });
};
```

**Block operations** (insert, delete, merge, split, convert type):

- All operations update the store immutably
- Qwik's reactivity automatically updates affected components
- Block IDs provide stable references across transformations

**Markdown serialization**:

- Convert EditorDocument → markdown string using simple mapping
- Parse markdown → EditorDocument using mdast + conversion logic
- Bidirectional conversion maintains WYSIWYG integrity

---

## Decision 3: Cursor/Selection Management

### Decision

**Hybrid Approach (DOM for Editing, Virtual for State)**

### Rationale

This approach balances Qwik compatibility, performance, and browser reliability:

1. **Qwik compatibility**: Virtual state serializes for SSR/resumability
2. **Performance**: Meets <50ms requirement by avoiding full reconciliation
3. **Browser reliability**: Leverages native Selection API during editing
4. **Block transformations**: Virtual positions survive DOM restructuring
5. **Lower complexity**: vs reimplementing all selection behavior

### Implementation Strategy

**Virtual cursor state**:

```typescript
interface CursorPosition {
  blockId: string; // Stable block reference
  offset: number; // Character offset
  isCollapsed: boolean; // Cursor vs selection
  anchorBlockId?: string; // For multi-block selections
  anchorOffset?: number;
}

// Stored in Qwik signal (serializable)
const cursorPosition = useSignal<CursorPosition | null>(null);
```

**During editing**: Read from DOM Selection API

```typescript
const updateCursorFromDOM = $(() => {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  const blockEl = range.startContainer.closest("[data-block-id]");

  cursorPosition.value = {
    blockId: blockEl?.dataset.blockId || "",
    offset: getOffsetInBlock(range.startContainer, range.startOffset),
    isCollapsed: selection.isCollapsed,
  };
});
```

**During transforms**: Update virtual position

```typescript
// Before: save cursor
const savedCursor = cursorPosition.value;

// Transform block
const newBlock = transformBlock(oldBlock, newType);

// After: restore cursor (wait for DOM update)
queueMicrotask(() => {
  restoreCursorPosition({
    ...savedCursor,
    blockId: newBlock.id,
  });
});
```

**Block navigation** (arrow keys):

```typescript
const handleArrowKey = $((e: KeyboardEvent, currentBlockId: string) => {
  if (e.key === "ArrowDown" && isAtBlockEnd()) {
    e.preventDefault();
    focusBlockStart(getNextBlock(currentBlockId).id);
  } else if (e.key === "ArrowUp" && isAtBlockStart()) {
    e.preventDefault();
    focusBlockEnd(getPrevBlock(currentBlockId).id);
  }
  // Browser handles within-block navigation
});
```

### Alternatives Considered

1. **Native Selection/Range API only**
   - Rejected: Cannot be serialized for SSR
   - Loses position during block transforms
   - No stable reference across re-renders

2. **Virtual cursor only**
   - Rejected: Must reimplement all browser selection behaviors
   - High complexity (~3000 LOC)
   - Difficult to handle edge cases

3. **contentEditable with data-\* attributes**
   - Rejected: Attributes don't survive contentEditable mutations
   - Still needs Selection API
   - Doesn't solve serialization problem

### Qwik Integration Notes

**SSR handling**:

- No DOM access during SSR
- Cursor state serialized as JSON
- Only render block structure with IDs

**Reactivity**:

```typescript
useVisibleTask$(() => {
  // Client-only: listen to selectionchange
  const handleSelectionChange = debounce(() => {
    updateCursorFromDOM();
  }, 16); // ~60fps

  document.addEventListener("selectionchange", handleSelectionChange);
  return () => document.removeEventListener("selectionchange", handleSelectionChange);
});
```

**Hydration**:

```typescript
useVisibleTask$(({ track }) => {
  track(() => cursorPosition.value);

  if (cursorPosition.value) {
    requestAnimationFrame(() => {
      restoreCursorPosition(cursorPosition.value!);
    });
  }
});
```

**Performance optimizations**:

- Debounce selectionchange events (16ms = 60fps)
- Use data-block-id for O(1) lookups
- Cache text node positions
- Batch updates with requestAnimationFrame
- Only track when editor focused

---

## Decision 4: CommonMark Subset for MVP

### Decision

**Support core block types only: Paragraphs and Headings (H1-H3)**

### Rationale

These are the most fundamental CommonMark elements and align with feature requirements (FR-002). They establish the foundation for:

- Block-based editing model
- Type conversion mechanism
- Markdown serialization pipeline

### Scope

**Supported**:

- Paragraphs (plain text)
- Headings level 1-3 (`#`, `##`, `###`)
- Line breaks within blocks (Enter key)
- Basic text content (Unicode, emojis, special chars)

**Explicitly deferred** (out of scope per spec):

- Inline formatting (bold, italic, code)
- Lists (ordered/unordered)
- Code blocks
- Links and images
- Blockquotes
- Tables
- Heading levels 4-6

### Edge Cases to Handle

1. **Pasting large text** (10,000+ characters)
   - Strategy: Accept paste, render in single block, monitor performance
   - Fallback: Show warning if >50,000 characters

2. **Empty blocks**
   - Strategy: Allow empty blocks of any type
   - Empty paragraph: default state
   - Empty heading: preserved until type change

3. **Whitespace-only blocks**
   - Strategy: Treat as valid content
   - Preserve whitespace in markdown output

4. **Unsupported markdown syntax**
   - Strategy: Parse as paragraph, preserve raw text
   - Future: Add escape hatch for raw markdown blocks

### Implementation Notes

**Markdown parsing**:

```typescript
import { fromMarkdown } from "mdast-util-from-markdown";

function convertMdastToBlocks(markdown: string): Block[] {
  const tree = fromMarkdown(markdown);

  return tree.children
    .filter((node) => node.type === "paragraph" || node.type === "heading")
    .map((node) => {
      if (node.type === "heading") {
        return {
          id: crypto.randomUUID(),
          type: "heading",
          level: node.depth as 1 | 2 | 3,
          content: extractText(node),
        };
      }
      return {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: extractText(node),
      };
    });
}
```

**Markdown serialization**:

```typescript
function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return "#".repeat(block.level) + " " + block.content;
      }
      return block.content;
    })
    .join("\n\n");
}
```

---

## Summary of Resolved Technical Questions

| Original Question          | Decision                                            | Rationale                                                                                     |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Markdown parsing library   | mdast-util-from-markdown + mdast-util-to-markdown   | Best balance of features, TypeScript support, bidirectional conversion, CommonMark compliance |
| Internal data structure    | Hybrid JSON Document Model with signal-based blocks | Perfect Qwik integration, simple yet extensible, type-safe                                    |
| Cursor management approach | Hybrid (DOM for editing, virtual for state)         | Qwik SSR compatible, performant, leverages browser native behavior                            |
| CommonMark subset          | Paragraphs + Headings (H1-H3)                       | Aligns with FR-002, establishes foundation for future expansion                               |

---

## Next Steps

Proceed to **Phase 1: Design & Contracts** to:

1. Generate detailed data model documentation (data-model.md)
2. Define component API contracts
3. Create quickstart guide
4. Update agent context with technology choices
