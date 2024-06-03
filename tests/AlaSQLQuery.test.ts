
/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';

describe('alasql helpers', () => {
  it('parse wiki link with path and alias', () => {
    const result = parseWikiLinkFromText('sdf sd fsd fsdf [[the/link/to/basename|Display Name]] sdf sd fsd fsd f');

    console.log(JSON.stringify(result));
    assert.strictEqual(result, 'the/link/to/basename|Display Name');
    const linkAndDisplay = splitOnUnescapedPipe(result);
    assert.strictEqual(linkAndDisplay[0], 'the/link/to/basename');
    assert.strictEqual(linkAndDisplay[1], 'Display Name');
  });

  it('parse wiki link with path', () => {
    const re = /\[\[([^[\]]*?)\]\]/u;
    const result = re.exec('[[Projects/Painting The House]]');
    console.log(JSON.stringify(result));
    assert.strictEqual(result?.length, 2);
    if (result) {
      assert.strictEqual(result[1], 'Projects/Painting The House');
      const linkAndDisplay = splitOnUnescapedPipe(result[1]);
      assert.strictEqual(linkAndDisplay[0], 'Projects/Painting The House');
    }
  });

  it('has display name check', () => {
    const result = parseWikiLinkFromText('[[Projects/Painting The House|Painting The House]]');
    const linkAndDisplay = splitOnUnescapedPipe(result!);
    assert.strictEqual(linkAndDisplay.length === 2 && linkAndDisplay[1] !== undefined, true);

    const result2 = parseWikiLinkFromText('[[Projects/Painting The House]]');
    const linkAndDisplay2 = splitOnUnescapedPipe(result2!);
    assert.strictEqual(linkAndDisplay2.length === 2 && linkAndDisplay2[1] === undefined, true);
  });

  /** Split on unescaped pipes in an inner link. */
  function splitOnUnescapedPipe(link: string): [string, string | undefined] {
    let pipe = -1;
    while ((pipe = link.indexOf('|', pipe + 1)) >= 0) {
      if (pipe > 0 && link[pipe - 1] === '\\') {
        continue;
      }

      return [link.slice(0, Math.max(0, pipe)).replace(/\\\|/g, '|'), link.slice(Math.max(0, pipe + 1))];
    }

    return [link.replace(/\\\|/g, '|'), undefined];
  }

  function parseWikiLinkFromText(text: string): string | undefined {
    const re = /\[\[([^[\]]*?)\]\]/u;

    const result = re.exec(text);
    if (result) {
      return result[1];
    }
  }
});
