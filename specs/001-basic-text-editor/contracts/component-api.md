# Component API Contracts

**Feature**: 001-basic-text-editor  
**Date**: 2026-02-04  
**Format**: TypeScript Component Interfaces

This document defines the public API contracts for all components in the basic text editor feature. These contracts are based on the functional requirements and follow Qwik component best practices.

---

## 1. Editor Component

**File**: `src/components/editor/editor.tsx`

**Purpose**: Root component that orchestrates the entire editing experience. Manages document state, selection, and user interactions.

### Props Interface

```typescript
export interface EditorProps {
  /**
   * Initial markdown content to load into the editor.
   * If not provided, editor starts with an empty paragraph.
   * @default ""
   */
  initialMarkdown?: string;

  /**
   * Callback fired when the document content changes.
   * Receives the updated markdown string.
   * Debounced to avoid excessive calls during typing.
   */
  onChange$?: PropFunction<(markdown: string) => void>;

  /**
   * Callback fired when editor gains focus.
   */
  onFocus$?: PropFunction<() => void>;

  /**
   * Callback fired when editor loses focus.
   */
  onBlur$?: PropFunction<() => void>;

  /**
   * CSS class name to apply to the editor container.
   */
  class?: string;

  /**
   * Whether the editor should auto-focus on mount.
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Placeholder text shown when editor is empty.
   * @default "Start typing..."
   */
  placeholder?: string;
}
```

### Public API

````typescript
/**
 * Root editor component for WYSIWYG markdown editing.
 *
 * @example
 * ```tsx
 * <Editor
 *   initialMarkdown="# Hello\n\nWorld"
 *   onChange$={(md) => console.log(md)}
 *   placeholder="Write something..."
 * />
 * ```
 */
export const Editor: Component<EditorProps>;
````

### Events Emitted

| Event       | Payload             | Description              | Frequency                          |
| ----------- | ------------------- | ------------------------ | ---------------------------------- |
| `onChange$` | `string` (markdown) | Document content changed | Debounced 300ms after typing stops |
| `onFocus$`  | `void`              | Editor received focus    | Once per focus                     |
| `onBlur$`   | `void`              | Editor lost focus        | Once per blur                      |

### State Management

The component internally manages:

- `EditorState` (document + selection)
- Cursor position restoration
- Block operations (insert, delete, merge, convert)

**Does NOT expose state externally** - component is controlled only via `initialMarkdown` prop.

### Accessibility

- **Role**: `textbox` with `multiline` attribute
- **Keyboard Navigation**: Full support for arrow keys, Enter, Backspace
- **Focus Management**: Maintains focus within editor, restores cursor position
- **ARIA Labels**: `aria-label="Markdown editor"` (customizable via prop in future)

### Performance Guarantees

- Initial render: <1 second (SC-001)
- Keystroke response: <50ms (SC-003)
- Supports 100+ blocks without degradation (SC-003)

---

## 2. Block Component

**File**: `src/components/editor/block.tsx`

**Purpose**: Renders a single content block. Handles user input and block-level operations.

### Props Interface

```typescript
export interface BlockProps {
  /**
   * The block data to render.
   */
  block: Block;

  /**
   * Whether this block currently has the cursor/selection.
   */
  isSelected: boolean;

  /**
   * Callback when block content changes.
   */
  onContentChange$: PropFunction<(blockId: string, newContent: string) => void>;

  /**
   * Callback when user presses Enter in this block.
   */
  onEnter$: PropFunction<(blockId: string, offset: number) => void>;

  /**
   * Callback when user presses Backspace at start of block.
   */
  onBackspaceAtStart$: PropFunction<(blockId: string) => void>;

  /**
   * Callback when user presses Delete at end of block.
   */
  onDeleteAtEnd$: PropFunction<(blockId: string) => void>;

  /**
   * Callback when user navigates out of block with arrow keys.
   */
  onNavigate$: PropFunction<(direction: "up" | "down", blockId: string) => void>;

  /**
   * Callback when this block gains focus.
   */
  onFocus$: PropFunction<(blockId: string) => void>;
}
```

### Public API

