import fs from 'fs';

const METADATA_FILE = './kmp-metadata.json';
const OUTPUT_FILE = './keyword-mapping.json';

function main() {
    try {
        const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
        const metadata = JSON.parse(raw);

        const allKeywords = new Set<string>();

        // 1. Gather all unique raw keywords
        for (const filename in metadata) {
            const entry = metadata[filename];
            if (entry.keywords && Array.isArray(entry.keywords)) {
                entry.keywords.forEach((kw: string) => {
                    let cleanKw = kw.trim();
                    // Remove wrapping quotes if present
                    if (cleanKw.startsWith('"') && cleanKw.endsWith('"')) {
                        cleanKw = cleanKw.slice(1, -1);
                    }
                    if (cleanKw) {
                        allKeywords.add(cleanKw);
                    }
                });
            }
        }

        // 2. Group by lowercase version
        const groups: Record<string, string[]> = {};
        allKeywords.forEach(kw => {
            const lower = kw.toLowerCase();
            if (!groups[lower]) {
                groups[lower] = [];
            }
            groups[lower].push(kw);
        });

        // 3. Create the simplified structure
        // Select the most capitalized version as the default "name" (heuristic)
        // or just the first one if unsure.
        const mapping = Object.keys(groups).sort().map(lowerKey => {
            const variants = groups[lowerKey];

            // Heuristic: Pick the variant that starts with an uppercase letter, 
            // or the shortest one, or just the first one. 
            // Let's sort to put 'Racing' before 'racing'
            variants.sort();

            // Usually we want the capitalized Version if it exists
            const preferred = variants.find(v => v[0] === v[0].toUpperCase()) || variants[0];

            return {
                name: preferred,
                value: variants
            };
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mapping, null, 2), 'utf-8');
        console.log(`Generated mapping template with ${mapping.length} entries in ${OUTPUT_FILE}`);

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

main();
