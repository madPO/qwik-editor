import { component$, type PropFunction, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import type { Block, BlockType } from "../../../entities/document/model/document";
import { FLOATING_UI_Z_INDEX } from "../lib/constants/ui";

export interface BlockTypeOption {
  type: BlockType;
  level?: 1 | 2 | 3;
  label: string;
}

const OPTIONS: BlockTypeOption[] = [
  { type: "paragraph", label: "Paragraph" },
  { type: "heading", level: 1, label: "Heading 1" },
  { type: "heading", level: 2, label: "Heading 2" },
  { type: "heading", level: 3, label: "Heading 3" },
];

export interface BlockTypeSelectorProps {
  /** The currently selected block */
  currentBlock: Block | null;
  /** Callback when user selects a new block type */
  onTypeChange$: PropFunction<(newType: BlockType, level?: 1 | 2 | 3) => void>;
  /** Whether the selector is currently visible */
  visible: boolean;
  /** Position for the selector */
  position?: { top: number; left: number };
  /** Callback to close the selector */
  onClose$: PropFunction<() => void>;
}

/**
 * Dropdown menu for selecting block type.
 *
 * Provides a slash-menu interface to switch between paragraph and heading types.
 * Supports full keyboard accessibility including auto-focus and focus trapping.
 * 
 * @example
 * ```tsx
 * <BlockTypeSelector
 *   visible={true}
 *   position={{ top: 100, left: 50 }}
 *   onTypeChange$={(type, level) => console.log(type, level)}
 *   onClose$={() => setVisible(false)}
 * />
 * ```
 */
export const BlockTypeSelector = component$<BlockTypeSelectorProps>(
  ({ onTypeChange$, visible, position, onClose$ }) => {
    const selectedIndex = useSignal(0);
    const containerRef = useSignal<HTMLElement>();

    useVisibleTask$(({ track }) => {
      track(() => visible);
      if (visible && containerRef.value) {
        containerRef.value.focus();
      }
    });

    const handleKeyDown = $((e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value + 1) % OPTIONS.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value - 1 + OPTIONS.length) % OPTIONS.length;
      } else if (e.key === "Enter") {
        e.preventDefault();
        const option = OPTIONS[selectedIndex.value];
        onTypeChange$(option.type, option.level);
        onClose$();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose$();
      } else if (e.key === "Tab") {
        // Trap focus inside the menu or close it
        e.preventDefault();
        if (e.shiftKey) {
          selectedIndex.value = (selectedIndex.value - 1 + OPTIONS.length) % OPTIONS.length;
        } else {
          selectedIndex.value = (selectedIndex.value + 1) % OPTIONS.length;
        }
      }
    });

    if (!visible) return null;

    return (
      <div
        ref={containerRef}
        class="block-type-selector"
        style={{
          position: "absolute",
          top: `${position?.top || 0}px`,
          left: `${position?.left || 0}px`,
          zIndex: FLOATING_UI_Z_INDEX,
          outline: "none",
        }}
        role="menu"
        aria-label="Change block type"
        onKeyDown$={handleKeyDown}
        tabIndex={0}
      >
        {OPTIONS.map((option, index) => (
          <div
            key={`${option.type}-${option.level || 0}`}
            class={`selector-option ${selectedIndex.value === index ? "active" : ""}`}
            role="menuitem"
            onClick$={() => {
              onTypeChange$(option.type, option.level);
              onClose$();
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    );
  },
);
