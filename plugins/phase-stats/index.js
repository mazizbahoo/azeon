// Counts the published posts in each phase folder of the P vs NP docs
// (e.g. p-vs-np/02-np-completeness/*.mdx) so the phase cards never need
// a manual count. Drafts and unlisted posts are skipped.
const fs = require('fs');
const path = require('path');

const POST_FILE = /^[^_].*\.mdx?$/;
const PHASE_DIR = /^(\d{2})-/;

function isHidden(source) {
  const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return !!frontMatter && /^(draft|unlisted):\s*true\s*$/m.test(frontMatter[1]);
}

function countPosts(docsDir) {
  const counts = {};
  for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
    const match = entry.isDirectory() && entry.name.match(PHASE_DIR);
    if (!match) continue;
    const phaseDir = path.join(docsDir, entry.name);
    counts[match[1]] = fs.readdirSync(phaseDir)
      .filter(file => POST_FILE.test(file))
      .filter(file => !isHidden(fs.readFileSync(path.join(phaseDir, file), 'utf8')))
      .length;
  }
  return counts;
}

module.exports = function phaseStatsPlugin(context, { docsPath }) {
  const docsDir = path.resolve(context.siteDir, docsPath);
  return {
    name: 'phase-stats',
    getPathsToWatch() {
      return [path.join(docsDir, '**/*.{md,mdx}')];
    },
    async loadContent() {
      return countPosts(docsDir);
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData({ publishedPosts: content });
    },
  };
};
