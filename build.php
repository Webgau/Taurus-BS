<?php declare(strict_types=1);
/**
 * Static Site Builder
 * Compiles HTML templates to static HTML files
 */

$srcDir = __DIR__ . '/src';
$publicDir = __DIR__ . '/public';

/**
 * Load a partial HTML file
 */
function loadPartial(string $name, string $srcDir): string
{
    $path = $srcDir . '/partials/' . $name . '.html';
    return file_exists($path) ? file_get_contents($path) : '';
}

/**
 * Extract front matter (title, etc.) from page content
 */
function extractFrontMatter(string $content): array
{
    $title = 'Taurus';

    // Extract title from HTML comment: <!-- title: Page Title -->
    if (preg_match('/<!--\s*title:\s*(.+?)\s*-->/i', $content, $matches)) {
        $title = trim($matches[1]);
        $content = preg_replace('/<!--\s*title:\s*.+?\s*-->\s*/i', '', $content);
    }

    return ['title' => $title, 'content' => trim($content)];
}

/**
 * Render a page with its layout
 */
function renderPage(string $pagePath, string $srcDir): string
{
    $pageContent = file_get_contents($pagePath);
    $frontMatter = extractFrontMatter($pageContent);

    // Load layout
    $layout = file_get_contents($srcDir . '/layouts/base.html');

    // Load partials
    $header = loadPartial('header', $srcDir);
    $sidenav = loadPartial('sidenav', $srcDir);
    $devpanel = loadPartial('dev-panel', $srcDir);

    // Replace placeholders
    $html = str_replace(
        ['{{title}}', '{{header}}', '{{sidenav}}', '{{devpanel}}', '{{content}}'],
        [$frontMatter['title'], $header, $sidenav, $devpanel, $frontMatter['content']],
        $layout
    );

    return $html;
}

/**
 * Build all pages recursively
 */
function build(string $srcDir, string $publicDir): void
{
    $pagesDir = $srcDir . '/pages';
    $pages = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($pagesDir, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    $count = 0;

    foreach ($pages as $page) {
        if ($page->getExtension() !== 'html') continue;

        $relativePath = str_replace($pagesDir . '/', '', $page->getPathname());
        $pageName = pathinfo($relativePath, PATHINFO_FILENAME);

        $html = renderPage($page->getPathname(), $srcDir);

        // Output filename: default_dashboard.html -> index.html, others keep name
        if (str_contains($pageName, 'default_')) {
            $outputFile = 'index.html';
        } else {
            $outputFile = $pageName . '.html';
        }

        $outputPath = $publicDir . '/' . $outputFile;

        file_put_contents($outputPath, $html);
        echo "Built: {$outputPath}\n";
        $count++;
    }

    echo "\n✓ {$count} page(s) built successfully.\n";
}

// Run build
echo "Building static HTML...\n\n";
build($srcDir, $publicDir);
