#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net
// ============================================================================
// DIALOGUE EXPORT SCRIPT — Code → Spreadsheet
// ============================================================================
// Extracts all dialogue from room JS files, items, combinations, and flags
// into an Excel spreadsheet for authoring. Re-runnable whenever code changes.
//
// Usage:  deno run --allow-read --allow-write tools/export_dialogue.js
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
const STATE_FILE = resolve(PROJECT_ROOT, 'src', 'GameState.js');
const OUTPUT_FILE = resolve(PROJECT_ROOT, 'TSH_Hotspot_Dialogue.xlsx');

// ── Room-to-Sheet Name Mapping ──────────────────────────────────────────────
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

// Ordered list for tab ordering (rooms appear in this order)
const ROOM_ORDER = [
    'interior', 'laboratory', 'earls_yard', 'back_lab', 'backyard',
    'basement', 'second_floor', 'hectors_room', 'franks_room',
    'front_of_house', 'alien_room', 'roof', 'secure_storage',
];

// ── Style Constants ─────────────────────────────────────────────────────────
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B5797' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const SECTION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
const SECTION_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
const ITEM_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } };
const ID_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
const ID_FONT = { color: { argb: 'FF808080' }, size: 10 };
const BORDER_THIN = {
    top: { style: 'thin' }, bottom: { style: 'thin' },
    left: { style: 'thin' }, right: { style: 'thin' },
};

// ============================================================================
// 1. LOAD GAME DATA via mock TSH global
// ============================================================================

