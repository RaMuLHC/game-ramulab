const fs = require('fs');
const path = require('path');

function parseFrontmatter(content) {
  const meta = {};
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    const yaml = match[1];
    yaml.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join(':').trim();
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        
        // Handle array syntax [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
        meta[key] = value;
      }
    });
  }
  return meta;
}

const projectRoot = path.resolve(__dirname, '..');
const mdDir = path.join(projectRoot, 'public', 'markdown');

const dirs = ['recruitment', 'log'];
const manifest = {
  recruitment: [],
  log: []
};

dirs.forEach(dir => {
  const dirPath = path.join(mdDir, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const meta = parseFrontmatter(content);
        
        const item = {
          id: path.basename(file, '.md'),
          filename: file,
          markdownFile: `/markdown/${dir}/${file}`,
          title: meta.title || path.basename(file, '.md'),
          date: meta.date || new Date().toISOString().split('T')[0],
          ruleset: meta.ruleset || 'D&D 5e',
          emoji: meta.emoji || '📜',
          summary: meta.summary || '',
          ...meta
        };
        manifest[dir].push(item);
      }
    });
    
    // Sort items by date descending (newest first)
    manifest[dir].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
});

const outputPath = path.join(mdDir, 'manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Successfully generated manifest.json with ${manifest.recruitment.length} recruitment(s) and ${manifest.log.length} log(s) at ${outputPath}`);
