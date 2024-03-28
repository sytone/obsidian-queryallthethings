/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/no-unassigned-import
import 'jest';
import {MicromarkPostRenderer} from 'PostRender/MicromarkPostRenderer';

describe('MicromarkPostRenderer', () => {
  test.each(
    [
      ['This is simple content.', '<p>This is simple content.</p>'],
    ])('render output with %s results', async (renderResults, expectedPostRenderResults) => {
    const micromarkPostRenderer = new MicromarkPostRenderer();
    const postRenderElement = document.createElement('span');

    const postRenderResults = await micromarkPostRenderer.renderMarkdown(renderResults, postRenderElement, 'sourcefile');
    expect(postRenderResults).toBe(expectedPostRenderResults);
    expect(postRenderElement.innerHTML).toBe(expectedPostRenderResults);
  });
});