function loadGameData() {
    // Mock the game's global namespace
    globalThis.TSH = {
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

    // Provide a mock Phaser-style graphics context (drawing functions are stored
    // but never called during require — however some rooms reference constants
    // that are defined alongside drawing code, so we need the IIFE to execute).
    // Since Deno doesn't have `require`, we read and eval each file.

    const evalFile = (path) => {
        const code = Deno.readTextFileSync(path);
        try {
            // Use indirect eval so it runs in global scope
            const indirectEval = eval;
            indirectEval(code);
        } catch (e) {
            console.warn(`  Warning: Error evaluating ${basename(path)}: ${e.message}`);
        }
    };

    // Load defaults
    console.log('Loading defaults...');
    evalFile(DEFAULTS_FILE);

    // Load items first (rooms may reference TSH.Items)
    console.log('Loading items...');
    evalFile(ITEMS_FILE);

    // Load combinations
    console.log('Loading combinations...');
    evalFile(COMBOS_FILE);

    // Discover and load all room files
    console.log('Loading rooms...');
    const roomFiles = [];
    for (const entry of Deno.readDirSync(ROOMS_DIR)) {
        if (entry.isFile && entry.name.endsWith('.js')) {
            roomFiles.push(entry.name);
        }
    }
    roomFiles.sort();

    for (const file of roomFiles) {
        const filePath = resolve(ROOMS_DIR, file);
        evalFile(filePath);
    }

    console.log(`  Loaded ${Object.keys(TSH.Rooms).length} rooms, ${Object.keys(TSH.Items).length} items`);
    return { rooms: TSH.Rooms, items: TSH.Items, combinations: TSH.Combinations._recipes };
}

// ============================================================================
// 2. PARSE FLAGS FROM GameState.js
// ============================================================================

function parseFlags() {
    const source = Deno.readTextFileSync(STATE_FILE);
    const flags = [];

    // Extract the flags object from createDefaultState
    const flagsMatch = source.match(/flags:\s*\{([\s\S]*?)\n\s{12}},?\s*\n\s{12}\/\/ ── NPC/);
    if (!flagsMatch) {
        console.warn('  Warning: Could not parse flags from GameState.js');
        return flags;
    }

    const flagsBlock = flagsMatch[1];

    // Parse each category
    let currentCategory = null;
    const categoryComment = {};

    for (const line of flagsBlock.split('\n')) {
        const trimmed = line.trim();

        // Category comment (e.g., "// Story progression")
        const commentMatch = trimmed.match(/^\/\/\s*(.+)/);
        if (commentMatch && !currentCategory) {
            // Store comment for next category
        }

        // Category start (e.g., "story: {")
        const catMatch = trimmed.match(/^(\w+):\s*\{/);
        if (catMatch) {
            currentCategory = catMatch[1];
            // Look backwards for a category description comment
            const prevLines = flagsBlock.substring(0, flagsBlock.indexOf(trimmed)).split('\n');
            for (let i = prevLines.length - 1; i >= 0; i--) {
                const prev = prevLines[i].trim();
                if (prev.match(/^\/\/\s*(.+)/)) {
                    categoryComment[currentCategory] = prev.replace(/^\/\/\s*/, '');
                    break;
                }
                if (prev && !prev.startsWith('//')) break;
            }
            continue;
        }

        // Category end
        if (trimmed === '},' || trimmed === '}') {
            if (currentCategory && currentCategory !== 'misc') {
                // Don't reset — we already processed
            }
            if (trimmed.startsWith('}')) currentCategory = null;
            continue;
        }

        // Flag entry (e.g., "has_spring_1: false,  // From lab cabinet")
        if (currentCategory && currentCategory !== 'misc') {
            const flagMatch = trimmed.match(/^(\w+):\s*false,?\s*(?:\/\/\s*(.+))?$/);
            if (flagMatch) {
                flags.push({
                    category: currentCategory,
                    name: `${currentCategory}.${flagMatch[1]}`,
                    description: flagMatch[2] || '',
                });
            }
        }
    }

    console.log(`  Parsed ${flags.length} flags from GameState.js`);
    return flags;
}

// ============================================================================
// 3. READ EXISTING XLSX (to preserve hand-written Item Combinations data)
// ============================================================================

async function readExistingCombinations() {
    const existing = new Map(); // key: "ItemA|ItemB" → line text

    try {
        await Deno.stat(OUTPUT_FILE);
    } catch {
        return existing; // File doesn't exist yet
    }

    try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(OUTPUT_FILE);
        const sheet = wb.getWorksheet('Item Combinations');
        if (!sheet) return existing;

        sheet.eachRow((row, rowNum) => {
            if (rowNum <= 1) return; // Skip header
            const item1 = (row.getCell(1).value || '').toString().trim();
            const item2 = (row.getCell(2).value || '').toString().trim();
            const line = (row.getCell(3).value || '').toString().trim();
            if (item1 && item2 && line) {
                const key = [item1, item2].sort().join('|');
                existing.set(key, line);
            }
        });

        console.log(`  Preserved ${existing.size} existing combination lines`);
    } catch (e) {
        console.warn(`  Warning: Could not read existing xlsx: ${e.message}`);
    }

    return existing;
}

// ============================================================================
// 4. GENERATE WORKBOOK
// ============================================================================

function getSheetName(roomId) {
    if (ROOM_SHEET_NAMES[roomId]) return ROOM_SHEET_NAMES[roomId];
    // Fallback: title-case the filename
    return roomId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function applyHeaderStyle(row, count, fill) {
    fill = fill || HEADER_FILL;
    for (let c = 1; c <= count; c++) {
        const cell = row.getCell(c);
        cell.fill = fill;
        cell.font = HEADER_FONT;
        cell.border = BORDER_THIN;
        cell.alignment = { vertical: 'middle', wrapText: true };
    }
}

// ── Instructions Tab ────────────────────────────────────────────────────────

function createInstructionsSheet(wb) {
    const ws = wb.addWorksheet('Instructions', { properties: { tabColor: { argb: 'FF4472C4' } } });
    ws.columns = [{ width: 20 }, { width: 80 }];

    const content = [
        ['TSH Dialogue Spreadsheet', ''],
        ['', ''],
        ['CELL CONVENTIONS', ''],
        ['(blank)', 'Maps to "" in code — fallback chain handles at runtime'],
        ['plain text', 'That exact string goes into code — 1:1 mapping'],
        ['', ''],
        ['STATE COLUMN', ''],
        ['default', 'No state required — this is the fallback row'],
        ['FLAG_NAME', 'Row matches when that flag is true (e.g., story.found_hector)'],
        ['FLAG1, FLAG2', 'All listed flags must be true for this row to match'],
        ['', ''],
        ['ROW ORDERING', ''],
        ['', 'The game checks rows top-to-bottom and uses the first match.'],
        ['', 'Put most-specific states first, "default" last.'],
        ['', ''],
        ['FALLBACK CHAIN', ''],
        ['', 'Room-specific cell → Item Fail Default (Global Defaults) → Global Action Default'],
        ['', 'If a room cell is blank, the system checks the item\'s Fail Default.'],
        ['', 'If that\'s also blank, the Global Action Default for that verb is used.'],
        ['', ''],
        ['GENERAL TIPS', ''],
        ['', 'No quotation marks in cells — dialogue is stored as plain text.'],
        ['', 'Item columns = what Nate says when USING that item ON the hotspot.'],
        ['', 'Item Combinations tab = what happens when using one item on another in inventory.'],
        ['', '{item} and {hotspot} are template variables — they get replaced at runtime.'],
    ];

    for (const [i, [col1, col2]] of content.entries()) {
        const row = ws.getRow(i + 1);
        row.getCell(1).value = col1;
        row.getCell(2).value = col2;

        if (i === 0) {
            row.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF2B5797' } };
            row.height = 30;
        } else if (['CELL CONVENTIONS', 'STATE COLUMN', 'ROW ORDERING', 'FALLBACK CHAIN', 'GENERAL TIPS'].includes(col1)) {
            row.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF2B5797' } };
        } else if (col1 && !col2) {
            // Label cells like "(blank)", "default", etc.
            row.getCell(1).font = { bold: true, size: 11 };
        }
    }
}

// ── Flags Reference Tab ─────────────────────────────────────────────────────

function createFlagsSheet(wb, flags) {
    const ws = wb.addWorksheet('Flags Reference', { properties: { tabColor: { argb: 'FF7030A0' } } });
    ws.columns = [
        { header: 'Category', width: 15 },
        { header: 'Flag Name', width: 35 },
        { header: 'Description', width: 50 },
    ];

    const headerRow = ws.getRow(1);
    applyHeaderStyle(headerRow, 3);

    let prevCategory = '';
    for (const flag of flags) {
        const row = ws.addRow([
            flag.category !== prevCategory ? flag.category : '',
            flag.name,
            flag.description,
        ]);
        prevCategory = flag.category;

        for (let c = 1; c <= 3; c++) {
            row.getCell(c).border = BORDER_THIN;
        }
        // Gray out category repeats
        if (!row.getCell(1).value) {
            row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        }
    }
}

// ── Global Defaults Tab ─────────────────────────────────────────────────────

function createGlobalDefaultsSheet(wb, items) {
    const ws = wb.addWorksheet('Global Defaults', { properties: { tabColor: { argb: 'FFED7D31' } } });

    // Section 1: Global Action Defaults
    const sectionRow1 = ws.addRow(['GLOBAL ACTION DEFAULTS']);
    sectionRow1.getCell(1).font = SECTION_FONT;
    sectionRow1.getCell(1).fill = SECTION_FILL;
    ws.mergeCells(1, 1, 1, 4);

    const headerRow1 = ws.addRow(['Action', 'Default Line', '', '']);
    applyHeaderStyle(headerRow1, 2);

    const defaults = [
        ['GLOBAL EXAMINE', TSH.Defaults.examine],
        ['GLOBAL USE', TSH.Defaults.use],
        ['GLOBAL TALK_TO', TSH.Defaults.talkTo],
    ];
    for (const [action, line] of defaults) {
        const row = ws.addRow([action, line]);
        row.getCell(1).font = { bold: true };
        for (let c = 1; c <= 2; c++) row.getCell(c).border = BORDER_THIN;
    }

    // Spacer rows
    ws.addRow([]);
    ws.addRow([]);
    ws.addRow([]);

    // Section 2: Item Defaults
    const sectionRow2 = ws.addRow(['ITEM DEFAULTS']);
    const sectionRowNum = sectionRow2.number;
    ws.getRow(sectionRowNum).getCell(1).font = SECTION_FONT;
    ws.getRow(sectionRowNum).getCell(1).fill = SECTION_FILL;
    ws.mergeCells(sectionRowNum, 1, sectionRowNum, 4);

    const headerRow2 = ws.addRow(['Item', 'Examine', 'Fail Default', 'Item ID']);
    applyHeaderStyle(headerRow2, 3);
    // Style Item ID header
    headerRow2.getCell(4).fill = ID_FILL;
    headerRow2.getCell(4).font = { bold: true, color: { argb: 'FF808080' } };
    headerRow2.getCell(4).border = BORDER_THIN;

    // Sort items by name for readability
    const sortedItems = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));
    for (const item of sortedItems) {
        const row = ws.addRow([item.name, item.description, item.failDefault || '', item.id]);
        for (let c = 1; c <= 3; c++) row.getCell(c).border = BORDER_THIN;
        // ID column styling
        row.getCell(4).fill = ID_FILL;
        row.getCell(4).font = ID_FONT;
        row.getCell(4).border = BORDER_THIN;
    }

    // Column widths
    ws.getColumn(1).width = 25;
    ws.getColumn(2).width = 60;
    ws.getColumn(3).width = 40;
    ws.getColumn(4).width = 20;
}

