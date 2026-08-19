/**
 * decompile.js
 * Reads content-staging.txt and writes each section back to its
 * respective file in the repo.
 *
 * CSS files  → assets/css/*.css
 * JS  files  → assets/js/*.js
 * HTML body  → contact.html (with <link> + <script src> tags restored)
 *
 * NOTE: Does NOT run git. Does NOT commit anything.
 */

const fs   = require('fs');
const path = require('path');

// ── Paths ───────────────────────────────────────────────────────────────────
const ROOT    = path.join(__dirname, '..');
const STAGING = path.join(ROOT, 'content-staging.txt');

// ── Read staging file ────────────────────────────────────────────────────────
const raw   = fs.readFileSync(STAGING, 'utf8');
// Normalise line endings → \n, then split
const lines = raw.replace(/\r\n/g, '\n').split('\n');

// Helper: 1-indexed [start, end) → lines (0-indexed [start-1, end-1))
// Strips the leading file-marker comment and trailing blank lines.
function extractSection(start1, end1) {
    // convert to 0-indexed
    let from = start1 - 1;   // inclusive
    let to   = end1   - 1;   // exclusive (first line of NEXT section)

    // slice
    let chunk = lines.slice(from, to);

    // Drop the very first line if it is a file-marker comment
    // e.g.  /* --- assets/css/tokens.css --- */
    //        // --- assets/js/main.js ---
    if (chunk.length > 0 && /^(\/\*|\/\/)\s*---/.test(chunk[0].trim())) {
        chunk = chunk.slice(1);
    }

    // Trim trailing blank lines (but keep one trailing newline on write)
    while (chunk.length > 0 && chunk[chunk.length - 1].trim() === '') {
        chunk.pop();
    }

    return chunk.join('\n') + '\n';
}

// Helper: write a file, logging what was done
function write(relPath, content) {
    const abs = path.join(ROOT, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, 'utf8');
    console.log(`  ✔  wrote  ${relPath}  (${content.length} bytes)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.  CSS FILES
//     Each entry: [ filename, startLine1, endLine1_exclusive ]
//     Line numbers are 1-indexed, endLine is the first line of the NEXT section.
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── CSS files ───────────────────────────────────────');

const cssSections = [
    // file name            start   end (exclusive = next section start)
    ['tokens.css',             52,   171],
    ['navbar.css',            171,  1492],
    ['footer.css',           1492,  1897],
    ['page-hero.css',        1897,  2057],
    ['contact.css',          2057,  3577],
    ['form-feedback.css',    3577,  3652],
    ['comm-widget.css',      3652,  3915],
    ['rtl-overrides.css',    3915,  4491],  // 4491 = the </style> line
];

for (const [file, start, end] of cssSections) {
    const content = extractSection(start, end);
    write(`assets/css/${file}`, content);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.  JS FILES
//     Same convention; endLine = first line of next section / </script>.
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── JS files ────────────────────────────────────────');

const jsSections = [
    // file name                  start   end (exclusive)
    ['comm-widget.js',            5690,  5826],
    ['main.js',                   5826,  6325],
    ['language-manager.js',       6325,  6534],
    ['form-submit-manager.js',    6534,  6743],
    ['contact.js',                6743,  6815],
    ['mobile-mega-menu.js',       6815,  7073],  // 7073 = </script> line
];

for (const [file, start, end] of jsSections) {
    const content = extractSection(start, end);
    write(`assets/js/${file}`, content);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3.  contact.html
//     Structure:
//       • Head metadata  (staging lines 1-45, before the <style> block)
//       • CSS <link> tags (hardcoded — same order as original contact.html)
//       • </head>
//       • <body>
//       • Inner body content (staging lines 4495-5683)
//       • <script src=""> tags (same order as original contact.html)
//       • <!-- footer.php END -->
//       • </body>
//       • </html>
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── contact.html ────────────────────────────────────');

// 3a. Head metadata (0-indexed: 0 .. 44  →  staging lines 1-45)
const headMeta = lines.slice(0, 45).join('\n');

// 3b. CSS link block (restored, same as original)
const cssLinks = `    <!-- ========================= GLOBAL STYLES ========================= -->
    <link rel="stylesheet" href="assets/css/navbar.css">
    <link rel="stylesheet" href="assets/css/tokens.css">
    <link rel="stylesheet" href="assets/css/footer.css">
    <link rel="stylesheet" href="assets/css/page-hero.css">

    <!-- ========================= PAGE SPECIFIC STYLES ========================= -->
    <link rel="stylesheet" href="assets/css/contact.css">
    <link rel="stylesheet" href="assets/css/form-feedback.css">
    <!-- Phase 8: RTL overrides - additive only, zero effect unless dir="rtl" -->
    <link rel="stylesheet" href="assets/css/comm-widget.css">
    <link rel="stylesheet" href="assets/css/rtl-overrides.css">
</head>`;

// 3c. Body content: staging lines 4495-5683 (0-indexed: 4494 .. 5682)
//     Line 4494 = <body>, 4495 = first inner line, 5683 = </div> (comm-widget close)
//     We take 4495-5683 (the inner content only) and wrap our own <body> / </body>.
const bodyInner = lines.slice(4494, 5683).join('\n');

// 3d. Script tags (restored, same as original)
const scriptTags = `    <script src="assets/js/comm-widget.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/language-manager.js"></script>
    <script src="assets/js/form-submit-manager.js"></script>
    <script src="assets/js/contact.js"></script>
    <script src="assets/js/mobile-mega-menu.js"></script>
    <!-- ========================= [TEMPLATE: footer.php END] ========================= -->
</body>

</html>`;

// 3e. Assemble contact.html
const contactHtml =
    headMeta + '\n' +
    cssLinks + '\n' +
    '\n' +
    '<body>\n' +
    bodyInner + '\n' +
    scriptTags + '\n';

write('contact.html', contactHtml);

console.log('\n✅  Decompile complete — all files updated.\n');
