import { $ } from "@builder.io/qwik";
import type { EditorState, HistorySnapshot } from "../../../../entities/document/model/document";

/**
 * Hook for managing undo/redo history.
 * Principle VII: Explicit state transitions for history snapshots.
 */
export const useHistory = (state: EditorState) => {
  /**
   * Pushes a new snapshot to the past stack and clears the future.
   */
  const takeSnapshot = $(() => {
    const snapshot: HistorySnapshot = {
      document: JSON.parse(JSON.stringify(state.document)),
      selection: state.selection ? { ...state.selection } : null,
    };

    // Only push if different from last snapshot to avoid redundancy
    const lastSnapshot = state.history.past[state.history.past.length - 1];
    if (lastSnapshot && JSON.stringify(lastSnapshot.document) === JSON.stringify(snapshot.document)) {
      return;
    }

    state.history.past.push(snapshot);
    state.history.future = [];
    
    // Limit history size to 100 items
    if (state.history.past.length > 100) {
      state.history.past.shift();
    }
  });

  /**
   * Reverts to the last snapshot in the past stack.
   */
  const undo = $(() => {
    const previous = state.history.past.pop();
    if (previous) {
      // Save current state to future
      state.history.future.push({
        document: JSON.parse(JSON.stringify(state.document)),
        selection: state.selection ? { ...state.selection } : null,
      });

      // Restore previous state
      state.document = previous.document;
      state.selection = previous.selection;
    }
  });

  /**
   * Restores the next snapshot in the future stack.
   */
  const redo = $(() => {
    const next = state.history.future.pop();
    if (next) {
      // Save current state to past
      state.history.past.push({
        document: JSON.parse(JSON.stringify(state.document)),
        selection: state.selection ? { ...state.selection } : null,
      });

      // Restore next state
      state.document = next.document;
      state.selection = next.selection;
    }
  });

  return {
    takeSnapshot,
    undo,
    redo,
  };
};
