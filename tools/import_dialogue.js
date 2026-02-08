#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net
// ============================================================================
// DIALOGUE IMPORT SCRIPT — Spreadsheet → Code
// ============================================================================
// Reads TSH_Hotspot_Dialogue.xlsx and writes changed dialogue strings back
// into room data files, items.js, combinations.js, and defaults.js.
//
// Only modifies string literal values. Never touches game logic, positions,
// drawing code, or anything structural.
//
// Usage:  deno run --allow-read --allow-write --allow-env --allow-net tools/import_dialogue.js
// ============================================================================

import ExcelJS from 'npm:exceljs@4.4.0';
import { resolve, basename, dirname, fromFileUrl } from 'https://deno.land/std/path/mod.ts';

// ── Resolve project root ────────────────────────────────────────────────────
const SCRIPT_DIR = dirname(fromFileUrl(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');
const ROOMS_DIR = resolve(PROJECT_ROOT, 'src', 'data', 'rooms');
const DEFAULTS_FILE = resolve(PROJECT_ROOT, 'src', 'data', 'defaults.js');
const ITEMS_FILE = resolve(PROJECT_ROOT, 'src', 'data', 'items', 'items.js');
const COMBOS_FILE = resolve(PROJECT_ROOT, 'src', 'data', 'items', 'combinations.js');
const INPUT_FILE = resolve(PROJECT_ROOT, 'TSH_Hotspot_Dialogue.xlsx');

// ── Room-to-Sheet Name Mapping (must match export script) ─────────────────
const ROOM_SHEET_NAMES = {
    interior:       'Interior',
    laboratory:     'Main Lab',
    earls_yard:     'Earls Yard',
    back_lab:       'Back Lab',
    backyard:       'Backyard',
    basement:       'Basement',
    second_floor:   '2nd Floor',
    hectors_room:   'Hectors Bedroom',
    franks_room:    'Franks Room',
    front_of_house: 'Front Exterior',
    alien_room:     'Alien Bedroom',
    roof:           'Roof',
    secure_storage: 'Storage Room',
};

// Reverse map: sheet name → room ID
const SHEET_TO_ROOM = {};
for (const [roomId, sheetName] of Object.entries(ROOM_SHEET_NAMES)) {
    SHEET_TO_ROOM[sheetName] = roomId;
}

// ============================================================================
// 1. LOAD GAME DATA via mock TSH global (same approach as export script)
// ============================================================================

function loadGameData() {
    globalThis.TSH = {
        Defaults: {},
        Rooms: {},
        Items: {},
        Combinations: { _recipes: {} },
        State: {
            getFlag: () => false,
            hasItem: () => false,
            addItem: () => {},
            removeItem: () => {},
            setFlag: () => {},
        },
        Actions: {},
    };

    const evalFile = (path) => {
        const code = Deno.readTextFileSync(path);
        try {
            const indirectEval = eval;
            indirectEval(code);
        } catch (e) {
            console.warn(`  Warning: Error evaluating ${basename(path)}: ${e.message}`);
        }
    };

    // Load defaults
    evalFile(DEFAULTS_FILE);

    // Load items first (rooms may reference TSH.Items)
    evalFile(ITEMS_FILE);

    // Load combinations
    evalFile(COMBOS_FILE);

    // Load all room files
    for (const entry of Deno.readDirSync(ROOMS_DIR)) {
        if (entry.isFile && entry.name.endsWith('.js')) {
            evalFile(resolve(ROOMS_DIR, entry.name));
        }
    }

    return {
        defaults: TSH.Defaults,
        rooms: TSH.Rooms,
        items: TSH.Items,
        combinations: TSH.Combinations._recipes
    };
}

// ============================================================================
// 2. READ SPREADSHEET
// ============================================================================

async function readSpreadsheet() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(INPUT_FILE);
    return wb;
}

// ── Parse a room sheet into structured data ─────────────────────────────────

function parseRoomSheet(ws, items) {
    const headerRow = ws.getRow(1);
    const colCount = headerRow.cellCount;

    // Build column index map
    const headers = [];
    for (let c = 1; c <= colCount; c++) {
        headers.push((headerRow.getCell(c).value || '').toString().trim());
    }

    // Find key column indices
    const hotspotIdCol = headers.lastIndexOf('Hotspot ID') + 1; // 1-indexed
    const examineCol = headers.indexOf('Examine') + 1;
    const useCol = headers.indexOf('Use') + 1;
    const talkToCol = headers.indexOf('TalkTo') + 1;

    if (!hotspotIdCol || !examineCol || !useCol || !talkToCol) {
        return null; // Not a valid room sheet
    }

    // Build item name → id map from the header row
    const itemColMap = {}; // colIndex (1-based) → item_id
    const sortedItems = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));
    const itemStartCol = talkToCol + 1;
    const itemEndCol = hotspotIdCol - 1;

    for (let c = itemStartCol; c <= itemEndCol; c++) {
        const headerName = (headerRow.getCell(c).value || '').toString().trim();
        // Match header name to item
        const item = sortedItems.find(i => i.name === headerName);
        if (item) {
            itemColMap[c] = item.id;
        }
    }

    // Parse rows
    const hotspots = [];
    ws.eachRow((row, rowNum) => {
        if (rowNum <= 1) return; // Skip header

        const hotspotId = (row.getCell(hotspotIdCol).value || '').toString().trim();
        if (!hotspotId) return; // Skip empty rows

        const examine = cellToString(row.getCell(examineCol).value);
        const use = cellToString(row.getCell(useCol).value);
        const talkTo = cellToString(row.getCell(talkToCol).value);

        // Item interactions for this hotspot
        const itemInteractions = {};
        for (const [colStr, itemId] of Object.entries(itemColMap)) {
            const col = parseInt(colStr);
            const val = cellToString(row.getCell(col).value);
            if (val !== '') {
                itemInteractions[itemId] = val;
            }
        }

        hotspots.push({ hotspotId, examine, use, talkTo, itemInteractions });
    });

    return hotspots;
}