// ── Item Combinations Tab ───────────────────────────────────────────────────

function createItemCombinationsSheet(wb, items, combinations, existingLines) {
    const ws = wb.addWorksheet('Item Combinations', { properties: { tabColor: { argb: 'FF00B050' } } });

    ws.columns = [
        { header: 'Item 1', width: 25 },
        { header: 'Item 2', width: 25 },
        { header: 'Line', width: 60 },
        { header: 'Fail Line', width: 60 },
        { header: 'ID 1', width: 20 },
        { header: 'ID 2', width: 20 },
    ];

    const headerRow = ws.getRow(1);
    applyHeaderStyle(headerRow, 4);
    // ID columns
    headerRow.getCell(5).fill = ID_FILL;
    headerRow.getCell(5).font = { bold: true, color: { argb: 'FF808080' } };
    headerRow.getCell(5).border = BORDER_THIN;
    headerRow.getCell(6).fill = ID_FILL;
    headerRow.getCell(6).font = { bold: true, color: { argb: 'FF808080' } };
    headerRow.getCell(6).border = BORDER_THIN;

    // Build all unique item pairs (alphabetical by name)
    const itemList = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < itemList.length; i++) {
        for (let j = i + 1; j < itemList.length; j++) {
            const item1 = itemList[i];
            const item2 = itemList[j];

            // Check if a recipe exists for this pair
            const key = [item1.id, item2.id].sort().join('+');
            const recipe = combinations[key];

            // Check for preserved hand-written line
            const preserveKey = [item1.name, item2.name].sort().join('|');
            const existingLine = existingLines.get(preserveKey);

            // Priority: existing hand-written > recipe dialogue > blank
            let line = '';
            if (existingLine) {
                line = existingLine;
            } else if (recipe && recipe.dialogue) {
                line = recipe.dialogue;
            }

            const failLine = (recipe && recipe.failDialogue) ? recipe.failDialogue : '';

            const row = ws.addRow([item1.name, item2.name, line, failLine, item1.id, item2.id]);
            for (let c = 1; c <= 4; c++) row.getCell(c).border = BORDER_THIN;
            row.getCell(5).fill = ID_FILL;
            row.getCell(5).font = ID_FONT;
            row.getCell(5).border = BORDER_THIN;
            row.getCell(6).fill = ID_FILL;
            row.getCell(6).font = ID_FONT;
            row.getCell(6).border = BORDER_THIN;
        }
    }
}

