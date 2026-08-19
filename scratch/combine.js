const fs = require('fs');
const path = require('path');

const rootDir = 'd:/Badarexpo website';

// CSS Files in order for services.html
const cssFiles = [
    'assets/css/navbar.css',
    'assets/css/tokens.css',
    'assets/css/footer.css',
    'assets/css/page-hero.css',
    'assets/css/services.css',
    'assets/css/comm-widget.css',
    'assets/css/rtl-overrides.css'
];

// JS Files in order for services.html
const jsFiles = [
    'assets/js/comm-widget.js',
    'assets/js/main.js',
    'assets/js/language-manager.js',
    'assets/js/mobile-mega-menu.js',
    'assets/js/services.js'
];

let servicesHtml = fs.readFileSync(path.join(rootDir, 'services.html'), 'utf8');

// Combine CSS
let compiledCss = '/* =============================================================================\n   COMPILED SERVICES PAGE STYLES\n   ============================================================================= */\n\n';

cssFiles.forEach(file => {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    compiledCss += `/* --- ${file} --- */\n` + content + '\n\n';
});

// Combine JS
let compiledJs = '/* =============================================================================\n   COMPILED SERVICES PAGE SCRIPTS\n   ============================================================================= */\n\n';

jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    compiledJs += `// --- ${file} ---\n` + content + '\n\n';
});

// Replace CSS link tags in head with inline style tag safely (using function callback to prevent $ backreference substitution)
const cssLinksRegex = /<!-- GLOBAL STYLES \(shared across every interior page\) -->[\s\S]*?<link rel="stylesheet" href="assets\/css\/rtl-overrides\.css">/;

const styleTag = `<!-- ========================= COMPILED INLINE STYLES ========================= -->
    <style>
${compiledCss}
    </style>`;

servicesHtml = servicesHtml.replace(cssLinksRegex, () => styleTag);

// Replace JS script tags at bottom with inline script tag safely
const jsScriptsRegex = /<script src="assets\/js\/comm-widget\.js"><\/script>[\s\S]*?<script src="assets\/js\/services\.js"><\/script>/;

const scriptTag = `<!-- ========================= COMPILED INLINE SCRIPTS ========================= -->
    <script>
${compiledJs}
    </script>`;

servicesHtml = servicesHtml.replace(jsScriptsRegex, () => scriptTag);

fs.writeFileSync(path.join(rootDir, 'content-staging.txt'), servicesHtml, 'utf8');
console.log('Successfully compiled services.html cleanly into content-staging.txt');
