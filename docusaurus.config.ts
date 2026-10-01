import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Azeon',
  tagline: 'Exploring complexity. Building solutions.',
  favicon: 'img/favicon.svg',
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  url: 'https://mazizbahoo.github.io',
  baseUrl: '/azeon/',
  organizationName: 'mazizbahoo',
  projectName: 'azeon',
  onBrokenLinks: 'throw',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
      type: 'text/css',
    },
  ],
  plugins: [
    ['./plugins/phase-stats', { docsPath: 'p-vs-np' }],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'p-vs-np',
          routeBasePath: 'p-vs-np',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'Azeon',
      logo: {
        alt: 'Azeon Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/p-vs-np',
          label: 'P vs NP Explained',
          position: 'left',
        },
        { to: '/blog', label: 'Founder Blog', position: 'left' },
        {
          href: 'https://github.com/mazizbahoo/azeon',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Research & Docs',
          items: [
            {
              label: 'The Millennium Prize',
              to: '/p-vs-np/foundations/introduction-to-the-millennium-prize',
            },
            {
              label: 'P vs NP',
              to: '/p-vs-np',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/mazizbahoo',
            },
            {
              label: 'Founder Blog',
              href: '/blog',
            },
            {
              label: 'X (Twitter)',
              href: 'https://twitter.com/azeon_io',
            },
          ],
        },
        {
          title: 'About',
          items: [
            {
              html: `
                <p style="color: var(--ifm-footer-link-color); line-height: 1.6; max-width: 300px; font-size: 0.95rem;">
                  CS student at FC College, Lahore. Founder of Azeon and Azizdevs. Rubik's cube solver. When I am not researching computational complexity, I am probably speedsolving a Rubik's cube.
                </p>
              `,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Azeon. Computed in polynomial time in Lahore by Aziz.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
