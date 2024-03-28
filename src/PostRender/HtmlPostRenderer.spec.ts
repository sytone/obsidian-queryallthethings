/* eslint-disable unicorn/filename-case */
// eslint-disable-next-line import/no-unassigned-import
import 'jest';
import {HtmlPostRenderer} from 'PostRender/HtmlPostRenderer';

describe('HtmlPostRenderer', () => {
  test.each(
    [
      ['This is simple content.'],
      ['- [ ] this is a task [property1:: value1] [property2:: value2]'],
      ['<div><img src="the_url" alt="Image Description"> the name</div>'],
      ['<a href="https://example.com">Click me!</a>'],
      ['<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'],
      ['<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>'],
      ['<table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>John</td><td>30</td></tr><tr><td>Jane</td><td>25</td></tr></tbody></table>'],
      ['<div><img src="the_url" alt="Image Description"> the name</div>'],
      ['<a href="https://example.com">Click me! ٩ (-̮̮̃-̃)۶</a>'],
      ['<a href="https://example.com">Click me! 🔌🗃️🎉⚒️🥂🍾🧍🎄⚙️😀🥳🎂</a>'],
      ['<ul><li>٩ (●̮̮̃•̃)۶</li><li>٩ (͡๏̯͡๏)۶</li></ul>'],
      ['<ol><li>Testing «ταБЬℓσ»: 1&lt;2 &amp; 4+1&gt;3, now 20% off!</li><li>٩ (-̮̮̃•̃).</li></ol>'],
      ['<table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>٩ (-̮̮̃-̃)۶</td><td>٩ (͡๏̯͡๏)۶</td></tr></tbody></table>'],
    ])('render output with %s results', async renderResults => {
    const htmlRenderer = new HtmlPostRenderer();
    const postRenderElement = document.createElement('span');

    const postRenderResults = await htmlRenderer.renderMarkdown(renderResults, postRenderElement, 'sourcefile');
    expect(postRenderResults).toBe(renderResults);
    expect(postRenderElement.innerHTML).toBe(renderResults);
  });
});
