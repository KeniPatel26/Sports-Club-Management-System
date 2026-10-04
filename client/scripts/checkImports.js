import fs from 'fs';
import * as LucideIcons from 'lucide-react';

const content = fs.readFileSync('src/pages/staff/frontdesk/FrontDeskDashboard.jsx', 'utf8');

const matches = content.match(/<([A-Z][a-zA-Z0-9]+)/g) || [];
const usedComponents = Array.from(new Set(matches.map(m => m.slice(1))));

const importMatches = content.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/);
const importedLucide = importMatches ? importMatches[1].split(',').map(s => s.trim()).filter(Boolean) : [];

const missing = [];
for (const comp of usedComponents) {
  if (LucideIcons[comp] && !importedLucide.includes(comp)) {
    missing.push(comp);
  }
}
console.log('Missing Lucide imports in FrontDeskDashboard.jsx:', missing);
