/* eslint-disable unicorn/filename-case */
import {type IQattCodeBlock} from 'QattCodeBlock';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';

describe('handlebars helpers', () => {
  it('micromark parses correctly', () => {
    HandlebarsRenderer.registerHandlebarsHelpers();
    const testCodeBlock: IQattCodeBlock = {
      template: '{{#each result}}{{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}}{{/each}}',
      renderEngine: 'handlebars',
      customJSForSql: [],
      customJSForHandlebars: [],
      query: '',
      queryEngine: '',
      postRenderFormat: '',
      logLevel: '',
      codeBlockContent: '',
    };

    const renderEngine: IRenderer = RenderFactory.getRenderer(testCodeBlock);

    const html = renderEngine?.renderTemplate([{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }]) ?? 'Unknown error or exception has occurred.';

    expect(html).toBe('This is a <strong>thing</strong> to do <a href="folder/SomePage.md" class="internal-link data-link-icon data-link-icon-after data-link-text new">📝</a>');
  });
});
