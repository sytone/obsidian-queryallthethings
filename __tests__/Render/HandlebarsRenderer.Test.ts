/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {describe, expect, test} from '@jest/globals';
import {type IQattCodeBlock} from 'QattCodeBlock';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';

describe('handlebars helpers', () => {
  test('micromark parses correctly', () => {
    HandlebarsRenderer.registerHandlebarsHelpers();
    const testCodeBlock: IQattCodeBlock = {
      template: '{{{#micromark inline="true"}}} {{{task}}} [[{{{page}}}|📝]] {{{/micromark}}}',
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

    const html = renderEngine?.renderTemplate(`  {
      task: "This is a **thing** to do",
      page: "folder/SomePage.md"
    }`) ?? 'Unknown error or exception has occurred.';

    expect(html).toBe('TasK');
  });
});
