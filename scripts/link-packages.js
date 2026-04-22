#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const packages = ['fractal', 'mandelbrot', 'nunjucks', 'handlebars', 'core', 'web'];
const rootDir = path.join(__dirname, '..');

packages.forEach((pkg) => {
    const src = path.join(rootDir, 'packages', pkg);
    const dest = path.join(rootDir, 'node_modules', '@frctl', pkg);

    try {
        // Create @frctl directory if it doesn't exist
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        // Remove existing symlink/directory
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }

        // Create symlink
        fs.symlinkSync(src, dest, 'junction');
        console.log(`✓ Linked @frctl/${pkg}`);
    } catch (error) {
        console.error(`✗ Failed to link @frctl/${pkg}:`, error.message);
    }
});

console.log('\nPackage linking complete!');
