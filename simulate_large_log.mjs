import fs from 'fs';
import path from 'path';

const LOG_FILE = 'project_log.md';
const TARGET_SIZE_KB = 12; // Just over 10KB

function generateLargeLog() {
    let content = `# Project Log\n\n## 2026-01-24\n| Time | Feature | Reasoning |\n| :--- | :--- | :--- |\n| 11:32 | Project Initiated | Context Gateway Protocol Established. |\n`;

    // Fill with dummy data to exceed 10KB
    let entryCount = 0;
    while (Buffer.byteLength(content, 'utf8') < TARGET_SIZE_KB * 1024) {
        entryCount++;
        content += `| 12:00 | Simulation Entry ${entryCount} | This is a dummy entry generated to test the auto-archive protocol. We need to exceed 10KB of text data to trigger the cleanup rule defined in .cursorrules. |\n`;
    }

    fs.writeFileSync(LOG_FILE, content);
    console.log(`Generated ${LOG_FILE} with size: ${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(2)}KB`);
}

generateLargeLog();
