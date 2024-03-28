/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/no-unassigned-import
import 'jest';
import {RawPostRenderer} from 'PostRender/RawPostRenderer';

describe('RawPostRenderer', () => {
  test.each(
    [
      ['This is simple content.'],
    ])('render output with %s results', async renderResults => {
    const rawPostRenderer = new RawPostRenderer();
    const postRenderElement = document.createElement('span');

    const postRenderResults = await rawPostRenderer.renderMarkdown(renderResults, postRenderElement, 'sourcefile');
    expect(postRenderResults).toBe(renderResults);
    expect(postRenderElement.innerHTML).toBe(renderResults);
  });
});
