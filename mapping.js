const fs = require('fs');
const path = require('path');

const characterRoot = path.join(__dirname, 'characters');
const folders = ['car_cats', 'jefferyverse', 'other', 'ecliptica', 'cbcs'];
const mapping = {};

folders.forEach(folder => {
    const folderPath = path.join(characterRoot, folder);
    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                const name = path.basename(file, '.html');
                mapping[name] = folder;
            }
        });
    }
});

fs.writeFileSync(path.join(__dirname, 'tagToCharacterMapping.json'), JSON.stringify(mapping, null, 2));
console.log('Mapping file created!');