// ── Room Sheets ─────────────────────────────────────────────────────────────

/**
 * Parse @state annotations from room file source code
 * Returns a map: { hotspot_id: ['state1', 'state2', ...] }
 */
function parseStateAnnotations(roomSource) {
    const stateMap = {};
    // Match: // @state hotspot_id: state1, state2, ...
    // Use [^\n\r] to match everything except newlines
    const regex = /\/\/ @state (\w+): ([^\n\r]+)/g;
    let match;
    while ((match = regex.exec(roomSource)) !== null) {
        const hotspotId = match[1];
        const states = match[2].trim().split(',').map(s => s.trim());
        stateMap[hotspotId] = states;
    }
    return stateMap;
}

/**
 * Extract state variants from a response (string or variant array)
 * Returns: array of {state, text} objects
 */
function extractResponseVariants(response, states) {
    if (!response) {
        // No response - create empty variants for each state
        return states.map(state => ({ state, text: '' }));
    }

    if (typeof response === 'string') {
        // Simple string - use for all states (shouldn't happen with @state annotation, but handle it)
        return states.map(state => ({ state, text: response }));
    }

    if (Array.isArray(response)) {
        // Variant array - match each variant to its state by analyzing the condition
        const variants = [];

        for (const state of states) {
            if (state === 'default') {
                // Find variant with no condition
                const defaultVariant = response.find(v => !v.condition);
                variants.push({ state, text: defaultVariant?.text || '' });
            } else if (state.startsWith('has:')) {
                const itemId = state.substring(4);
                // Find variant that checks for this item
                const matchingVariant = response.find(v => {
                    const condStr = v.condition?.toString() || '';
                    return condStr.includes(`hasItem('${itemId}')`);
                });
                variants.push({ state, text: matchingVariant?.text || '' });
            } else if (state.startsWith('!has:')) {
                const itemId = state.substring(5);
                const matchingVariant = response.find(v => {
                    const condStr = v.condition?.toString() || '';
                    return condStr.includes(`!`) && condStr.includes(`hasItem('${itemId}')`);
                });
                variants.push({ state, text: matchingVariant?.text || '' });
            } else if (state.startsWith('flag:')) {
                const flagName = state.substring(5);
                const matchingVariant = response.find(v => {
                    const condStr = v.condition?.toString() || '';
                    return condStr.includes(`getFlag('${flagName}')`);
                });
                variants.push({ state, text: matchingVariant?.text || '' });
            } else if (state.startsWith('!flag:')) {
                const flagName = state.substring(6);
                const matchingVariant = response.find(v => {
                    const condStr = v.condition?.toString() || '';
                    return condStr.includes(`!`) && condStr.includes(`getFlag('${flagName}')`);
                });
                variants.push({ state, text: matchingVariant?.text || '' });
            } else {
                // Unknown state type - use empty
                variants.push({ state, text: '' });
            }
        }

        return variants;
    }

    // Unknown type - create empty variants
    return states.map(state => ({ state, text: '' }));
}

