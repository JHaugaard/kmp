import fs from 'fs';

const METADATA_FILE = './kmp-metadata.json';
const OUTPUT_FILE = './keyword-mapping.json';

function main() {
    const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
    const metadata = JSON.parse(raw);

    const allKeywords = new Set<string>();
    for (const filename in metadata) {
        const entry = metadata[filename];
        if (entry.keywords && Array.isArray(entry.keywords)) {
            entry.keywords.forEach((kw: string) => {
                let cleanKw = kw.trim();
                if (cleanKw.startsWith('"') && cleanKw.endsWith('"')) {
                    cleanKw = cleanKw.slice(1, -1);
                }
                if (cleanKw) allKeywords.add(cleanKw);
            });
        }
    }

    const sortedRaw = Array.from(allKeywords).sort();

    // Mapping logic:
    // Key: Canonical Name
    // Value: Array of variants
    const maps: Record<string, Set<string>> = {};

    function add(canonical: string, variant: string) {
        if (!maps[canonical]) maps[canonical] = new Set();
        maps[canonical].add(variant);
    }

    // Pass 1: Case-insensitive grouping and manual merges
    sortedRaw.forEach(kw => {
        const lower = kw.toLowerCase();

        // Manual consolidation rules
        if (lower === 'cathy' || lower === 'catherine') {
            add('Catherine', kw);
        } else if (lower === 'pat martin' || lower === 'pat') {
            add('Pat', kw);
        } else if (lower === 'jack martin' || lower === 'jack') {
            add('Jack', kw);
        } else if (lower === 'jeanette martin' || lower === 'jeanette') {
            add('Jeanette', kw);
        } else if (lower === 'racecar' || lower === 'racing') {
            add('Racing', kw);
        } else if (lower === 'dam' || lower === 'mcconaughy dam') {
            add('McConaughy Dam', kw);
        } else if (lower === 'kline') {
            add('Kline', kw);
        } else if (lower === 'flowers') {
            add('Flowers', kw);
        } else if (lower === 'air show') {
            add('Air Show', kw);
        } else if (lower === 'dragline') {
            add('Dragline', kw);
        } else if (lower === 'parade') {
            add('Parade', kw);
        } else if (lower === 'trophies') {
            add('Trophies', kw);
        } else if (lower === 'washing machine') {
            add('Washing machine', kw);
        } else if (lower === 'winter') {
            add('Winter', kw);
        } else if (lower === 'roger') {
            add('Roger', kw);
        } else {
            // Default: Simple case consolidation using capitalized version as canonical
            const canonical = kw.charAt(0).toUpperCase() + kw.slice(1);
            add(canonical, kw);
        }
    });

    const result = Object.keys(maps).sort().map(name => ({
        name: name,
        value: Array.from(maps[name]).sort()
    }));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`Draft mapping generated in ${OUTPUT_FILE}`);
}

main();