```typescript
/**
 * Renders a single editable content block.
 * Internal component - not exported from library public API.
 *
 * @internal
 */
export const Block: Component<BlockProps>;
```

### Block-Specific Rendering

The component delegates to specialized renderers based on `block.type`:

- `type === 'paragraph'` → `<ParagraphBlock>`
- `type === 'heading'` → `<HeadingBlock>`

### Keyboard Handlers

| Key         | Condition                | Action                       |
| ----------- | ------------------------ | ---------------------------- |
| `Enter`     | Any position             | Split block, call `onEnter$` |
| `Backspace` | Cursor at offset 0       | Call `onBackspaceAtStart$`   |
| `Delete`    | Cursor at end of content | Call `onDeleteAtEnd$`        |
| `ArrowUp`   | Cursor at first line     | Call `onNavigate$('up')`     |
| `ArrowDown` | Cursor at last line      | Call `onNavigate$('down')`   |

---

## 3. ParagraphBlock Component

**File**: `src/components/editor/paragraph-block.tsx`

**Purpose**: Renders a paragraph block with contentEditable.

### Props Interface

```typescript
export interface ParagraphBlockProps {
  /**
   * The paragraph block data.
   */
  block: ParagraphBlock;

  /**
   * Whether this block is currently selected.
   */
  isSelected: boolean;

  /**
   * Callback when content changes.
   */
  onInput$: PropFunction<(newContent: string) => void>;

  /**
   * Reference to the contentEditable element (for cursor control).
   */
  ref?: Signal<HTMLElement | undefined>;
}
```

### Public API

```typescript
/**
 * Renders a paragraph block as a contentEditable <p> element.
 * Internal component - not exported from library public API.
 *
 * @internal
 */
export const ParagraphBlock: Component<ParagraphBlockProps>;
```

### Rendered Output

```html
<p
  data-block-id="{block.id}"
  data-block-type="paragraph"
  contenteditable="true"
  class="editor-paragraph"
>
  {block.content}
</p>
```

---

## 4. HeadingBlock Component

**File**: `src/components/editor/heading-block.tsx`

**Purpose**: Renders a heading block (H1, H2, or H3).

### Props Interface

```typescript
export interface HeadingBlockProps {
  /**
   * The heading block data.
   */
  block: HeadingBlock;

  /**
   * Whether this block is currently selected.
   */
  isSelected: boolean;

  /**
   * Callback when content changes.
   */
  onInput$: PropFunction<(newContent: string) => void>;

  /**
   * Reference to the contentEditable element (for cursor control).
   */
  ref?: Signal<HTMLElement | undefined>;
}
```

### Public API

```typescript
/**
 * Renders a heading block as a contentEditable <h1>, <h2>, or <h3> element.
 * Internal component - not exported from library public API.
 *
 * @internal
 */
export const HeadingBlock: Component<HeadingBlockProps>;
```

### Rendered Output

```html
<!-- For level 1 -->
<h1
  data-block-id="{block.id}"
  data-block-type="heading"
  data-heading-level="1"
  contenteditable="true"
  class="editor-heading editor-heading-1"
>
  {block.content}
</h1>

<!-- For level 2 -->
<h2 ... class="editor-heading editor-heading-2" ...>
  <!-- For level 3 -->
  <h3 ... class="editor-heading editor-heading-3" ...></h3>
</h2>
```

---

## 5. BlockTypeSelector Component

**File**: `src/components/editor/block-type-selector.tsx`

**Purpose**: UI control for changing the type of the currently selected block.

### Props Interface

```typescript
export interface BlockTypeSelectorProps {
  /**
   * The currently selected block.
   */
  currentBlock: Block | null;

  /**
   * Callback when user selects a new block type.
   */
  onTypeChange$: PropFunction<(newType: BlockType, level?: 1 | 2 | 3) => void>;

  /**
   * Whether the selector is currently visible.
   */
  visible: boolean;

  /**
   * Position for the selector (relative to cursor/block).
   */
  position?: { top: number; left: number };
}
```

### Public API

```typescript
/**
 * Dropdown/menu for selecting block type.
 * Internal component - not exported from library public API.
 *
 * @internal
 */
export const BlockTypeSelector: Component<BlockTypeSelectorProps>;
```

