import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { FLOATING_UI_Z_INDEX } from "../lib/constants/ui";

export interface FloatingToolbarProps {
  /** Whether the toolbar is visible */
  visible: boolean;
  /** Position of the toolbar */
  position: { top: number; left: number };
  /** Callback to apply formatting */
  onFormat$: (command: string, value?: string) => void;
}

const FloatingToolbarStyles = (zIndex: number) => `
      .floating-toolbar {
        position: absolute;
        background: #222;
        color: white;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        gap: 2px;
        z-index: ${zIndex};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translate(-50%, -100%);
        pointer-events: all;
        border: 1px solid #444;
      }
      .floating-toolbar button {
        background: transparent;
        border: none;
        color: white;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
        transition: background 0.2s;
      }
      .floating-toolbar button:hover {
        background: #444;
      }
      .toolbar-separator {
        width: 1px;
        background: #444;
        margin: 4px 2px;
      }
    `;

/**
 * A floating toolbar that appears when text is selected.
 *
 * Provides quick access to inline formatting commands like Bold, Italic, and Links.
 * Automatically positions itself relative to the current text selection.
 * 
 * @example
 * ```tsx
 * <FloatingToolbar
 *   visible={true}
 *   position={{ top: 200, left: 150 }}
 *   onFormat$={(cmd, val) => applyFormatting(cmd, val)}
 * />
 * ```
 */
export const FloatingToolbar = component$<FloatingToolbarProps>(
  ({ visible, position, onFormat$ }) => {
    useStylesScoped$(FloatingToolbarStyles(FLOATING_UI_Z_INDEX));

    if (!visible) return null;

    return (
      <div
        class="floating-toolbar"
        role="toolbar"
        aria-label="Text formatting"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onMouseDown$={(e) => e.preventDefault()} // Prevent losing selection
      >
        <button
          title="Bold (Ctrl+B)"
          aria-label="Format as bold"
          onClick$={() => onFormat$("bold")}
          style={{ fontWeight: "bold" }}
        >
          B
        </button>
        <button
          title="Italic (Ctrl+I)"
          aria-label="Format as italic"
          onClick$={() => onFormat$("italic")}
          style={{ fontStyle: "italic" }}
        >
          I
        </button>
        <button
          title="Strikethrough"
          aria-label="Format as strikethrough"
          onClick$={() => onFormat$("strikethrough")}
          style={{ textDecoration: "line-through" }}
        >
          S
        </button>
        <button
          title="Code"
          aria-label="Format as code"
          onClick$={() => onFormat$("code")}
          style={{ fontFamily: "monospace" }}
        >
          {"<>"}
        </button>
        <div class="toolbar-separator" />
        <button
          title="Link"
          aria-label="Insert link"
          onClick$={() => {
            const url = window.prompt("Enter URL:");
            if (url) onFormat$("createLink", url);
          }}
        >
          Link
        </button>
      </div>
    );
  },
);
