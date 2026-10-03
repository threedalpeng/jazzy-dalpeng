import { copyFileSync, writeFileSync } from 'node:fs';

// GitHub Pages serves index.html at the project root and 404.html for SPA routes.
copyFileSync('build/404.html', 'build/index.html');
writeFileSync('build/.nojekyll', '');