### Available Options

```typescript
type BlockTypeOption = {
  type: BlockType;
  level?: 1 | 2 | 3;
  label: string;
  icon?: string; // Future: icon name
};

const OPTIONS: BlockTypeOption[] = [
  { type: "paragraph", label: "Paragraph" },
  { type: "heading", level: 1, label: "Heading 1" },
  { type: "heading", level: 2, label: "Heading 2" },
  { type: "heading", level: 3, label: "Heading 3" },
];
```

### Interaction

- **Trigger**: Keyboard shortcut (e.g., `/` or `Cmd+K`) or toolbar button (future)
- **Navigation**: Arrow keys to move between options
- **Selection**: Enter key or click to select
- **Cancel**: Escape key or click outside

### Accessibility

- **Role**: `menu` with `menuitem` children
- **ARIA**: `aria-label="Change block type"`
- **Keyboard**: Full keyboard navigation support

---

## Type Definitions

**File**: `src/components/editor/types.ts`

All shared types used across components:

```typescript
// Re-exported from data model
export type {
  Block,
  BlockType,
  ParagraphBlock,
  HeadingBlock,
  EditorDocument,
  Selection,
  EditorState,
} from "../../models/document";

// Component-specific types
export type NavigationDirection = "up" | "down" | "left" | "right";

export interface BlockPosition {
  blockId: string;
  offset: number;
}

export interface BlockRange {
  start: BlockPosition;
  end: BlockPosition;
}
```

---

## Public Library API

**File**: `src/index.ts`

Only the root Editor component and types are exported from the library:

```typescript
// Public component exports
export { Editor } from "./components/editor/editor";
export type { EditorProps } from "./components/editor/editor";

// Public type exports
export type {
  Block,
  BlockType,
  ParagraphBlock,
  HeadingBlock,
  EditorDocument,
  EditorState,
} from "./models/document";

// Version
export const VERSION = "0.0.1";
```

**Internal components NOT exported**:

- `Block`
- `ParagraphBlock`
- `HeadingBlock`
- `BlockTypeSelector`

---

## Contract Validation

### Functional Requirements Mapping

| FR     | Contract Coverage                                                 |
| ------ | ----------------------------------------------------------------- |
| FR-001 | `Editor` component renders editable area on load                  |
| FR-002 | `BlockType` supports paragraph + heading (1-3)                    |
| FR-003 | `Block.content` has no character limit                            |
| FR-004 | `Editor` auto-expands via CSS (no artificial height)              |
| FR-005 | `onTypeChange$` preserves content during conversion               |
| FR-006 | `BlockTypeSelector` provides UI control                           |
| FR-007 | `HeadingBlock` renders H1/H2/H3 with distinct styling             |
| FR-008 | `onEnter$` callback handles block creation                        |
| FR-009 | `onNavigate$` + focus management handle navigation                |
| FR-010 | `onBackspaceAtStart$` + `onDeleteAtEnd$` handle merging           |
| FR-011 | `Editor` initializes with empty paragraph if no `initialMarkdown` |
| FR-012 | `Editor` container auto-resizes via flexbox/grid                  |

### Success Criteria Validation

| SC     | Measurable via Contract                        |
| ------ | ---------------------------------------------- |
| SC-001 | Component mount time <1s (testable)            |
| SC-002 | `onTypeChange$` triggers <100ms (testable)     |
| SC-003 | `Editor` handles 100+ blocks (stress testable) |
| SC-004 | `BlockTypeSelector` usability (user testable)  |
| SC-005 | CSS auto-resize <200ms (observable)            |
| SC-006 | Input event handling <50ms (testable)          |

---

## Versioning

**Current Version**: 0.0.1 (MVP)

**Breaking Change Policy**:

- Changes to `EditorProps` that remove props = MAJOR version bump
- Changes to public type exports = MAJOR version bump
- Internal component API changes (Block, ParagraphBlock, etc.) = no version bump (not public API)

**Deprecation Process**:

1. Mark prop as deprecated in JSDoc with `@deprecated` tag
2. Maintain backward compatibility for 1 MINOR version
3. Remove in next MAJOR version
