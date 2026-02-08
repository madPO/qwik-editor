import { $, type Signal, type PropFunction, type QRL } from "@builder.io/qwik";
import type { EditorState, Block, BlockType } from "../../../../entities/document/model/document";

/**
 * Hook to manage block-level operations (CRUD, split, merge, navigate).
 */
export function useBlockOperations(
  state: EditorState,
  onContentChange$: PropFunction<(blocks: Block[]) => void> | undefined,
  debounceTimer: Signal<ReturnType<typeof setTimeout> | null>,
  DEBOUNCE_MS: number,
  takeSnapshot$: QRL<() => void>
) {
  const triggerContentChange = $((blocks: Block[]) => {
    if (onContentChange$) {
      if (debounceTimer.value) clearTimeout(debounceTimer.value);
      debounceTimer.value = setTimeout(() => {
        onContentChange$(blocks);
      }, DEBOUNCE_MS);
    }
  });

  const handleBlockUpdate = $(
    (blockId: string, newContent: string, anchorOffset?: number, focusOffset?: number) => {
      const blockIdx = state.document.blocks.findIndex((b) => b.id === blockId);
      if (blockIdx !== -1) {
        const block = state.document.blocks[blockIdx];
        if (!("content" in block)) return;

        // Only take snapshot if content actually changed
        if (block.content !== newContent) {
          takeSnapshot$();
        }

        state.document.blocks = state.document.blocks.map((b) =>
          b.id === blockId && "content" in b ? ({ ...b, content: newContent } as Block) : b
        );

        if (anchorOffset !== undefined && focusOffset !== undefined) {
          state.selection = {
            blockId,
            anchorOffset,
            focusOffset,
            isCollapsed: anchorOffset === focusOffset,
          };
        }

        triggerContentChange(state.document.blocks);
      }
    }
  );

  const convertBlockType = $(
    (blockId: string, newType: BlockType, level?: 1 | 2 | 3, format?: "ordered" | "unordered") => {
      const idx = state.document.blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return;

      takeSnapshot$();

      const oldBlock = state.document.blocks[idx];
      const oldContent = "content" in oldBlock ? oldBlock.content : "";
      const quoteLevel = oldBlock.quoteLevel;
      let newBlock: Block;

      switch (newType) {
        case "heading":
          newBlock = {
            id: oldBlock.id,
            type: "heading",
            level: level || 1,
            content: oldContent,
            quoteLevel,
          };
          break;
        case "list-item":
          newBlock = {
            id: oldBlock.id,
            type: "list-item",
            format: format || "unordered",
            content: oldContent,
            quoteLevel,
          };
          break;
        case "blockquote":
          newBlock = {
            id: oldBlock.id,
            type: "blockquote",
            content: oldContent,
            quoteLevel: (quoteLevel || 0) + 1,
          };
          break;
        case "code-block":
          newBlock = {
            id: oldBlock.id,
            type: "code-block",
            content: oldContent,
            quoteLevel,
          };
          break;
        case "horizontal-rule":
          newBlock = {
            id: oldBlock.id,
            type: "horizontal-rule",
            content: "",
            quoteLevel,
          };
          break;
        default:
          newBlock = {
            id: oldBlock.id,
            type: "paragraph",
            content: oldContent,
            quoteLevel: newType === "paragraph" && !quoteLevel ? 0 : quoteLevel,
          };
      }

      state.document.blocks = state.document.blocks.map((b, i) => (i === idx ? newBlock : b));
      triggerContentChange(state.document.blocks);
    }
  );

  const splitBlock = $((blockId: string, offset: number) => {
    const idx = state.document.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;

    const oldBlock = state.document.blocks[idx];
    if (!("content" in oldBlock)) return;

    // US 2.4: Exit list/quote if Enter is pressed in an empty item
    if ((oldBlock.type === "list-item" || oldBlock.type === "blockquote") && oldBlock.content.trim() === "") {
        takeSnapshot$();
        convertBlockType(blockId, "paragraph");
        return;
    }

    takeSnapshot$();

    const contentBefore = oldBlock.content.substring(0, offset);
    const contentAfter = oldBlock.content.substring(offset);

    const updatedOldBlock = { ...oldBlock, content: contentBefore } as Block;

    // US 2.3: Continue list if Enter is pressed in a list item
    const newBlock: Block = (oldBlock.type === "list-item" ? {
      id: crypto.randomUUID(),
      type: "list-item",
      format: oldBlock.format,
      content: contentAfter,
      quoteLevel: oldBlock.quoteLevel,
    } : {
      id: crypto.randomUUID(),
      type: "paragraph",
      content: contentAfter,
      quoteLevel: oldBlock.quoteLevel,
    }) as Block;

    state.document.blocks = [
      ...state.document.blocks.slice(0, idx),
      updatedOldBlock,
      newBlock,
      ...state.document.blocks.slice(idx + 1),
    ];

    state.selection = {
      blockId: newBlock.id,
      anchorOffset: 0,
      focusOffset: 0,
      isCollapsed: true,
    };

    triggerContentChange(state.document.blocks);
  });

  const mergeWithPrevious = $((blockId: string) => {
    const idx = state.document.blocks.findIndex((b) => b.id === blockId);
    if (idx <= 0) return;

    takeSnapshot$();

    const prevBlock = state.document.blocks[idx - 1];
    const currentBlock = state.document.blocks[idx];

    if (!("content" in prevBlock) || !("content" in currentBlock)) return;

    const prevContentLength = prevBlock.content.length;

    const updatedPrevBlock = {
      ...prevBlock,
      content: prevBlock.content + currentBlock.content,
    } as Block;

    state.document.blocks = [
      ...state.document.blocks.slice(0, idx - 1),
      updatedPrevBlock,
      ...state.document.blocks.slice(idx + 1),
    ];

    state.selection = {
      blockId: prevBlock.id,
      anchorOffset: prevContentLength,
      focusOffset: prevContentLength,
      isCollapsed: true,
    };

    triggerContentChange(state.document.blocks);
  });

  const mergeWithNext = $((blockId: string) => {
    const idx = state.document.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1 || idx === state.document.blocks.length - 1) return;

    takeSnapshot$();

    const currentBlock = state.document.blocks[idx];
    const nextBlock = state.document.blocks[idx + 1];

    if (!("content" in currentBlock) || !("content" in nextBlock)) return;

    const currentContentLength = currentBlock.content.length;

    const updatedCurrentBlock = {
      ...currentBlock,
      content: currentBlock.content + nextBlock.content,
    } as Block;

    state.document.blocks = [
      ...state.document.blocks.slice(0, idx),
      updatedCurrentBlock,
      ...state.document.blocks.slice(idx + 2),
    ];

    state.selection = {
      blockId: currentBlock.id,
      anchorOffset: currentContentLength,
      focusOffset: currentContentLength,
      isCollapsed: true,
    };

    triggerContentChange(state.document.blocks);
  });

  const navigate = $((direction: "up" | "down", blockId: string) => {
    const idx = state.document.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const prevBlock = state.document.blocks[idx - 1];
      const contentLength = "content" in prevBlock ? prevBlock.content.length : 0;
      state.selection = {
        blockId: prevBlock.id,
        anchorOffset: contentLength,
        focusOffset: contentLength,
        isCollapsed: true,
      };
    } else if (direction === "down" && idx < state.document.blocks.length - 1) {
      const nextBlock = state.document.blocks[idx + 1];
      state.selection = {
        blockId: nextBlock.id,
        anchorOffset: 0,
        focusOffset: 0,
        isCollapsed: true,
      };
    }
  });

  return {
    handleBlockUpdate,
    convertBlockType,
    splitBlock,
    mergeWithPrevious,
    mergeWithNext,
    navigate,
  };
}
