/**
 * RouteX — Source Code Line Resolver
 * Finds the exact 1-indexed line number in the actual source code file for any execution trace tag.
 */

export function resolveCodeLine(sourceCode, codeTag) {
  if (!sourceCode || !codeTag) return 1;

  const lines = sourceCode.split('\n');
  const tagPattern = `[TAG: ${codeTag}]`;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(tagPattern)) {
      return i + 1; // 1-indexed
    }
  }

  // Fallback: search for tag name directly
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(codeTag.toLowerCase())) {
      return i + 1;
    }
  }

  return 1;
}

/**
 * Parses source code into an array of numbered lines with tag markers stripped for clean display.
 */
export function parseSourceCode(rawSource) {
  if (!rawSource) return [];
  const lines = rawSource.split('\n');
  return lines.map((text, idx) => ({
    lineNumber: idx + 1,
    // Strip tag comments like `// [TAG: XYZ]` so user gets pristine production code display
    cleanText: text.replace(/\/\/\s*\[TAG:[^\]]+\]/, '').trimEnd(),
    rawText: text,
  }));
}