function createRoomSheet(wb, roomId, room, items, roomSource = '') {
    const sheetName = getSheetName(roomId);
    const ws = wb.addWorksheet(sheetName, { properties: { tabColor: { argb: 'FF2B5797' } } });

    // Build item list (sorted by name for consistent column ordering)
    const itemList = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));

    // Headers: Hotspot | State | Examine | Use | TalkTo | [item names] | Hotspot ID
    const headers = ['Hotspot', 'State', 'Examine', 'Use', 'TalkTo'];
    const itemStartCol = headers.length + 1; // 1-indexed column where items begin
    for (const item of itemList) {
        headers.push(item.name);
    }
    headers.push('Hotspot ID');

    // Set columns
    ws.columns = headers.map((h, i) => {
        if (i === 0) return { header: h, width: 22 };
        if (i === 1) return { header: h, width: 12 };
        if (i <= 4) return { header: h, width: 40 };
        if (i === headers.length - 1) return { header: h, width: 20 };
        return { header: h, width: 18 };
    });

    // Style header row
    const headerRow = ws.getRow(1);
    for (let c = 1; c <= headers.length; c++) {
        const cell = headerRow.getCell(c);
        cell.border = BORDER_THIN;
        cell.alignment = { vertical: 'middle', wrapText: true };

        if (c <= 5) {
            // Standard headers
            cell.fill = HEADER_FILL;
            cell.font = HEADER_FONT;
        } else if (c === headers.length) {
            // Hotspot ID column
            cell.fill = ID_FILL;
            cell.font = { bold: true, color: { argb: 'FF808080' } };
        } else {
            // Item columns
            cell.fill = ITEM_HEADER_FILL;
            cell.font = HEADER_FONT;
        }
    }

    // Build itemInteractions lookup
    const itemInteractions = room.itemInteractions || {};

    // Parse state annotations from source
    const stateAnnotations = roomSource ? parseStateAnnotations(roomSource) : {};

    // Get hotspots - handle both static arrays and dynamic getHotspotData() functions
    let hotspots = [];
    if (room.hotspots) {
        hotspots = room.hotspots;
    } else if (room.getHotspotData) {
        // Call getHotspotData with a dummy height (800px is standard)
        hotspots = room.getHotspotData(800);
    }

    // Add hotspot rows
    for (const hotspot of hotspots) {
        const responses = hotspot.responses || {};
        const isTransition = !!hotspot.actionTrigger;

        // Check if this hotspot has state annotations
        const states = stateAnnotations[hotspot.id] || ['default'];

        // Extract variants for each verb
        const examineVariants = extractResponseVariants(responses.look, states);
        // For transitions, only blank Use if there's no explicit action response
        const useVariants = (isTransition && !responses.action)
            ? states.map(state => ({ state, text: '' }))
            : extractResponseVariants(responses.action, states);
        const talkToVariants = extractResponseVariants(responses.talk, states);

        // Create one row per state variant
        for (let i = 0; i < states.length; i++) {
            const state = states[i];
            const examine = examineVariants[i]?.text || '';
            const use = useVariants[i]?.text || '';
            const talkTo = talkToVariants[i]?.text || '';

            const rowData = [hotspot.name, state, examine, use, talkTo];

            // Item columns (only include in first row for each hotspot)
            const hotspotItemInteractions = itemInteractions[hotspot.id] || {};
            for (const item of itemList) {
                const interaction = i === 0 ? (hotspotItemInteractions[item.id] || '') : '';
                rowData.push(interaction);
            }

            // Hotspot ID (last column)
            rowData.push(hotspot.id);

            const row = ws.addRow(rowData);

            // Style data cells
            for (let c = 1; c <= headers.length; c++) {
                const cell = row.getCell(c);
                cell.border = BORDER_THIN;
                cell.alignment = { vertical: 'top', wrapText: true };

                if (c === headers.length) {
                    // Hotspot ID
                    cell.fill = ID_FILL;
                    cell.font = ID_FONT;
                }
            }
        }
    }

    return ws;
}

