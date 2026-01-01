import fs from 'fs';
import path from 'path';

const METADATA_FILE = './kmp-metadata.json';
const OUTPUT_FILE = './keywords.md';

function main() {
    try {
        const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
        const metadata = JSON.parse(raw);

        const allKeywords = new Set<string>();

        for (const filename in metadata) {
            const entry = metadata[filename];
            if (entry.keywords && Array.isArray(entry.keywords)) {
                entry.keywords.forEach((kw: string) => {
                    // Clean up quotes if present (e.g. "Niagara Falls")
                    let cleanKw = kw.trim();
                    if (cleanKw.startsWith('"') && cleanKw.endsWith('"')) {
                        cleanKw = cleanKw.slice(1, -1);
                    }
                    if (cleanKw) {
                        allKeywords.add(cleanKw);
                    }
                });
            }
        }

        const sortedKeywords = Array.from(allKeywords).sort((a, b) => a.localeCompare(b));

        // Group by first letter for better readability
        const groups: Record<string, string[]> = {};
        for (const kw of sortedKeywords) {
            const firstChar = kw.charAt(0).toUpperCase();
            const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
            if (!groups[key]) groups[key] = [];
            groups[key].push(kw);
        }

        let mdContent = '# Project Keywords\n\nTotal unique keywords: ' + sortedKeywords.length + '\n\n';

        const sortedKeys = Object.keys(groups).sort();
        for (const key of sortedKeys) {
            mdContent += `## ${key}\n\n`;
            // multi-column style usually implies just a list in MD, but we can do a comma separated list or bullets
            // Bullets take a lot of vertical space. 
            // Let's do a simple bullet list.
            for (const kw of groups[key]) {
                mdContent += `- ${kw}\n`;
            }
            mdContent += '\n';
        }

        fs.writeFileSync(OUTPUT_FILE, mdContent, 'utf-8');
        console.log(`Successfully wrote ${sortedKeywords.length} keywords to ${OUTPUT_FILE}`);

    } catch (error: any) {
        console.error("Error processing keywords:", error.message);
    }
}

main();
