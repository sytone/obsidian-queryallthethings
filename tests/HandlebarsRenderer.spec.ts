
import {describe, test} from 'mocha';
import {expect} from 'chai';
import {type IQattCodeBlock} from '../src/QattCodeBlock';
import {HandlebarsRenderer} from '../src/Render/HandlebarsRenderer';
import {type IRenderer} from '../src/Render/IRenderer';
import {RenderFactory} from '../src/Render/RenderFactory';

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

    expect(html).to.equal('TasK');
  });
});
