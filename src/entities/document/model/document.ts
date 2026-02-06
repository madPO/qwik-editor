/**
 * Core block types supported by the editor.
 */
export type BlockType = "paragraph" | "heading";

/**
 * Base interface for all content blocks.
 */
export interface BaseBlock {
  /** Unique identifier for the block */
  id: string;
  /** The type of the block */
  type: BlockType;
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
 * Union type representing any valid content block.
 */
export type Block = ParagraphBlock | HeadingBlock;

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
