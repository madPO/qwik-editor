# Component API: Markdown Formatting

**Branch**: `003-markdown-formatting`

## Editor Component

The `Editor` component interface remains compatible, but the `content` prop now accepts expanded block types.

### Props

```typescript
export interface EditorProps {
  /** 
   * Initial content blocks to load.
   * Now supports: 'paragraph', 'heading', 'list-item', 'blockquote', 'code-block', 'horizontal-rule'.
   */
  content?: Block[];
  
  /** 
   * Callback fired when the document content changes.
   * Emits the updated array of blocks including new types.
   */
  onContentChange$?: PropFunction<(blocks: Block[]) => void>;
}
```

## Internal Hooks (Feature Interface)

### `useInputRules`

New hook for handling markdown shortcuts.

```typescript
export function useInputRules(
  handleBlockUpdate: (id: string, content: string, ...) => void,
  convertBlockType: (id: string, type: BlockType, ...) => void
) {
  // Returns nothing, purely effect-based or provides a handler wrapper
  return {
    processInput: (blockId: string, content: string) => boolean // handled?
  };
}
```

### `useFormatting`

Extended interface for new formats.

```typescript
interface UseFormattingReturn {
  applyFormat: (format: 'bold' | 'italic' | 'strike' | 'code' | 'link', value?: string) => void;
}
```
