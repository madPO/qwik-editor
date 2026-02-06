# Data Model: Basic Text Editor

**Feature**: 001-basic-text-editor  
**Date**: 2026-02-04  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data structures and their relationships for the basic text editor feature. The model follows a block-based approach where content is organized as a sequence of typed blocks (paragraphs and headings).

---

## Core Entities

### 1. Block

**Description**: A single unit of content with a specific type. Blocks are the fundamental building blocks of the editor document.

**TypeScript Definition**:

```typescript
type BlockType = "paragraph" | "heading";

interface BaseBlock {
  id: string; // Unique identifier (UUID)
  type: BlockType;
}

interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: string; // Plain text content
}

interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3; // Heading level (H1, H2, H3)
  content: string; // Plain text content
}

type Block = ParagraphBlock | HeadingBlock;
```

**Attributes**:

- `id` (string, required): Unique identifier for the block. Generated using `crypto.randomUUID()`. Provides stable reference across re-renders and transformations.
- `type` (BlockType, required): Discriminant field identifying the block type. Used for TypeScript type narrowing.
- `content` (string, required): The text content of the block. Plain text only (no inline formatting in MVP).
- `level` (1 | 2 | 3, required for heading): Semantic heading level corresponding to markdown # (H1), ## (H2), ### (H3).

**Validation Rules**:

- `id` must be unique within the document
- `content` has no artificial character limit (per FR-003)
- `level` must be 1, 2, or 3 for heading blocks
- `type` must be one of the defined BlockType values

**State Transitions**:

```
Created (initial state)
  ↓
Active (being edited)
  ↓
Modified (content changed)
  ↓
Converted (type changed)
  ↓
Merged (combined with adjacent block)
  OR
Deleted (removed from document)
```

**Relationships**:

- A Block belongs to exactly one EditorDocument
- A Block can be referenced by exactly one Selection
- Blocks are ordered sequentially within the document

---

### 2. EditorDocument

**Description**: The complete collection of content blocks in sequential order. Represents the entire state of the document being edited.

**TypeScript Definition**:

```typescript
interface EditorDocument {
  version: string; // Schema version for future migrations
  blocks: Block[]; // Ordered array of blocks
}
```

**Attributes**:

- `version` (string, required): Schema version identifier (currently "1.0"). Enables future data migrations if block structure changes.
- `blocks` (Block[], required): Ordered array of blocks. Index determines visual position. Empty array is valid (represents blank document).

**Validation Rules**:

- `blocks` array can be empty (will auto-create paragraph on user input per FR-011)
- Each block within `blocks` must have unique `id`
- `blocks` array is append-only from user perspective (blocks added at end or inserted at cursor)
- Minimum zero blocks, no maximum (performance tested to 100+ blocks per SC-003)

**State Transitions**:

```
Empty Document (blocks: [])
  ↓
Populated Document (blocks: [block1, ...])
  ↓
Modified (blocks added/removed/reordered)
  ↓
Serialized to Markdown (for persistence/export)
```

**Relationships**:

- An EditorDocument contains zero or more Blocks
- An EditorDocument is managed by exactly one EditorState
- An EditorDocument can be serialized to/from markdown string

**Operations**:

- `insertBlock(afterId: string, block: Block)`: Insert new block after specified block
- `deleteBlock(id: string)`: Remove block from document
- `updateBlock(id: string, updates: Partial<Block>)`: Modify block properties
- `moveBlock(id: string, newIndex: number)`: Reorder blocks (future enhancement)

---

### 3. Selection

**Description**: Represents the user's cursor position or text selection within the document. Tracks position using block ID and character offset.

**TypeScript Definition**:

```typescript
interface Selection {
  blockId: string; // ID of the block containing cursor/selection anchor
  offset: number; // Character offset within the block's content
  isCollapsed: boolean; // true = cursor, false = selection
  focus?: {
    // Present only for non-collapsed selections
    blockId: string; // ID of block containing selection focus
    offset: number; // Character offset of focus point
  };
}
```