// ── Parse Global Defaults sheet ─────────────────────────────────────────────

function parseGlobalDefaults(ws) {
    const globalDefaults = {}; // action → line (EXAMINE/USE/TALK_TO)
    const itemDefaults = {};   // itemId → { examine, failDefault }

    let inGlobalSection = false;
    let inItemSection = false;
    let itemIdCol = -1;

    ws.eachRow((row, rowNum) => {
        const cellA = (row.getCell(1).value || '').toString().trim();

        // Detect section headers
        if (cellA === 'GLOBAL ACTION DEFAULTS') {
            inGlobalSection = true;
            inItemSection = false;
            return;
        }
        if (cellA === 'ITEM DEFAULTS') {
            inGlobalSection = false;
            inItemSection = true;
            return;
        }

        // Global action defaults
        if (inGlobalSection) {
            // Skip the header row ("Action", "Default Line")
            if (cellA === 'Action') return;
            if (cellA === 'GLOBAL EXAMINE') {
                globalDefaults.examine = cellToString(row.getCell(2).value);
            } else if (cellA === 'GLOBAL USE') {
                globalDefaults.use = cellToString(row.getCell(2).value);
            } else if (cellA === 'GLOBAL TALK_TO') {
                globalDefaults.talkTo = cellToString(row.getCell(2).value);
            }
            return;
        }

        // Item defaults
        if (cellA === 'Item' && inItemSection) {
            // This is the item header row — find Item ID column
            for (let c = 1; c <= row.cellCount; c++) {
                if ((row.getCell(c).value || '').toString().trim() === 'Item ID') {
                    itemIdCol = c;
                    break;
                }
            }
            return;
        }

        if (inItemSection && itemIdCol > 0) {
            const itemId = (row.getCell(itemIdCol).value || '').toString().trim();
            if (!itemId) return;

            const examine = cellToString(row.getCell(2).value);
            const failDefault = cellToString(row.getCell(3).value);
            itemDefaults[itemId] = { examine, failDefault };
        }
    });

    return { globalDefaults, itemDefaults };
}

// ── Parse Item Combinations sheet ───────────────────────────────────────────

function parseCombinations(ws) {
    const combos = {}; // "itemA+itemB" → { dialogue, failLine }

    console.log('  [parseCombinations] Starting to parse combinations sheet...');

    ws.eachRow((row, rowNum) => {
        if (rowNum <= 1) return; // Skip header

        // Columns: Item 1 Name, Item 2 Name, Line, Fail Line, ID 1, ID 2
        const id1 = (row.getCell(5).value || '').toString().trim();
        const id2 = (row.getCell(6).value || '').toString().trim();
        const dialogue = cellToString(row.getCell(3).value);
        const failLine = cellToString(row.getCell(4).value);

        if (rowNum <= 5) {
            console.log(`  [parseCombinations] Row ${rowNum}: id1="${id1}", id2="${id2}", dialogue="${dialogue}"`);
        }

        if (id1 && id2) {
            const key = [id1, id2].sort().join('+');
            combos[key] = { dialogue, failLine };
            if (Object.keys(combos).length <= 3) {
                console.log(`  [parseCombinations] Added combo: ${key}`);
            }
        }
    });

    console.log(`  [parseCombinations] Total combos parsed: ${Object.keys(combos).length}`);
    return combos;
}

// ── Cell value helper ───────────────────────────────────────────────────────

function cellToString(value) {
    if (value === null || value === undefined) return '';
    // ExcelJS may return rich text objects
    if (typeof value === 'object' && value.richText) {
        return normalizeQuotes(value.richText.map(r => r.text).join(''));
    }
    return normalizeQuotes(value.toString());
}

// Normalize smart/curly quotes to straight quotes (Excel may auto-convert)
function normalizeQuotes(str) {
    return str
        .replace(/[\u2018\u2019\u201A]/g, "'")   // smart single quotes → '
        .replace(/[\u201C\u201D\u201E]/g, '"');   // smart double quotes → "
}

