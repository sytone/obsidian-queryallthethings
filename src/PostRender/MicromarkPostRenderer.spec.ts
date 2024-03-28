/* eslint-disable unicorn/filename-case */
// eslint-disable-next-line import/no-unassigned-import
import 'jest';
import {MicromarkPostRenderer} from 'PostRender/MicromarkPostRenderer';

describe('MicromarkPostRenderer', () => {
  test.each(
    [
      ['This is simple content.', 'This is simple content.'],
    ])('render output with %s results', async (renderResults, expectedPostRenderResults) => {
    const micromarkPostRenderer = new MicromarkPostRenderer();
    const postRenderElement = document.createElement('span');

    const postRenderResults = await micromarkPostRenderer.renderMarkdown(renderResults, postRenderElement, 'sourcefile');
    expect(postRenderResults).toBe(expectedPostRenderResults);
    expect(postRenderElement.innerHTML).toBe(renderResults);
  });
});
