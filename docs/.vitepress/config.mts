import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar';
import pkg from '../../package.json';

const vitepressSidebarOptions = {
  /* Options... */
  documentRootPath: '/docs',
  useTitleFromFrontmatter: true,
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,
  sortMenusByFrontmatterOrder: true,
  excludeFilesByFrontmatterFieldName: 'exclude',
  excludeFiles: ['_header.md'],
  collapsed: true
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Query All The Things",
  description: "Obsidian plugin to allow you to query your notes, lists, tasks and more using SQL and render using handlebars",
  cleanUrls: true,
  base: '/obsidian-queryallthethings/',
  appearance: 'dark',
  markdown: {
    config(md) {
      const defaultCodeInline = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet('v-pre', '')
        return defaultCodeInline(tokens, idx, options, env, self)
      }
      const defaultCodeBlock = md.renderer.rules.code_block!

      md.renderer.rules.code_block  = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet('v-pre', '')
        return defaultCodeBlock(tokens, idx, options, env, self)
      }

    }
  },
  themeConfig: {
    logo: '/qatt_logo_v2.png',
    sidebar: generateSidebar(vitepressSidebarOptions),
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tables', link: '/data-tables' },
      { text: 'Examples', link: '/examples-tutorials' },
      { text: 'Query Reference', link: '/queries' },
      { text: 'Render Reference', link: '/templates' },
      {
        text: pkg.version,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/sytone/obsidian-queryallthethings/blob/main/CHANGELOG.md'
          },
          {
            text: 'Contributing',
            link: 'https://github.com/sytone/obsidian-queryallthethings/blob/main/CONTRIBUTING.md'
          }
        ]
      }

    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sytone/obsidian-queryallthethings' }
    ]
  }
})