// ============================================================================
// 3. STRING REPLACEMENT ENGINE
// ============================================================================

// Escape a string for use in a regex pattern
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Convert a JS code string value (with possible escapes) to its literal form
// e.g., the code `"Hector\'s lab"` contains the escaped apostrophe
function codeStringToValue(codeStr) {
    // Remove surrounding quotes and unescape
    try {
        // Use indirect eval to parse the string literal
        const indirectEval = eval;
        return indirectEval(codeStr);
    } catch {
        // Fallback: strip quotes and basic unescape
        let s = codeStr;
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.slice(1, -1);
        }
        return s.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    }
}

// Convert a plain text value to a JS double-quoted string literal
function valueToCodeString(value) {
    // Escape backslashes first, then double quotes
    const escaped = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    return `"${escaped}"`;
}

// ── Replace a response property within a hotspot block ──────────────────────

function replaceHotspotResponse(source, hotspotId, property, newValue) {
    // Find the hotspot block by its id — there may be multiple matches
    // (e.g., lighting sources also have id fields), so we need the one
    // that has a `responses:` block nearby.
    const idPattern = new RegExp(`id:\\s*'${escapeRegex(hotspotId)}'`, 'g');
    let idMatch;
    let responsesStart = -1;
    let responsesMatchObj = null;

    while ((idMatch = idPattern.exec(source)) !== null) {
        const blockStart = idMatch.index;
        const searchRegion = source.substring(blockStart, blockStart + 2000);
        const respMatch = /responses:\s*\{/.exec(searchRegion);
        if (respMatch) {
            // Verify this responses block belongs to the same object by checking
            // there's no other `id:` between our id match and the responses block
            const betweenRegion = searchRegion.substring(0, respMatch.index);
            const otherIdMatch = /\bid:\s*'/.exec(betweenRegion.substring(idMatch[0].length));
            if (!otherIdMatch) {
                responsesStart = blockStart + respMatch.index;
                responsesMatchObj = respMatch;
                break;
            }
        }
    }

    if (responsesStart === -1 || !responsesMatchObj) return null;

    // Find the closing } of the responses block (handle nested braces)
    const responsesBlockStart = responsesStart + responsesMatchObj[0].length;
    let depth = 1;
    let responsesEnd = responsesBlockStart;
    while (depth > 0 && responsesEnd < source.length) {
        if (source[responsesEnd] === '{') depth++;
        if (source[responsesEnd] === '}') depth--;
        if (depth > 0) responsesEnd++;
    }

    const responsesBlock = source.substring(responsesBlockStart, responsesEnd);

    // Find the property within the responses block
    // Match: property: "string value" (handles escaped quotes)
    const propPattern = new RegExp(
        `(${escapeRegex(property)}:\\s*)"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`,
        's'
    );
    const propMatch = propPattern.exec(responsesBlock);
    if (!propMatch) return null;

    // Get current value
    const currentCodeString = `"${propMatch[2]}"`;
    const currentValue = codeStringToValue(currentCodeString);

    if (currentValue === newValue) return null; // No change

    // Build replacement
    const newCodeString = valueToCodeString(newValue);
    const newResponsesBlock = responsesBlock.substring(0, propMatch.index) +
        propMatch[1] + newCodeString +
        responsesBlock.substring(propMatch.index + propMatch[0].length);

    return source.substring(0, responsesBlockStart) + newResponsesBlock + source.substring(responsesEnd);
}

// ── Replace an itemInteraction value ────────────────────────────────────────

function replaceItemInteraction(source, hotspotId, itemId, newValue) {
    // Find itemInteractions block
    const iiMatch = /itemInteractions:\s*\{/.exec(source);
    if (!iiMatch) return null;

    const iiStart = iiMatch.index + iiMatch[0].length;

    // Find the closing } of the itemInteractions block
    let depth = 1;
    let iiEnd = iiStart;
    while (depth > 0 && iiEnd < source.length) {
        if (source[iiEnd] === '{') depth++;
        if (source[iiEnd] === '}') depth--;
        if (depth > 0) iiEnd++;
    }

    const iiBlock = source.substring(iiStart, iiEnd);

    // Find the hotspot sub-object within itemInteractions
    const hotspotPattern = new RegExp(`${escapeRegex(hotspotId)}:\\s*\\{`);
    const hotspotMatch = hotspotPattern.exec(iiBlock);
    if (!hotspotMatch) return null;

    const hotspotBlockStart = hotspotMatch.index + hotspotMatch[0].length;

    // Find closing } of this hotspot's sub-object
    let hDepth = 1;
    let hotspotBlockEnd = hotspotBlockStart;
    while (hDepth > 0 && hotspotBlockEnd < iiBlock.length) {
        if (iiBlock[hotspotBlockEnd] === '{') hDepth++;
        if (iiBlock[hotspotBlockEnd] === '}') hDepth--;
        if (hDepth > 0) hotspotBlockEnd++;
    }

    const hotspotSubBlock = iiBlock.substring(hotspotBlockStart, hotspotBlockEnd);

    // Find the item key within this sub-block
    const itemPattern = new RegExp(
        `(${escapeRegex(itemId)}:\\s*)"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`,
        's'
    );
    const itemMatch = itemPattern.exec(hotspotSubBlock);
    if (!itemMatch) return null;

    const currentCodeString = `"${itemMatch[2]}"`;
    const currentValue = codeStringToValue(currentCodeString);

    if (currentValue === newValue) return null; // No change

    const newCodeString = valueToCodeString(newValue);
    const newSubBlock = hotspotSubBlock.substring(0, itemMatch.index) +
        itemMatch[1] + newCodeString +
        hotspotSubBlock.substring(itemMatch.index + itemMatch[0].length);

    const newIIBlock = iiBlock.substring(0, hotspotBlockStart) + newSubBlock + iiBlock.substring(hotspotBlockEnd);

    return source.substring(0, iiStart) + newIIBlock + source.substring(iiEnd);
}

// ── Insert an item interaction entry (when no existing entry to replace) ────

function insertItemInteraction(source, hotspotId, itemId, newValue) {
    // Find itemInteractions block
    const iiMatch = /itemInteractions:\s*\{/.exec(source);
    if (!iiMatch) return null; // Level 3: no itemInteractions block at all

    const iiStart = iiMatch.index + iiMatch[0].length;

    // Find the closing } of the itemInteractions block
    let depth = 1;
    let iiEnd = iiStart;
    while (depth > 0 && iiEnd < source.length) {
        if (source[iiEnd] === '{') depth++;
        if (source[iiEnd] === '}') depth--;
        if (depth > 0) iiEnd++;
    }

    const iiBlock = source.substring(iiStart, iiEnd);

    // Check if hotspot sub-object exists
    const hotspotPattern = new RegExp(`${escapeRegex(hotspotId)}:\\s*\\{`);
    const hotspotMatch = hotspotPattern.exec(iiBlock);

    const newCodeString = valueToCodeString(newValue);

    if (hotspotMatch) {
        // Level 1: hotspot block exists, insert item entry into it
        const hotspotBlockStart = hotspotMatch.index + hotspotMatch[0].length;

        // Find closing } of this hotspot's sub-object
        let hDepth = 1;
        let hotspotBlockEnd = hotspotBlockStart;
        while (hDepth > 0 && hotspotBlockEnd < iiBlock.length) {
            if (iiBlock[hotspotBlockEnd] === '{') hDepth++;
            if (iiBlock[hotspotBlockEnd] === '}') hDepth--;
            if (hDepth > 0) hotspotBlockEnd++;
        }

        const hotspotSubBlock = iiBlock.substring(hotspotBlockStart, hotspotBlockEnd);

        // Detect indentation from existing entries
        const indentMatch = hotspotSubBlock.match(/\n(\s+)\w+:/);
        const indent = indentMatch ? indentMatch[1] : '                ';

        // Ensure the last entry has a trailing comma
        const trimmed = hotspotSubBlock.trimEnd();
        const needsComma = trimmed.length > 0 && !trimmed.endsWith(',');
        const fixedSubBlock = needsComma
            ? hotspotSubBlock.replace(/(\S)\s*$/, '$1,\n')
            : hotspotSubBlock;

        // Insert before the closing }
        const insertion = `${indent}${itemId}: ${newCodeString},\n`;
        const newSubBlock = fixedSubBlock + insertion;
        const newIIBlock = iiBlock.substring(0, hotspotBlockStart) + newSubBlock + iiBlock.substring(hotspotBlockEnd);

        return source.substring(0, iiStart) + newIIBlock + source.substring(iiEnd);
    } else {
        // Level 2: no hotspot block — insert a new hotspot sub-block

        // Detect indentation from existing sub-blocks
        const indentMatch = iiBlock.match(/\n(\s+)\w+:\s*[\{"]/);
        const indent = indentMatch ? indentMatch[1] : '            ';
        const innerIndent = indent + '    ';

        // Ensure the last entry in the block has a trailing comma
        const trimmed = iiBlock.trimEnd();
        const needsComma = trimmed.length > 0 && !trimmed.endsWith(',');
        const fixedBlock = needsComma
            ? iiBlock.replace(/(\S)\s*$/, '$1,')
            : iiBlock;

        // Insert before the closing } of itemInteractions
        const insertion = `\n${indent}${hotspotId}: {\n${innerIndent}${itemId}: ${newCodeString},\n${indent}},\n`;
        const newIIBlock = fixedBlock + insertion;

        return source.substring(0, iiStart) + newIIBlock + source.substring(iiEnd);
    }
}

// ── Replace item description in items.js ────────────────────────────────────

function replaceItemDescription(source, itemId, newValue) {
    // Find the item block
    const idPattern = new RegExp(`id:\\s*'${escapeRegex(itemId)}'`);
    const idMatch = idPattern.exec(source);
    if (!idMatch) return null;

    const blockStart = idMatch.index;

    // Search for description within reasonable distance
    const searchRegion = source.substring(blockStart, blockStart + 500);
    const descPattern = /(description:\s*)"([^"\\]*(?:\\.[^"\\]*)*)"/s;
    const descMatch = descPattern.exec(searchRegion);
    if (!descMatch) return null;

    const currentCodeString = `"${descMatch[2]}"`;
    const currentValue = codeStringToValue(currentCodeString);

    if (currentValue === newValue) return null;

    const newCodeString = valueToCodeString(newValue);
    const replaceStart = blockStart + descMatch.index;
    const replaceEnd = replaceStart + descMatch[0].length;

    return source.substring(0, replaceStart) +
        descMatch[1] + newCodeString +
        source.substring(replaceEnd);
}

// ── Replace item failDefault in items.js ────────────────────────────────────

function replaceItemFailDefault(source, itemId, newValue) {
    const idPattern = new RegExp(`id:\\s*'${escapeRegex(itemId)}'`);
    const idMatch = idPattern.exec(source);
    if (!idMatch) return null;

    const blockStart = idMatch.index;
    const searchRegion = source.substring(blockStart, blockStart + 500);
    const fdPattern = /(failDefault:\s*)"([^"\\]*(?:\\.[^"\\]*)*)"/s;
    const fdMatch = fdPattern.exec(searchRegion);
    if (!fdMatch) return null;

    const currentCodeString = `"${fdMatch[2]}"`;
    const currentValue = codeStringToValue(currentCodeString);

    if (currentValue === newValue) return null;

    const newCodeString = valueToCodeString(newValue);
    const replaceStart = blockStart + fdMatch.index;
    const replaceEnd = replaceStart + fdMatch[0].length;

    return source.substring(0, replaceStart) +
        fdMatch[1] + newCodeString +
        source.substring(replaceEnd);
}

// ── Replace a default string in defaults.js ─────────────────────────────────

function replaceDefaultString(source, property, newValue) {
    // Match: property: "string value"
    const pattern = new RegExp(
        `(${escapeRegex(property)}:\\s*)"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`,
        's'
    );
    const match = pattern.exec(source);
    if (!match) return null;

    const currentCodeString = `"${match[2]}"`;
    const currentValue = codeStringToValue(currentCodeString);

    if (currentValue === newValue) return null;

    const newCodeString = valueToCodeString(newValue);
    return source.substring(0, match.index) +
        match[1] + newCodeString +
        source.substring(match.index + match[0].length);
}

// ── Insert new dialogue-only combination ────────────────────────────────────

function insertDialogueOnlyCombination(source, comboKey, dialogue) {
    const [item1, item2] = comboKey.split('+');

    // Check if this combination already exists (even as dialogue-only)
    const makeKeyPattern = `makeKey('${item1}', '${item2}')`;
    const altMakeKeyPattern = `makeKey('${item2}', '${item1}')`;
    if (source.includes(makeKeyPattern) || source.includes(altMakeKeyPattern)) {
        console.log(`    [insertDialogueOnlyCombination] Entry already exists for ${comboKey}`);
        return null;
    }

    // Find the insertion point: before "// ── Expose to namespace"
    const insertMarker = '// ── Expose to namespace';
    const insertIndex = source.indexOf(insertMarker);

    if (insertIndex === -1) {
        console.warn(`    [insertDialogueOnlyCombination] Could not find insertion marker`);
        return null;
    }

    // Generate the combination entry code
    const escapedDialogue = dialogue.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    const entry = `
    // Dialogue-only (no recipe)
    combinations[makeKey('${item1}', '${item2}')] = {
        dialogue: '${escapedDialogue}'
    };

    `;

    // Insert before the marker
    const before = source.substring(0, insertIndex);
    const after = source.substring(insertIndex);

    return before + entry + after;
}

// ── Replace combination field in combinations.js ────────────────────────────

function replaceCombinationField(source, comboKey, fieldName, newValue) {
    // comboKey is like "candle+matches"
    // Find the combination by looking for makeKey('item1', 'item2') or the sorted key
    const [item1, item2] = comboKey.split('+');

    console.log(`    [replaceCombinationField] Searching for ${comboKey} ${fieldName}`);

    // Try both orderings of makeKey call
    const patterns = [
        new RegExp(`makeKey\\s*\\(\\s*'${escapeRegex(item1)}'\\s*,\\s*'${escapeRegex(item2)}'\\s*\\)`),
        new RegExp(`makeKey\\s*\\(\\s*'${escapeRegex(item2)}'\\s*,\\s*'${escapeRegex(item1)}'\\s*\\)`)
    ];

    let bestMatch = null;
    let bestIndex = -1;

    for (const pattern of patterns) {
        const match = pattern.exec(source);
        if (match) {
            let pos = 0;
            let m;
            while ((m = pattern.exec(source.substring(pos))) !== null) {
                const idx = pos + m.index;
                if (bestMatch === null || idx < bestIndex) {
                    bestMatch = m;
                    bestIndex = idx;
                }
                pos = idx + m[0].length;
                break;
            }
        }
    }

    if (!bestMatch) {
        console.log(`      [replaceCombinationField] makeKey not found for ${comboKey}`);
        return null;
    }

    console.log(`      [replaceCombinationField] Found makeKey at index ${bestIndex}`);

    // From the makeKey call, find the combo object block
    const blockSearchStart = bestIndex;
    const searchRegion = source.substring(blockSearchStart, blockSearchStart + 1000);

    // Find fieldName: "..." within this combo
    const fieldPattern = new RegExp(
        `(${escapeRegex(fieldName)}:\\s*)"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`,
        's'
    );
    const fieldMatch = fieldPattern.exec(searchRegion);
    if (!fieldMatch) {
        console.log(`      [replaceCombinationField] Field '${fieldName}' not found in combo block`);
        console.log(`      [replaceCombinationField] Search region preview: ${searchRegion.substring(0, 300)}`);
        return null;
    }

    const currentCodeString = `"${fieldMatch[2]}"`;
    const currentValue = codeStringToValue(currentCodeString);

    console.log(`      [replaceCombinationField] Current value in code: "${currentValue}"`);
    console.log(`      [replaceCombinationField] New value from sheet: "${newValue}"`);

    if (currentValue === newValue) {
        console.log(`      [replaceCombinationField] Values match, no change needed`);
        return null;
    }

    const newCodeString = valueToCodeString(newValue);
    const replaceStart = blockSearchStart + fieldMatch.index;
    const replaceEnd = replaceStart + fieldMatch[0].length;

    console.log(`      [replaceCombinationField] Replacing at position ${replaceStart}-${replaceEnd}`);

    return source.substring(0, replaceStart) +
        fieldMatch[1] + newCodeString +
        source.substring(replaceEnd);
}

// ============================================================================
// 4. APPLY CHANGES TO FILES
// ============================================================================

function processDefaultsFile(globalDefaults, codeDefaults) {
    let source;
    try {
        source = Deno.readTextFileSync(DEFAULTS_FILE);
    } catch {
        console.warn('  Warning: Cannot read defaults.js — skipping');
        return { file: 'defaults.js', changes: 0 };
    }

    let modified = source;
    let changeCount = 0;

    const fieldMap = {
        examine: 'examine',
        use: 'use',
        talkTo: 'talkTo',
    };

    console.log('  [DEBUG] Processing defaults.js:');
    for (const [sheetKey, codeKey] of Object.entries(fieldMap)) {
        const spreadsheetValue = globalDefaults[sheetKey];
        const currentCodeValue = codeDefaults[codeKey];

        console.log(`    ${codeKey}:`);
        console.log(`      Spreadsheet: "${spreadsheetValue}"`);
        console.log(`      Current code: "${currentCodeValue}"`);
        console.log(`      Match: ${spreadsheetValue === currentCodeValue}`);

        if (globalDefaults[sheetKey] !== undefined && globalDefaults[sheetKey] !== '') {
            const result = replaceDefaultString(modified, codeKey, globalDefaults[sheetKey]);
            if (result !== null) {
                console.log(`      Replacement: SUCCESS`);
                modified = result;
                changeCount++;
            } else {
                console.log(`      Replacement: SKIPPED (no change or not found)`);
            }
        }
    }

    if (changeCount > 0) {
        Deno.writeTextFileSync(DEFAULTS_FILE, modified);
    }

    return { file: 'defaults.js', changes: changeCount };
}

function processRoomFile(roomId, sheetData, codeRoom) {
    const roomFile = resolve(ROOMS_DIR, `${roomId}.js`);
    let source;
    try {
        source = Deno.readTextFileSync(roomFile);
    } catch {
        console.warn(`  Warning: Cannot read ${roomId}.js — skipping`);
        return { file: `${roomId}.js`, changes: 0 };
    }

    let modified = source;
    let changeCount = 0;

    // Build hotspot lookup from code
    const codeHotspots = {};
    if (codeRoom && codeRoom.hotspots) {
        for (const hs of codeRoom.hotspots) {
            codeHotspots[hs.id] = hs;
        }
    }

    for (const row of sheetData) {
        const { hotspotId, examine, use, talkTo, itemInteractions } = row;

        // Check if hotspot exists in code
        if (!codeHotspots[hotspotId]) {
            console.warn(`  Warning: Hotspot '${hotspotId}' in spreadsheet but not in ${roomId}.js — skipping`);
            continue;
        }

        const codeHotspot = codeHotspots[hotspotId];
        const isNPC = codeHotspot.type === 'npc' || codeHotspot.isNPC;
        const isTransition = !!codeHotspot.actionTrigger;

        // Replace look/examine response
        if (examine !== undefined) {
            const result = replaceHotspotResponse(modified, hotspotId, 'look', examine);
            if (result !== null) {
                modified = result;
                changeCount++;
            }
        }

        // Replace action/use response
        // Skip for transition hotspots when spreadsheet cell is empty
        // (export script intentionally blanks Use for transitions)
        if (use !== undefined && !(isTransition && use === '')) {
            const result = replaceHotspotResponse(modified, hotspotId, 'action', use);
            if (result !== null) {
                modified = result;
                changeCount++;
            }
        }

        // Replace talk response (only for NPCs)
        if (talkTo !== undefined && talkTo !== '') {
            if (isNPC) {
                const result = replaceHotspotResponse(modified, hotspotId, 'talk', talkTo);
                if (result !== null) {
                    modified = result;
                    changeCount++;
                }
            } else if (talkTo !== '') {
                console.warn(`  Warning: TalkTo text for non-NPC '${hotspotId}' in ${roomId} — skipping`);
            }
        }

        // Replace or insert item interaction strings
        const codeInteractions = (codeRoom.itemInteractions || {})[hotspotId] || {};
        for (const [itemId, dialogueLine] of Object.entries(itemInteractions)) {
            const result = replaceItemInteraction(modified, hotspotId, itemId, dialogueLine);
            if (result !== null) {
                modified = result;
                changeCount++;
            } else if (dialogueLine !== '' && !(itemId in codeInteractions)) {
                // Entry doesn't exist in code at all — try to insert
                const insertResult = insertItemInteraction(modified, hotspotId, itemId, dialogueLine);
                if (insertResult !== null) {
                    modified = insertResult;
                    changeCount++;
                    console.log(`    Inserted ${itemId} interaction for ${hotspotId}`);
                } else {
                    console.warn(`  Warning: No itemInteractions block in ${roomId}.js — cannot add ${hotspotId}+${itemId}`);
                }
            }
        }
    }

    if (changeCount > 0) {
        Deno.writeTextFileSync(roomFile, modified);
    }

    return { file: `${roomId}.js`, changes: changeCount };
}

function processItemsFile(itemDefaults) {
    let source;
    try {
        source = Deno.readTextFileSync(ITEMS_FILE);
    } catch {
        console.warn('  Warning: Cannot read items.js — skipping');
        return { file: 'items.js', changes: 0 };
    }

    let modified = source;
    let changeCount = 0;

    console.log('  [DEBUG] Processing items.js:');
    for (const [itemId, data] of Object.entries(itemDefaults)) {
        console.log(`    ${itemId}:`);

        // Update description
        if (data.examine !== undefined) {
            console.log(`      description:`);
            console.log(`        Spreadsheet: "${data.examine}"`);

            const result = replaceItemDescription(modified, itemId, data.examine);
            if (result !== null) {
                console.log(`        Replacement: SUCCESS`);
                modified = result;
                changeCount++;
            } else {
                console.log(`        Replacement: SKIPPED (no change or not found)`);
            }
        }

        // Update failDefault
        if (data.failDefault !== undefined) {
            console.log(`      failDefault:`);
            console.log(`        Spreadsheet: "${data.failDefault}"`);

            const result = replaceItemFailDefault(modified, itemId, data.failDefault);
            if (result !== null) {
                console.log(`        Replacement: SUCCESS`);
                modified = result;
                changeCount++;
            } else {
                console.log(`        Replacement: SKIPPED (no change or not found)`);
            }
        }
    }

    if (changeCount > 0) {
        Deno.writeTextFileSync(ITEMS_FILE, modified);
    }

    return { file: 'items.js', changes: changeCount };
}

function processCombinationsFile(combos, codeRecipes) {
    let source;
    try {
        source = Deno.readTextFileSync(COMBOS_FILE);
    } catch {
        console.warn('  Warning: Cannot read combinations.js — skipping');
        return { file: 'combinations.js', changes: 0 };
    }

    let modified = source;
    let changeCount = 0;

    console.log('  [DEBUG] Processing combinations.js:');
    console.log(`    Found ${Object.keys(combos).length} combos in spreadsheet`);
    console.log(`    Found ${Object.keys(codeRecipes).length} recipes in code`);

    for (const [comboKey, data] of Object.entries(combos)) {
        const hasRecipe = !!codeRecipes[comboKey];
        const codeRecipe = codeRecipes[comboKey];

        console.log(`    ${comboKey}:`);
        console.log(`      hasRecipe: ${hasRecipe}`);

        // Process dialogue field
        if (data.dialogue !== '') {
            console.log(`      dialogue:`);
            console.log(`        Spreadsheet: "${data.dialogue}"`);
            console.log(`        Current code: "${codeRecipe?.dialogue || 'N/A'}"`);

            if (hasRecipe) {
                const result = replaceCombinationField(modified, comboKey, 'dialogue', data.dialogue);
                if (result !== null) {
                    console.log(`        Replacement: SUCCESS`);
                    modified = result;
                    changeCount++;
                } else {
                    console.log(`        Replacement: SKIPPED (no change or not found)`);
                }
            } else {
                // No recipe exists - create dialogue-only entry
                console.log(`        Creating dialogue-only entry for ${comboKey}`);
                const result = insertDialogueOnlyCombination(modified, comboKey, data.dialogue);
                if (result !== null) {
                    console.log(`        Insertion: SUCCESS`);
                    modified = result;
                    changeCount++;
                } else {
                    console.log(`        Insertion: FAILED`);
                }
            }
        }

        // Process failDialogue field
        if (data.failLine !== '') {
            console.log(`      failDialogue:`);
            console.log(`        Spreadsheet: "${data.failLine}"`);
            console.log(`        Current code: "${codeRecipe?.failDialogue || 'N/A'}"`);

            if (hasRecipe) {
                const result = replaceCombinationField(modified, comboKey, 'failDialogue', data.failLine);
                if (result !== null) {
                    console.log(`        Replacement: SUCCESS`);
                    modified = result;
                    changeCount++;
                } else {
                    console.log(`        Replacement: SKIPPED (no change or not found)`);
                }
            } else {
                console.warn(`  Warning: Fail line for non-recipe combo ${comboKey} — skipping (no recipe in code)`);
            }
        }
    }

    if (changeCount > 0) {
        Deno.writeTextFileSync(COMBOS_FILE, modified);
    }

    return { file: 'combinations.js', changes: changeCount };
}

// ============================================================================
// 5. MAIN
// ============================================================================

async function main() {
    console.log('=== TSH Dialogue Import ===\n');

    // Check input file exists
    try {
        await Deno.stat(INPUT_FILE);
    } catch {
        console.error(`Error: ${INPUT_FILE} not found.`);
        console.error('Run the export script first to generate the spreadsheet.');
        Deno.exit(1);
    }

    // Load current code state
    console.log('Loading current code state...');
    const { defaults, rooms, items, combinations } = loadGameData();
    console.log(`  ${Object.keys(rooms).length} rooms, ${Object.keys(items).length} items loaded`);

    // Read spreadsheet
    console.log('Reading spreadsheet...');
    const wb = await readSpreadsheet();

    const results = [];
    let totalChanges = 0;
    let filesChanged = 0;

    // ── Process Global Defaults ───────────────────────────────────────────────
    console.log('\nProcessing global defaults...');

    const globalDefaultsSheet = wb.getWorksheet('Global Defaults');
    if (globalDefaultsSheet) {
        const { globalDefaults, itemDefaults } = parseGlobalDefaults(globalDefaultsSheet);

        // Process defaults.js (global action defaults)
        const defaultsResult = processDefaultsFile(globalDefaults, defaults);
        results.push(defaultsResult);
        if (defaultsResult.changes > 0) {
            console.log(`  ${defaultsResult.file}: ${defaultsResult.changes} defaults updated`);
            totalChanges += defaultsResult.changes;
            filesChanged++;
        }

        // Process items.js (item descriptions + failDefaults)
        console.log('Processing item defaults...');
        const itemsResult = processItemsFile(itemDefaults);
        results.push(itemsResult);
        if (itemsResult.changes > 0) {
            console.log(`  ${itemsResult.file}: ${itemsResult.changes} item fields updated`);
            totalChanges += itemsResult.changes;
            filesChanged++;
        }
    }

    // ── Process room sheets ─────────────────────────────────────────────────
    console.log('\nProcessing room sheets...');

    for (const [roomId, sheetName] of Object.entries(ROOM_SHEET_NAMES)) {
        const ws = wb.getWorksheet(sheetName);
        if (!ws) {
            console.log(`  ${sheetName}: sheet not found — skipping`);
            continue;
        }

        const sheetData = parseRoomSheet(ws, items);
        if (!sheetData || sheetData.length === 0) {
            results.push({ file: `${roomId}.js`, changes: 0 });
            continue;
        }

        const result = processRoomFile(roomId, sheetData, rooms[roomId]);
        results.push(result);

        if (result.changes > 0) {
            console.log(`  ${result.file}: ${result.changes} lines updated`);
            totalChanges += result.changes;
            filesChanged++;
        }
    }

    // ── Process Item Combinations ───────────────────────────────────────────
    console.log('\nProcessing item combinations...');

    const combosSheet = wb.getWorksheet('Item Combinations');
    if (combosSheet) {
        const combos = parseCombinations(combosSheet);
        const result = processCombinationsFile(combos, combinations);
        results.push(result);

        if (result.changes > 0) {
            console.log(`  ${result.file}: ${result.changes} lines updated`);
            totalChanges += result.changes;
            filesChanged++;
        }
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n=== Import Complete ===');

    // Show per-file breakdown
    for (const r of results) {
        if (r.changes === 0) {
            console.log(`  ${r.file}: 0 lines (no changes)`);
        }
    }

    console.log(`\nTotal: ${totalChanges} lines across ${filesChanged} files`);

    if (totalChanges === 0) {
        console.log('\nNo changes detected — spreadsheet matches current code.');
    }
}

main().catch(e => {
    console.error('Import failed:', e);
    Deno.exit(1);
});