**Attributes**:

- `blockId` (string, required): References the block containing the anchor point of the selection
- `offset` (number, required): Zero-based character index within the block's content. Range: [0, content.length]
- `isCollapsed` (boolean, required): `true` indicates a cursor (zero-width selection), `false` indicates a range selection
- `focus` (object, optional): Present only when `isCollapsed` is `false`. Defines the selection endpoint.
  - `focus.blockId`: Block containing the focus point (may differ from anchor block for multi-block selections)
  - `focus.offset`: Character offset of focus point

**Validation Rules**:

- `blockId` must reference an existing block in the document
- `offset` must be within range [0, block.content.length]
- If `isCollapsed` is `true`, `focus` must be `undefined`
- If `isCollapsed` is `false`, `focus` must be defined
- `focus.blockId` must reference an existing block
- `focus.offset` must be within range [0, block.content.length]

**State Transitions**:

```
No Selection (null)
  ↓
Collapsed Selection (cursor)
  ↓
Expanded Selection (range)
  ↓
Collapsed (selection collapsed to cursor)
  OR
Updated (position changed)
  OR
Cleared (null)
```

**Relationships**:

- A Selection references one Block (anchor) or two Blocks (anchor + focus)
- A Selection is owned by exactly one EditorState
- Selection position is preserved across block transformations (per Constitution III)

**Operations**:

- `collapse(toStart: boolean)`: Collapse selection to anchor or focus
- `extend(blockId: string, offset: number)`: Extend selection to new focus point
- `move(blockId: string, offset: number)`: Move cursor to new position
- `selectBlock(blockId: string)`: Select entire block content

---

### 4. EditorState

**Description**: The complete state of the editor including document content and cursor position. This is the root state object managed by Qwik store.

**TypeScript Definition**:

```typescript
interface EditorState {
  document: EditorDocument;
  selection: Selection | null;
}
```

**Attributes**:

- `document` (EditorDocument, required): The content being edited
- `selection` (Selection | null, required): Current cursor/selection state. `null` when editor is not focused.

**Validation Rules**:

- `document` must always be present (cannot be null/undefined)
- `selection` can be `null` (editor unfocused)
- If `selection` is non-null, referenced blocks must exist in `document.blocks`

**State Transitions**:

```
Initial State (empty document, no selection)
  ↓
Focused (selection present)
  ↓
Editing (document and/or selection changing)
  ↓
Blurred (selection null)
  ↓
Serialized (converted to markdown)
```

**Relationships**:

- EditorState contains exactly one EditorDocument
- EditorState contains zero or one Selection
- EditorState is serializable for Qwik SSR/resumability

**Lifecycle**:

1. **Initialization**: Created with empty document or loaded from markdown
2. **User Interaction**: Updated in response to keyboard/mouse events
3. **Serialization**: Converted to markdown for persistence
4. **Hydration**: Restored from serialized state (Qwik resumability)

---

## Data Flow

### Markdown to EditorState

```
Markdown String
  ↓ (parse with mdast-util-from-markdown)
mdast AST
  ↓ (convert to blocks)
Block[]
  ↓ (create document)
EditorDocument
  ↓ (initialize state)
EditorState
```

### EditorState to Markdown

```
EditorState
  ↓ (extract document)
EditorDocument
  ↓ (extract blocks)
Block[]
  ↓ (serialize each block)
Markdown fragments
  ↓ (join with newlines)
Markdown String
```

### User Input to State Update

```
Keyboard/Mouse Event
  ↓ (handle in component)
Block operation (insert/delete/update)
  ↓ (update document.blocks)
EditorDocument updated
  ↓ (Qwik reactivity)
Component re-renders
  ↓ (restore cursor)
Selection updated
```

---

## Serialization Format

### Block Serialization

**Paragraph Block**:

```typescript
// Block object
{ id: "uuid", type: "paragraph", content: "Hello world" }

// Markdown output
"Hello world\n"
```

**Heading Block**:

```typescript
// Block object
{ id: "uuid", type: "heading", level: 1, content: "Title" }

// Markdown output
"# Title\n"

{ id: "uuid", type: "heading", level: 2, content: "Subtitle" }
// → "## Subtitle\n"

{ id: "uuid", type: "heading", level: 3, content: "Section" }
// → "### Section\n"
```

### Document Serialization

```typescript
// EditorDocument
{
  version: "1.0",
  blocks: [
    { id: "1", type: "heading", level: 1, content: "Introduction" },
    { id: "2", type: "paragraph", content: "This is the first paragraph." },
    { id: "3", type: "paragraph", content: "This is the second paragraph." }
  ]
}

// Markdown output
`# Introduction

This is the first paragraph.

This is the second paragraph.
`
```

**Serialization Rules**:

- Blocks separated by double newline (`\n\n`)
- Trailing newline after document
- Empty blocks serialize as single newline
- Heading prefix (`#`) followed by space before content
- Character escaping handled by mdast-util-to-markdown

---

## Performance Considerations

### Memory Usage

- **Block overhead**: ~100-200 bytes per block (object + string)
- **100 blocks estimate**: ~10-20 KB
- **1000 blocks estimate**: ~100-200 KB
- Well within browser memory limits

### Update Performance

- **Block insertion**: O(n) array operation - acceptable for <1000 blocks
- **Block deletion**: O(n) array operation - acceptable for <1000 blocks
- **Block update**: O(1) direct assignment - optimal
- **Serialization**: O(n) iteration - debounce to avoid frequent calls

### Reactivity Optimization

- Qwik signals track individual block changes
- Only modified blocks trigger re-render
- Selection updates separate from document updates
- Cursor restoration debounced to 16ms (60fps)

---

## Future Extensions

This data model is designed to be extensible for future features:

### Inline Formatting (Post-MVP)

```typescript
interface Mark {
  type: "bold" | "italic" | "code" | "link";
  start: number;
  end: number;
  attrs?: Record<string, any>;
}

// Add to blocks
interface ParagraphBlock {
  // ...existing fields
  marks?: Mark[];
}
```

### Nested Blocks (Lists, Blockquotes)

```typescript
interface ListBlock extends BaseBlock {
  type: "list";
  ordered: boolean;
  children: ListItemBlock[];
}
```

### History/Undo (Out of MVP scope)

```typescript
interface EditorState {
  // ...existing fields
  history: {
    undo: EditorDocument[];
    redo: EditorDocument[];
  };
}
```

### Metadata

```typescript
interface EditorDocument {
  // ...existing fields
  metadata?: {
    title?: string;
    createdAt?: string;
    modifiedAt?: string;
  };
}
```

---

## Validation Summary

All entities support the functional requirements:

- **FR-001**: EditorState initializes with empty document, ready for input
- **FR-002**: BlockType supports paragraph, heading (1-3)
- **FR-003**: Block.content has no character limit
- **FR-004**: Document.blocks array grows automatically
- **FR-005**: Block type conversion preserves content
- **FR-006**: Block type is explicit, changeable property
- **FR-007**: HeadingBlock.level distinguishes H1/H2/H3
- **FR-008**: Document operations support block insertion
- **FR-009**: Selection tracks position across blocks
- **FR-010**: Document operations support block deletion/merging
- **FR-011**: Empty document auto-creates paragraph block
- **FR-012**: Document.blocks array is unbounded

All success criteria are measurable with this model:

- **SC-001**: State initialization time trackable
- **SC-002**: Block type conversion is simple property update
- **SC-003**: 100+ blocks validated through array performance
- **SC-004**: Block type change is single property update
- **SC-005**: Document updates trigger Qwik reactivity
- **SC-006**: Block content updates are O(1) operations
