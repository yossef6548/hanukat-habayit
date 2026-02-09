
export type SplitOptions = {
  targetChars: number;        // e.g. 900
  minChars: number;           // e.g. 500
  maxChars: number;           // e.g. 1200
  preferNewlineWindow: number;// e.g. 180 (look for newline near boundary)
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function findNearestWhitespace(text: string, idx: number, radius: number) {
  const start = clamp(idx - radius, 0, text.length - 1);
  const end = clamp(idx + radius, 0, text.length - 1);

  // Prefer forward search a bit, then backward
  for (let i = idx; i <= end; i++) {
    if (/\s/.test(text[i] ?? "")) return i;
  }
  for (let i = idx; i >= start; i--) {
    if (/\s/.test(text[i] ?? "")) return i;
  }
  return idx;
}

function findNearestParagraphBreak(text: string, idx: number, window: number) {
  const start = clamp(idx - window, 0, text.length);
  const end = clamp(idx + window, 0, text.length);

  // Look for double newline or single newline
  const slice = text.slice(start, end);
  const rel = slice.search(/\n\s*\n/);
  if (rel !== -1) return start + rel + slice.match(/\n\s*\n/)![0].length;
  const rel2 = slice.search(/\n/);
  if (rel2 !== -1) return start + rel2 + 1;
  return null;
}

export function autoSplit(raw: string, opts: SplitOptions) {
  const text = raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n") // trim trailing spaces
    .trim();

  const parts: string[] = [];
  let i = 0;

  while (i < text.length) {
    const remaining = text.length - i;
    if (remaining <= opts.maxChars) {
      parts.push(text.slice(i).trim());
      break;
    }

    const ideal = i + opts.targetChars;
    const maxEnd = i + opts.maxChars;
    const minEnd = i + opts.minChars;

    let cut = clamp(ideal, minEnd, maxEnd);

    // 1) prefer paragraph/newline near cut
    const nl = findNearestParagraphBreak(text, cut, opts.preferNewlineWindow);
    if (nl !== null && nl >= minEnd && nl <= maxEnd) {
      cut = nl;
    } else {
      // 2) else nearest whitespace
      cut = findNearestWhitespace(text, cut, 120);
      cut = clamp(cut, minEnd, maxEnd);
    }

    const chunk = text.slice(i, cut).trim();
    if (chunk.length) parts.push(chunk);
    i = cut;
  }

  return parts;
}

export function manualSplit(raw: string) {
  const text = raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n") // trim trailing spaces before newline
    .trim();

  // Split on one-or-more blank lines (double newline, or double newline with spaces)
  const parts = text
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return parts;
}