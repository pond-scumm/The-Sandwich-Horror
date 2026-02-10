// Dialogue Loader - Loads and caches dialogue files
TSH.DialogueLoader = {
    _cache: {},

    async load(npcId) {
        if (this._cache[npcId]) {
            return this._cache[npcId];
        }

        const url = `src/data/dialogue/${npcId}.txt`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load dialogue: ${url} (${response.status})`);
            }

            const text = await response.text();
            const tree = TSH.DialogueParser.parse(text);

            this._cache[npcId] = tree;
            return tree;
        } catch (error) {
            console.error(`Error loading dialogue for ${npcId}:`, error);
            // Return fallback tree
            return {
                start: {
                    options: [
                        {
                            text: "[Dialogue error]",
                            heroLine: "",
                            npcResponse: null,
                            exit: true
                        }
                    ]
                }
            };
        }
    }
};
