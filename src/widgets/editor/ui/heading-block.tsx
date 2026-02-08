import {
  component$,
  type PropFunction,
  type Signal,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";
import type { HeadingBlock as HeadingBlockModel } from "../../../entities/document/model/document";
import { getSelectionRange } from "../../../entities/selection/selection";
import { isHTMLElement } from "../../../entities/dom/dom";

export interface HeadingBlockProps {
  /** The heading block data to render */
  block: HeadingBlockModel;
  /** Whether this block is currently selected */
  isSelected: boolean;
  /** Optional style override */
  style?: string | CSSProperties;
  /** Callback fired when content changes */
  onInput$: PropFunction<(newContent: string, anchorOffset: number, focusOffset: number) => void>;
  /** Callback when user presses Enter */
  onEnter$: PropFunction<(blockId: string, offset: number) => void>;
  /** Callback when user presses Backspace at start */
  onBackspaceAtStart$: PropFunction<(blockId: string) => void>;
  /** Callback when user presses Delete at end */
  onDeleteAtEnd$: PropFunction<(blockId: string) => void>;
  /** Callback for arrow key navigation */
  onNavigate$: PropFunction<(direction: "up" | "down", blockId: string) => void>;
  /** Optional reference to the contentEditable element */
  ref?: Signal<HTMLElement | undefined> | PropFunction<(el: HTMLElement) => void>;
}

/**
 * Renders a heading block as a contentEditable <h1>, <h2>, or <h3> element.
 *
 * Supports dynamic tag selection based on heading level, inline formatting,
 * and keyboard navigation between blocks.
 * 
 * @example
 * ```tsx
 * <HeadingBlock
 *   block={{ id: 'h1', type: 'heading', level: 1, content: 'Title' }}
 *   isSelected={false}
 *   onInput$={(content) => updateState(content)}
 * />
 * ```
 */
export const HeadingBlock = component$<HeadingBlockProps>(
  ({
    block,
    isSelected,
    style,
    onInput$,
    onEnter$,
    onBackspaceAtStart$,
    onDeleteAtEnd$,
    onNavigate$,
    ref,
  }) => {
    const Tag = `h${block.level}` as "h1" | "h2" | "h3";
    /**
     * elRef holds the reference to the contentEditable element.
     * Justification (Principle VII): This is a non-reactive DOM reference used for
     * imperative operations (manual content syncing and selection measurement)
     * that cannot be handled purely through Qwik's reactive system without cursor jumps.
     */
    const elRef = useSignal<HTMLElement>();

    // Sync content from state to DOM only when necessary
    useVisibleTask$(({ track }) => {
      const content = track(() => block.content);
      if (elRef.value) {
        if (elRef.value.innerHTML !== content) {
          elRef.value.innerHTML = content;
        }
      }
    });

    return (
      <Tag
        ref={(el: HTMLElement) => {
          elRef.value = el;
          if (ref) {
            if (typeof ref === "function") {
              ref(el);
            } else {
              ref.value = el;
            }
          }
        }}
        data-block-id={block.id}
        data-block-type="heading"
        data-heading-level={block.level}
        contentEditable="true"
        style={style}
        class={
          isSelected
            ? `editor-heading editor-heading-${block.level} selected`
            : `editor-heading editor-heading-${block.level}`
        }
        onInput$={(e: InputEvent) => {
          const target = e.target;
          if (!isHTMLElement(target)) return;
          
          const range = getSelectionRange(target);
          if (range) {
            onInput$(target.innerHTML || "", range.anchorOffset, range.focusOffset);
          } else {
            onInput$(target.innerHTML || "", 0, 0);
          }
        }}
        onKeyDown$={(e: KeyboardEvent) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;

          const currentTarget = e.currentTarget;
          if (!isHTMLElement(currentTarget)) return;

          const range = getSelectionRange(currentTarget);
          const offset = range ? range.focusOffset : 0;
          const totalLength = currentTarget.textContent?.length || 0;

          if (e.key === "Enter") {
            e.preventDefault();
            onEnter$(block.id, offset);
          } else if (e.key === "Backspace" && offset === 0) {
            e.preventDefault();
            onBackspaceAtStart$(block.id);
          } else if (e.key === "Delete" && offset === totalLength) {
            e.preventDefault();
            onDeleteAtEnd$(block.id);
          } else if (e.key === "ArrowUp") {
            if (offset === 0) {
              e.preventDefault();
              onNavigate$("up", block.id);
            }
          } else if (e.key === "ArrowDown") {
            if (offset === totalLength) {
              e.preventDefault();
              onNavigate$("down", block.id);
            }
          }
        }}
      />
    );
  },
);
