import { $, type Signal } from "@builder.io/qwik";

export interface ToolbarState {
  visible: boolean;
  position: { top: number; left: number };
}

/**
 * Hook to manage the state of the floating toolbar.
 * 
 * Handles visibility and positioning of the toolbar relative to the editor container.
 */
export function useToolbarState(
  toolbarVisible: Signal<boolean>,
  toolbarPosition: { top: number; left: number },
  containerRef: Signal<HTMLElement | undefined>,
  offsetY: number
) {
  const showToolbar = $((rect: DOMRect) => {
    const container = containerRef.value;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      toolbarPosition.top = rect.top - containerRect.top - offsetY;
      toolbarPosition.left = rect.left + rect.width / 2 - containerRect.left;
      toolbarVisible.value = true;
    }
  });

  const hideToolbar = $(() => {
    toolbarVisible.value = false;
  });

  return {
    showToolbar,
    hideToolbar,
  };
}
