/**
 * Type guard to check if an unknown value is an HTMLElement.
 * 
 * @param el - The value to check
 * @returns True if the value is an HTMLElement
 */
export function isHTMLElement(el: unknown): el is HTMLElement {
  return el instanceof HTMLElement;
}
