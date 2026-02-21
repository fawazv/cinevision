/**
 * Fountain screenplay format parser.
 *
 * Parses plain-text .fountain files into a structured representation
 * grouped by scene. This is a STRUCTURAL parse only — it does not
 * interpret meaning. That's the AI's job in the next step.
 *
 * Reference: https://fountain.io/syntax
 */

import type {
    ParsedScreenplay,
    ScreenplayElement,
    ScreenplayElementType,
} from '../types/scene.types.js';

// ─── Regex Patterns ───────────────────────────────────────────────────────────

const SCENE_HEADING_RE = /^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|I\/E\.?)\s+.+/i;
const FORCED_HEADING_RE = /^\..+/;
const TRANSITION_RE = /^(FADE IN:|FADE OUT\.|FADE TO:|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)/i;
const CHARACTER_RE = /^[A-Z][A-Z0-9 ]+(\s*\(.+\))?$/;
const PARENTHETICAL_RE = /^\(.+\)$/;
const NOTE_RE = /^\[\[.+\]\]$/;

// ─── Element Classifier ───────────────────────────────────────────────────────

function classifyLine(
    line: string,
    prevType: ScreenplayElementType | null,
): ScreenplayElementType {
    const trimmed = line.trim();

    if (SCENE_HEADING_RE.test(trimmed) || FORCED_HEADING_RE.test(trimmed)) {
        return 'scene_heading';
    }
    if (TRANSITION_RE.test(trimmed)) return 'transition';
    if (NOTE_RE.test(trimmed)) return 'note';
    if (PARENTHETICAL_RE.test(trimmed) && prevType === 'character') return 'parenthetical';
    if (
        (prevType === 'character' || prevType === 'parenthetical') &&
        trimmed.length > 0
    ) {
        return 'dialogue';
    }
    // Character cues: ALL CAPS, no lowercase, not a heading/transition
    if (CHARACTER_RE.test(trimmed) && trimmed.length > 1) return 'character';

    return 'action';
}

// ─── Title Extraction ─────────────────────────────────────────────────────────

function extractTitle(lines: string[]): string {
    // Fountain title pages: key: value pairs at the very start of the file
    for (const line of lines.slice(0, 20)) {
        const match = /^Title:\s*(.+)/i.exec(line);
        if (match !== null) return match[1]?.trim() ?? 'Untitled';
    }
    return 'Untitled';
}

// ─── Main Parser ─────────────────────────────────────────────────────────────

/**
 * Parse a Fountain-format screenplay string into structured elements.
 *
 * Limitations of this implementation:
 *  - Dual dialogue is treated as sequential dialogue
 *  - Boneyard sections (/* *\/) are stripped
 *  - Title page key-value pairs other than "Title" are ignored
 */
export function parseFountain(text: string): ParsedScreenplay {
    // Strip boneyard comments
    const sanitised = text.replace(/\/\*[\s\S]*?\*\//g, '');

    const lines = sanitised.split(/\r?\n/);
    const title = extractTitle(lines);

    const elements: ScreenplayElement[] = [];
    let currentScene = 0;
    let prevType: ScreenplayElementType | null = null;

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i] ?? '';
        const line = raw.trim();

        // Skip blank lines and title page lines (before first scene heading)
        if (line.length === 0) {
            prevType = null;
            continue;
        }

        // Skip title-page key:value pairs
        if (currentScene === 0 && /^[A-Za-z ]+:\s*.+/.test(line)) continue;

        const type = classifyLine(line, prevType);

        if (type === 'scene_heading') {
            currentScene++;
        }

        // Don't emit elements before the first scene heading
        if (currentScene === 0) {
            prevType = type;
            continue;
        }

        elements.push({ type, text: line, sceneNumber: currentScene });
        prevType = type;
    }

    return { title, elements, totalScenes: currentScene };
}

// ─── Plain-text / TXT fallback ────────────────────────────────────────────────

/**
 * Best-effort parse for plain .txt files using the same heuristics.
 * Falls through to fountain parser since the patterns are compatible.
 */
export const parseTxt = parseFountain;

// ─── FDX (Final Draft XML) ────────────────────────────────────────────────────

/**
 * Extract raw text from a Final Draft (.fdx) XML file.
 * Returns the script as a plain string that can then be passed to parseFountain.
 *
 * FDX elements we care about:
 *   <Paragraph Type="Scene Heading">   → scene_heading
 *   <Paragraph Type="Action">          → action
 *   <Paragraph Type="Character">       → character
 *   <Paragraph Type="Dialogue">        → dialogue
 */
export function extractFdxText(xml: string): string {
    const lines: string[] = [];

    // Match paragraph blocks
    const paraRe = /<Paragraph[^>]+Type="([^"]+)"[^>]*>([\s\S]*?)<\/Paragraph>/g;
    const textRe = /<Text[^>]*>([\s\S]*?)<\/Text>/g;

    let paraMatch: RegExpExecArray | null;
    while ((paraMatch = paraRe.exec(xml)) !== null) {
        const type = paraMatch[1] ?? '';
        const innerXml = paraMatch[2] ?? '';

        // Extract text content from <Text> nodes
        const textParts: string[] = [];
        let textMatch: RegExpExecArray | null;
        const textMatcher = new RegExp(textRe.source, 'g');
        while ((textMatch = textMatcher.exec(innerXml)) !== null) {
            // Strip any remaining XML tags
            const clean = (textMatch[1] ?? '').replace(/<[^>]+>/g, '').trim();
            if (clean.length > 0) textParts.push(clean);
        }

        const text = textParts.join(' ');
        if (text.length === 0) continue;

        // Convert FDX type → Fountain-compatible formatting
        switch (type) {
            case 'Scene Heading':
                lines.push(text); // already formatted like "INT. FOREST - DAY"
                break;
            case 'Action':
                lines.push(text);
                break;
            case 'Character':
                lines.push(text.toUpperCase());
                break;
            case 'Dialogue':
                lines.push(text);
                break;
            case 'Transition':
                lines.push(`${text.toUpperCase()}:`);
                break;
            default:
                lines.push(text);
        }
        lines.push(''); // blank line between elements
    }

    return lines.join('\n');
}
