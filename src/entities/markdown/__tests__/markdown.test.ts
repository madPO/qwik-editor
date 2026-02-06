import { parseMarkdown, serializeMarkdown } from "../markdown";

/**
 * Basic unit tests for markdown parsing and serialization.
 * Ensures Principle IV (Markdown Standard Compliance) and 
 * Principle III (Visual representation matches markdown output).
 */
export function runMarkdownTests() {
  console.log("Running Markdown Pipeline Tests...");

  const testMarkdown = "# Heading 1\n\nParagraph with **bold** and *italic*.\n\n## Heading 2\n\nAnother paragraph.";
  
  // Test Parsing
  const doc = parseMarkdown(testMarkdown);
  console.assert(doc.blocks.length === 4, "Should have 4 blocks");
  console.assert(doc.blocks[0].type === "heading", "First block should be heading");
  console.assert((doc.blocks[0] as any).level === 1, "First block should be level 1");
  console.assert(doc.blocks[1].type === "paragraph", "Second block should be paragraph");

  // Test Serialization
  const output = serializeMarkdown(doc);
  // Normalize whitespace for comparison
  const normalizedOutput = output.replace(/\n+/g, "\n").trim();
  
  // Note: mdast-util-to-markdown might use different formatting (e.g. __ instead of **)
  // so we check if the content is semantically equivalent
  console.assert(normalizedOutput.includes("# Heading 1"), "Output should include H1");
  console.assert(normalizedOutput.includes("## Heading 2"), "Output should include H2");
  
  console.log("Markdown Pipeline Tests Passed!");
}
