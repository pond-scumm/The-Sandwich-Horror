// Dialogue Parser - Converts plain text dialogue files to dialogue tree objects
TSH.DialogueParser = {
    parse(textContent) {
        const nodes = {};
        const nodeRegex = /^===\s+(\w+)\s+===$/gm;

        // Split content into sections by node markers
        const sections = [];
        let lastIndex = 0;
        let match;

        while ((match = nodeRegex.exec(textContent)) !== null) {
            if (lastIndex > 0) {
                sections.push({
                    key: sections[sections.length - 1].key,
                    content: textContent.substring(lastIndex, match.index).trim()
                });
            }
            sections.push({ key: match[1], startIndex: match.index });
            lastIndex = nodeRegex.lastIndex;
        }

        // Handle last section
        if (sections.length > 0) {
            sections[sections.length - 1].content = textContent.substring(lastIndex).trim();
        }

        // Parse each node section
        for (const section of sections) {
            if (!section.content) continue;

            const node = this._parseNode(section.content);
            nodes[section.key] = node;
        }

        return nodes;
    },

    _parseNode(content) {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const node = {
            options: []
        };

        let i = 0;

        // Check for npc_state annotation at start of node
        if (lines[i] && lines[i].startsWith('# npc_state:')) {
            const stateMatch = lines[i].match(/^# npc_state:\s*(\w+)$/);
            if (stateMatch) {
                node.npcState = stateMatch[1];
                i++;
            }
        }

        // Parse options
        while (i < lines.length) {
            if (lines[i].startsWith('-')) {
                const option = this._parseOption(lines, i);
                node.options.push(option.option);
                i = option.nextIndex;
            } else {
                i++;
            }
        }

        return node;
    },

    _parseOption(lines, startIndex) {
        const optionText = lines[startIndex].substring(1).trim(); // Remove '-'
        const option = {
            text: optionText,
            heroLine: null,
            npcResponse: [],
            nextNode: null,
            exit: false
        };

        const annotations = {
            requires: null,
            setFlags: [],
            addItems: [],
            removeItems: [],
            once: false
        };

        let i = startIndex + 1;

        // Parse annotations and dialogue lines
        while (i < lines.length) {
            const line = lines[i];

            // Stop at next option
            if (line.startsWith('-')) {
                break;
            }

            // Parse annotations
            if (line.startsWith('#')) {
                this._parseAnnotation(line, annotations);
                i++;
                continue;
            }

            // Parse routing
            if (line.startsWith('>')) {
                const target = line.substring(1).trim();
                if (target === 'END') {
                    option.exit = true;
                } else {
                    option.nextNode = target;
                }
                i++;
                continue;
            }

            // Parse dialogue lines (speaker: text)
            const speakerMatch = line.match(/^(\w+):\s*(.*)$/);
            if (speakerMatch) {
                const speaker = speakerMatch[1].toLowerCase();
                const text = speakerMatch[2];

                if (speaker === 'nate') {
                    option.heroLine = text || '';
                } else {
                    // NPC line
                    if (text) {
                        option.npcResponse.push(text);
                    }
                }
                i++;
                continue;
            }

            i++;
        }

        // Process annotations into condition and actions
        if (annotations.requires) {
            option.condition = this._parseCondition(annotations.requires);
        }

        if (annotations.setFlags.length > 0 || annotations.addItems.length > 0 ||
            annotations.removeItems.length > 0 || annotations.once) {
            option.actions = {
                setFlags: annotations.setFlags,
                addItems: annotations.addItems,
                removeItems: annotations.removeItems,
                once: annotations.once
            };
        }

        // Convert empty npcResponse array to null for consistency
        if (option.npcResponse.length === 0) {
            option.npcResponse = null;
        }

        return { option, nextIndex: i };
    },

    _parseAnnotation(line, annotations) {
        if (line.startsWith('# requires:')) {
            annotations.requires = line.substring('# requires:'.length).trim();
        } else if (line.startsWith('# set:')) {
            const flag = line.substring('# set:'.length).trim();
            annotations.setFlags.push(flag);
        } else if (line.startsWith('# add:')) {
            const item = line.substring('# add:'.length).trim();
            annotations.addItems.push(item);
        } else if (line.startsWith('# remove:')) {
            const item = line.substring('# remove:'.length).trim();
            annotations.removeItems.push(item);
        } else if (line === '# once') {
            annotations.once = true;
        }
    },

    _parseCondition(requiresText) {
        // Split by comma and trim
        const conditions = requiresText.split(',').map(c => c.trim());

        return (scene) => {
            for (const cond of conditions) {
                // Negated flag check
                if (cond.startsWith('!') && !cond.includes(':')) {
                    const flag = cond.substring(1);
                    if (TSH.State.getFlag(flag)) {
                        return false;
                    }
                    continue;
                }

                // Negated has:item check
                if (cond.startsWith('!has:')) {
                    const item = cond.substring('!has:'.length);
                    if (TSH.State.hasItem(item)) {
                        return false;
                    }
                    continue;
                }

                // has:item check
                if (cond.startsWith('has:')) {
                    const item = cond.substring('has:'.length);
                    if (!TSH.State.hasItem(item)) {
                        return false;
                    }
                    continue;
                }

                // npc_state check
                if (cond.startsWith('npc_state:')) {
                    const parts = cond.substring('npc_state:'.length).split(':');
                    if (parts.length === 2) {
                        const [npcId, state] = parts;
                        if (TSH.State.getNPCState(npcId) !== state) {
                            return false;
                        }
                    }
                    continue;
                }

                // visited:room check
                if (cond.startsWith('visited:')) {
                    const room = cond.substring('visited:'.length);
                    if (!TSH.State.hasVisitedRoom(room)) {
                        return false;
                    }
                    continue;
                }

                // Regular flag check
                if (!TSH.State.getFlag(cond)) {
                    return false;
                }
            }

            return true;
        };
    }
};
