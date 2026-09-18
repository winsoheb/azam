const fs = require('fs');
const { execSync } = require('child_process');
const marked = require('marked');
const htmlToDocx = require('html-to-docx');
const path = require('path');

async function main() {
  console.log("Reading docs.md...");
  let markdown = fs.readFileSync('docs.md', 'utf8');

  // Find all mermaid blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  let match;
  let counter = 1;
  
  const replacements = [];

  while ((match = mermaidRegex.exec(markdown)) !== null) {
    const mermaidCode = match[1];
    const mmdFile = `diagram_${counter}.mmd`;
    const pngFile = `diagram_${counter}.png`;

    console.log(`Generating diagram ${counter}...`);
    fs.writeFileSync(mmdFile, mermaidCode);

    try {
      // Run mermaid cli
      execSync(`npx -y @mermaid-js/mermaid-cli -i ${mmdFile} -o ${pngFile}`, { stdio: 'inherit' });
      
      // We will replace the whole block with the local image reference
      replacements.push({
        original: match[0],
        replacement: `![Diagram ${counter}](./${pngFile})`
      });
    } catch (e) {
      console.error(`Failed to generate diagram ${counter}:`, e);
    }
    
    counter++;
  }

  // Replace blocks
  for (const r of replacements) {
    markdown = markdown.replace(r.original, r.replacement);
  }

  fs.writeFileSync('docs_with_images.md', markdown);
  console.log("Wrote docs_with_images.md");
}

main().catch(console.error);
