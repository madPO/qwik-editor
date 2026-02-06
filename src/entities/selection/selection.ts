/**
 * Selection utilities for contentEditable elements with nested formatting nodes.
 */

export interface SelectionRange {
  anchorOffset: number;
  focusOffset: number;
}

/**
 * Sets the selection range within an element at specific character offsets,
 * accounting for nested HTML tags.
 */
export function setSelectionRange(
  element: HTMLElement,
  anchorOffset: number,
  focusOffset: number,
  selection: Selection | null = window.getSelection(),
  doc: Document = document
) {
  if (!selection) return;

  const anchor = getNodeAndOffset(element, anchorOffset, doc);
  const focus = getNodeAndOffset(element, focusOffset, doc);

  if (!anchor || !focus) return;

  // We use the selection object directly to support directional selection
  // (Range objects don't have a direction)
  selection.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
}

function getNodeAndOffset(
  root: HTMLElement,
  targetOffset: number,
  doc: Document
): { node: Node; offset: number } | null {
  let currentOffset = 0;
  const walk = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode: Node | null;

  while ((textNode = walk.nextNode())) {
    const nodeLength = textNode.textContent?.length || 0;
    if (currentOffset + nodeLength >= targetOffset) {
      return { node: textNode, offset: targetOffset - currentOffset };
    }
    currentOffset += nodeLength;
  }

  // Fallback to end of last node
  const lastText = getLastTextNode(root);
  if (lastText) {
    return { node: lastText, offset: lastText.textContent?.length || 0 };
  }

  return { node: root, offset: root.childNodes.length };
}

function getLastTextNode(node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return node;
  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const found = getLastTextNode(node.childNodes[i]);
    if (found) return found;
  }
  return null;
}

/**
 * Gets the current selection range within a root element.
 */
export function getSelectionRange(
  root: HTMLElement,
  selection: Selection | null = window.getSelection()
): SelectionRange | null {
  if (!selection || selection.rangeCount === 0) return null;

  const anchorOffset = getPointOffset(root, selection.anchorNode, selection.anchorOffset);
  const focusOffset = getPointOffset(root, selection.focusNode, selection.focusOffset);

  return { anchorOffset, focusOffset };
}

/**
 * Toggles an inline format (e.g., strong, em, a) using Selection and Range APIs.
 * Modern replacement for document.execCommand.
 */
export function toggleFormat(
  tag: string,
  attrs: Record<string, string> = {},
  selection: Selection | null = window.getSelection(),
  doc: Document = document
) {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);

  // Find the block root to ensure we stay within it
  let blockRoot: HTMLElement | null = null;
  let curr: Node | null = range.commonAncestorContainer;
  while (curr && curr !== doc.body) {
    if (curr instanceof HTMLElement && curr.hasAttribute("data-block-id")) {
      blockRoot = curr;
      break;
    }
    curr = curr.parentNode;
  }

  if (!blockRoot) return;

  // Check if we are already inside such a tag
  let existing: HTMLElement | null = null;
  let node: Node | null = range.commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

  if (node instanceof HTMLElement) {
    // Check for both the tag and common aliases (e.g., strong/b, em/i)
    const tagQuery = tag === "strong" ? "strong, b" : tag === "em" ? "em, i" : tag;
    existing = node.closest(tagQuery);

    if (existing && !blockRoot.contains(existing)) {
      existing = null;
    }
  }

  if (existing) {
    // For links, if a new href is provided, update it instead of removing
    if (tag === "a" && attrs.href && existing.getAttribute("href") !== attrs.href) {
      existing.setAttribute("href", attrs.href);
      return;
    }

    // Remove the formatting (Unwrap)
    const parent = existing.parentNode;
    if (parent) {
      const fragment = doc.createDocumentFragment();
      while (existing.firstChild) {
        fragment.appendChild(existing.firstChild);
      }
      parent.replaceChild(fragment, existing);
    }
  } else {
    // Apply the formatting (Wrap)
    const el = doc.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }

    try {
      const content = range.extractContents();
      el.appendChild(content);
      range.insertNode(el);

      // Restore selection to the newly formatted content
      const newRange = doc.createRange();
      newRange.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } catch {
      // In case of error (e.g. range splitting elements in unsupported ways),
      // we gracefully fail to apply the format.
    }
  }
}

function getPointOffset(
  root: HTMLElement | null,
  targetNode: Node | null,
  targetOffset: number
): number {
  if (!root || !targetNode || !root.contains(targetNode)) {
    if (root && targetNode === root) return targetOffset; // Handle case where root itself is target
    return 0;
  }

  let offset = 0;
  const walk = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let currentNode: Node | null;

  while ((currentNode = walk.nextNode())) {
    if (currentNode === targetNode) {
      return offset + targetOffset;
    }

    // Only add length of text nodes to the character offset
    if (currentNode.nodeType === Node.TEXT_NODE) {
      offset += currentNode.textContent?.length || 0;
    }
  }

  return offset;
}

/**
 * @deprecated Use setSelectionRange
 */
export function setCursorAtOffset(element: HTMLElement, targetOffset: number) {
  setSelectionRange(element, targetOffset, targetOffset);
}

/**
 * @deprecated Use getSelectionRange
 */
export function getCursorOffset(root: HTMLElement): number {
  const range = getSelectionRange(root);
  return range ? range.focusOffset : 0;
}
