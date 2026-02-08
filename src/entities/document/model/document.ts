/**
 * Core block types supported by the editor.
 */
export type BlockType =
  | "paragraph"
  | "heading"
  | "list-item"
  | "blockquote"
  | "code-block"
  | "horizontal-rule";

/**
 * Base interface for all content blocks.
 */
export interface BaseBlock {
  /** Unique identifier for the block */
  id: string;
  /** The type of the block */
  type: BlockType;
  /** Nesting level in blockquotes (0 = not in blockquote) */
  quoteLevel?: number;
}

/**
 * Represents a standard text paragraph.
 */
export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  /** The plain text content of the paragraph */
  content: string;
}

/**
 * Represents a heading level 1, 2, or 3.
 */
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  /** The heading level (1-3) */
  level: 1 | 2 | 3;
  /** The plain text content of the heading */
  content: string;
}

/**
 * Represents an item in a list.
 */
export interface ListItemBlock extends BaseBlock {
  type: "list-item";
  /** Whether the list is ordered or unordered */
  format: "ordered" | "unordered";
  /** Nesting level (0 = root) */
  indent?: number;
  /** The content of the list item (HTML) */
  content: string;
}

/**
 * Represents a blockquote.
 */
export interface BlockquoteBlock extends BaseBlock {
  type: "blockquote";
  /** The content of the blockquote (HTML) */
  content: string;
}

/**
 * Represents a fenced code block.
 */
export interface CodeBlockBlock extends BaseBlock {
  type: "code-block";
  /** Programming language for syntax highlighting (optional) */
  language?: string;
  /** The raw code content */
  content: string;
}

/**
 * Represents a horizontal rule (thematic break).
 */
export interface HorizontalRuleBlock extends BaseBlock {
  type: "horizontal-rule";
  /** Always empty for HR, but included for consistency in Block union */
  content: "";
}

/**
 * Union type representing any valid content block.
 */
export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListItemBlock
  | BlockquoteBlock
  | CodeBlockBlock
  | HorizontalRuleBlock;

/**
 * Represents the complete collection of content blocks in sequential order.
 */
export interface EditorDocument {
  /** Schema version for future migrations */
  version: string;
  /** Ordered array of blocks */
  blocks: Block[];
}

/**
 * Represents the user's cursor position or text selection within the document.
 */
export interface Selection {
  /** ID of the block containing selection anchor */
  blockId: string;
  /** Character offset within the block's content */
  anchorOffset: number;
  /** Character offset of focus point */
  focusOffset: number;
  /** true = cursor, false = selection range */
  isCollapsed: boolean;
}

/**
 * Represents a snapshot of the document and selection for undo/redo.
 */
export interface HistorySnapshot {
  document: EditorDocument;
  selection: Selection | null;
}

/**
 * State for managing undo/redo history.
 */
export interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

/**
 * The complete state of the editor including document content, cursor position, and history.
 */
export interface EditorState {
  /** The content being edited */
  document: EditorDocument;
  /** Current cursor/selection state. null when editor is not focused. */
  selection: Selection | null;
  /** Undo/redo history */
  history: HistoryState;
}
