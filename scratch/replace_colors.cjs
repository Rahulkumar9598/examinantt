const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Rebranding colors:
            // Navy (#0B4F97) -> Teal 700 (#0F766E)
            content = content.replace(/#0B4F97/gi, '#0F766E');
            
            // Blue (#1D64D0) -> Teal 600 (#0D9488)
            content = content.replace(/#1D64D0/gi, '#0D9488');
            
            // Soft Blue bg (blue-50) -> teal-50
            content = content.replace(/blue-50/g, 'teal-50');
            // Soft Blue bg (blue-100) -> teal-100
            content = content.replace(/blue-100/g, 'teal-100');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir('d:/examinantclone/examinant/src');
console.log('Done replacement.');