// ── Attic placeholder ───────────────────────────────────────────────────────

function createEmptyRoomSheet(wb, sheetName, items) {
    const ws = wb.addWorksheet(sheetName, { properties: { tabColor: { argb: 'FFD9D9D9' } } });

    const itemList = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));
    const headers = ['Hotspot', 'State', 'Examine', 'Use', 'TalkTo'];
    for (const item of itemList) headers.push(item.name);
    headers.push('Hotspot ID');

    ws.columns = headers.map((h, i) => {
        if (i === 0) return { header: h, width: 22 };
        if (i === 1) return { header: h, width: 12 };
        if (i <= 4) return { header: h, width: 40 };
        if (i === headers.length - 1) return { header: h, width: 20 };
        return { header: h, width: 18 };
    });

    const headerRow = ws.getRow(1);
    for (let c = 1; c <= headers.length; c++) {
        const cell = headerRow.getCell(c);
        cell.border = BORDER_THIN;
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (c <= 5) {
            cell.fill = HEADER_FILL;
            cell.font = HEADER_FONT;
        } else if (c === headers.length) {
            cell.fill = ID_FILL;
            cell.font = { bold: true, color: { argb: 'FF808080' } };
        } else {
            cell.fill = ITEM_HEADER_FILL;
            cell.font = HEADER_FONT;
        }
    }
}

