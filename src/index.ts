// Public component exports
export { Editor } from "./widgets/editor/ui/editor";
export type { EditorProps } from "./widgets/editor/ui/editor";

// Public type exports
export type {
  Block,
  BlockType,
  ParagraphBlock,
  HeadingBlock,
  EditorDocument,
  Selection,
  EditorState,
} from "./entities/document/model/document";

/** Current library version */
export const VERSION = "0.0.1";
