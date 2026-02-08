import { $ } from "@builder.io/qwik";
import type { EditorState } from "../../../../entities/document/model/document";
import { toggleFormat, getSelectionRange } from "../../../../entities/selection/selection";

/**
 * Hook to manage text formatting logic.
 */
export function useFormatting(
  state: EditorState,
  blockRefs: Record<string, HTMLElement>,
  handleBlockUpdate: (blockId: string, content: string) => void
) {
  const applyFormat = $((command: string, value?: string) => {
    switch (command) {
      case "bold":
        toggleFormat("strong");
        break;
      case "italic":
        toggleFormat("em");
        break;
      case "strikethrough":
        toggleFormat("del");
        break;
      case "code":
        toggleFormat("code");
        break;
      case "createLink":
        if (value) toggleFormat("a", { href: value });
        break;
    }

    // After applying format, we need to trigger an update for the active block
    if (state.selection?.blockId) {
      const blockEl = blockRefs[state.selection.blockId];
      if (blockEl) {
        /**
         * After formatting, the DOM changes. We must measure the new selection
         * within the DOM and sync it back to state to ensure Principle III
         * (Cursor position preserved) is maintained.
         */
        const range = getSelectionRange(blockEl);
        if (range) {
          state.selection = {
            ...state.selection,
            anchorOffset: range.anchorOffset,
            focusOffset: range.focusOffset,
            isCollapsed: range.anchorOffset === range.focusOffset,
          };
        }
        handleBlockUpdate(state.selection.blockId, blockEl.innerHTML);
      }
    }
  });

  return {
    applyFormat,
  };
}
