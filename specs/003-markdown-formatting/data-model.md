# Data Model: Markdown Formatting

**Branch**: `003-markdown-formatting`

## Block Types

We will extend the `Block` union type to include new formatting elements.

### Updated Union

```typescript
export type BlockType = 
  | "paragraph" 
  | "heading" 
  | "list-item" 
  | "blockquote" 
  | "code-block" 
  | "horizontal-rule";

export type Block = 
  | ParagraphBlock 
  | HeadingBlock 
  | ListItemBlock 
  | BlockquoteBlock 
  | CodeBlockBlock 
  | HorizontalRuleBlock;
```

### New Block Definitions

#### List Item

Represents a single item in a list. Note: We use a flat structure. Adjacent `list-item` blocks of the same `format` are rendered as a single list.

```typescript
export interface ListItemBlock extends BaseBlock {
  type: "list-item";
  content: string;
  /** The type of list this item belongs to */
  format: "ordered" | "unordered";
  /** Nesting level (future support, default 0) */
  indent?: number; 
}
```

#### Blockquote

Represents a quote block.

```typescript
export interface BlockquoteBlock extends BaseBlock {
  type: "blockquote";
  content: string;
}
```

#### Code Block

Represents a fenced code block.

```typescript
export interface CodeBlockBlock extends BaseBlock {
  type: "code-block";
  content: string; // The code content
  language?: string; // e.g., "typescript", "json"
}
```

#### Horizontal Rule

Represents a thematic break.

```typescript
export interface HorizontalRuleBlock extends BaseBlock {
  type: "horizontal-rule";
  content: ""; // Void block, no content
}
```

## Inline Entities

Inline styling (bold, italic, strikethrough, code, link) is stored within the `content` string as HTML.

- **Strikethrough**: `<del>text</del>`
- **Inline Code**: `<code>text</code>`
- **Link**: `<a href="url">text</a>`

## Serialization Strategy

### Flat-to-Tree (Export)

When converting `blocks` to Markdown:
1. Iterate through blocks.
2. Group adjacent `list-item` blocks into a `list` node (mdast).
3. Convert `blockquote` blocks to `blockquote` nodes.
4. Convert `code-block` to `code` nodes.
5. Use `hast-util-from-html` to parse inline HTML content to mdast phrasing nodes.

### Tree-to-Flat (Import)

When converting Markdown to `blocks`:
1. Flatten `list` nodes: Create a `list-item` block for each child.
2. Flatten `blockquote` nodes: Create a `blockquote` block for each child paragraph? 
   - *Constraint*: Our editor supports one block type per line. 
   - *Decision*: A `blockquote` in markdown can contain multiple paragraphs. In our model, we might need to simplify or allow `BlockquoteBlock` to be just a paragraph with a "quote" styling? 
   - *Refined Decision*: To allow standard behavior, `blockquote` is a block type. If a user has multiple paragraphs in a quote, they are multiple `blockquote` blocks. (Common approach in simple editors).
3. `code` nodes become `code-block`.

## State Changes

No changes to `EditorState` or `Selection` interfaces.