// ============================================================================
// 5. MAIN
// ============================================================================

async function main() {
    console.log('=== TSH Dialogue Export ===\n');

    // Load all game data
    const { rooms, items, combinations } = loadGameData();
    const flags = parseFlags();
    const existingLines = await readExistingCombinations();

    // Create workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = 'TSH Dialogue Export Script';
    wb.created = new Date();

    // Tab 1: Instructions
    console.log('\nGenerating Instructions tab...');
    createInstructionsSheet(wb);

    // Tab 2: Flags Reference
    console.log('Generating Flags Reference tab...');
    createFlagsSheet(wb, flags);

    // Tab 3: Global Defaults
    console.log('Generating Global Defaults tab...');
    createGlobalDefaultsSheet(wb, items);

    // Tab 4: Item Combinations
    console.log('Generating Item Combinations tab...');
    createItemCombinationsSheet(wb, items, combinations, existingLines);

    // Room sheets (in defined order, then any unmapped rooms alphabetically)
    console.log('Generating room sheets...');
    const processedRooms = new Set();

    for (const roomId of ROOM_ORDER) {
        if (rooms[roomId]) {
            console.log(`  ${getSheetName(roomId)}...`);
            // Load room source for state annotation parsing
            const roomFile = resolve(ROOMS_DIR, `${roomId}.js`);
            let roomSource = '';
            try {
                roomSource = Deno.readTextFileSync(roomFile);
            } catch {
                console.warn(`  Warning: Cannot read ${roomId}.js source`);
            }
            createRoomSheet(wb, roomId, rooms[roomId], items, roomSource);
            processedRooms.add(roomId);
        }
    }

    // Any rooms not in ROOM_ORDER (newly added)
    const remainingRooms = Object.keys(rooms).filter(id => !processedRooms.has(id)).sort();
    for (const roomId of remainingRooms) {
        console.log(`  ${getSheetName(roomId)} (new)...`);
        // Load room source for state annotation parsing
        const roomFile = resolve(ROOMS_DIR, `${roomId}.js`);
        let roomSource = '';
        try {
            roomSource = Deno.readTextFileSync(roomFile);
        } catch {
            console.warn(`  Warning: Cannot read ${roomId}.js source`);
        }
        createRoomSheet(wb, roomId, rooms[roomId], items, roomSource);
    }

    // Attic placeholder (no room file yet)
    console.log('  Attic (empty template)...');
    createEmptyRoomSheet(wb, 'Attic', items);

    // Save
    console.log(`\nSaving to ${OUTPUT_FILE}...`);
    await wb.xlsx.writeFile(OUTPUT_FILE);

    // Summary
    const totalHotspots = Object.values(rooms).reduce(
        (sum, room) => sum + (room.hotspots ? room.hotspots.length : 0), 0
    );
    console.log(`\n=== Export Complete ===`);
    console.log(`  Rooms:    ${Object.keys(rooms).length} + 1 template (Attic)`);
    console.log(`  Hotspots: ${totalHotspots}`);
    console.log(`  Items:    ${Object.keys(items).length}`);
    console.log(`  Flags:    ${flags.length}`);
    console.log(`  Output:   ${OUTPUT_FILE}`);
}

main().catch(e => {
    console.error('Export failed:', e);
    Deno.exit(1);
});
