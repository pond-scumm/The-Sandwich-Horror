# Task: Implement Dialogue Import System

Read ARCHITECTURE_GUIDE.md and CREATIVE_BIBLE.md to refresh on the project.

We're implementing a dialogue editing system for The Sandwich Horror. The system uses an Excel spreadsheet (TSH_Hotspot_Dialogue_Template.xlsx) as the authoring tool for all hotspot dialogue.

Open TSH_Hotspot_Dialogue_Template.xlsx and read the Instructions tab to understand the format, tags, and conventions.

The task: Build an import pipeline that reads the spreadsheet and converts it into game data that RoomScene can use for hotspot responses.

Specifically:
1. Write a Node.js (or Python) script that reads the .xlsx file and exports a JSON file per room containing all hotspot dialogue, keyed by hotspot ID and state
2. The JSON should include the fallback chain: room-specific lines > item fail defaults > global action defaults
3. Update RoomScene to load dialogue from these JSON files instead of inline response strings in room data files
4. Update the existing room data files (interior.js, earls_yard.js, etc.) to reference the new dialogue system for their hotspot responses
5. Preserve all existing dialogue — don't lose any lines that are already written in the room files

Do NOT implement all of these at once. Start with step 1 only, let me test, then we'll proceed.

Before writing any code:
- Grep the codebase to understand how hotspot responses currently work
- Check how room data files currently define lookResponse, useResponse, etc.
- Propose your approach and get my approval before implementing

## Standard Rules

Before recommending any next steps, you should:
1. Grep for existing implementations
2. Compare code against documentation
3. Identify any gaps
4. Follow established patterns for all changes
5. Maintain consistent tone and architecture
6. Test after each change

Before making any changes, ask:
1. Does this follow the established architecture?
2. Should this be in GameState?
3. Is dialogue following the standard and humorous?
4. Will this work on mobile?
5. Am I using consistent naming?
