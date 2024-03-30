/* eslint-disable @typescript-eslint/no-unsafe-call */
import {micromark} from 'micromark';
import {gfm, gfmHtml} from 'micromark-extension-gfm';
import {html as wikiHtml, syntax as wiki} from 'micromark-extension-wiki-link';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {toString} from 'mdast-util-to-string';
import * as wikiLink from 'mdast-util-wiki-link';
import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {type Component} from 'obsidian';

export class MicromarkPostRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string, component: Component) {
    const html = this.markdown2html(renderResults);
    element.innerHTML = html;
    return html;
  }

  private markdown2html(markdown?: string, isInline = false): string {
    if (markdown === undefined || markdown === null) {
      return '';
    }

    const html = micromark(markdown, {
      allowDangerousHtml: true,
      extensions: [
        wiki({aliasDivider: '|'}),
        gfm(),
      ],
      htmlExtensions: [
        wikiHtml({
          permalinks: [],
          wikiLinkClassName: 'internal-link data-link-icon data-link-icon-after data-link-text',
          hrefTemplate: (permalink: string) => `${permalink}`,
          pageResolver: (name: string) => [name],
        }),
        gfmHtml(),
      ],
    });

    if (isInline && !markdown.includes('\n\n')) {
      return html.replace(/<p>|<\/p>/g, '');
    }

    return html;
  }
}

export function markdown2html(markdown?: string, isInline = false): string {
  if (markdown === undefined || markdown === null) {
    return '';
  }

  const html = micromark(markdown, {
    allowDangerousHtml: true,
    extensions: [
      wiki({aliasDivider: '|'}),
      gfm(),
    ],
    htmlExtensions: [
      wikiHtml({
        permalinks: [],
        wikiLinkClassName: 'internal-link data-link-icon data-link-icon-after data-link-text',
        hrefTemplate: (permalink: string) => `${permalink}`,
        pageResolver: (name: string) => [name],
      }),
      gfmHtml(),
    ],
  });

  if (isInline && !markdown.includes('\n\n')) {
    return html.replace(/<p>|<\/p>/g, '');
  }

  return html;
}

export function markdown2text(markdown?: string): string {
  if (markdown === undefined || markdown === null) {
    return '';
  }

  const tree = fromMarkdown(markdown, {
    extensions: [wiki()],
    mdastExtensions: [wikiLink.fromMarkdown()],
  });
  return toString(tree);
}
