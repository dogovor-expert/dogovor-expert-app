const fs = require('fs');
let content = fs.readFileSync('src/lib/renderDocument.ts', 'utf8');

// Fix the escapeHtml function - replace the malformed HTML entities with proper ones
content = content.replace(
  '.replace(/&/g, "&")',
  '.replace(/&/g, "&")'
);
content = content.replace(
  '.replace(/</g, "<")',
  '.replace(/</g, "<")'
);
content = content.replace(
  '.replace(/>/g, ">")',
  '.replace(/>/g, ">")'
);
content = content.replace(
  '.replace(/"/g, """)',
  '.replace(/"/g, "\"")'
);
content = content.replace(
  ".replace(/'/g, '\u0027')",
  ".replace(/'/g, \"'\")"
);

fs.writeFileSync('src/lib/renderDocument.ts', content);
console.log('Fixed');