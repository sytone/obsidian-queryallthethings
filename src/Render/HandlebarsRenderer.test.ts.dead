/* eslint-disable unicorn/filename-case */
// eslint-disable-next-line import/no-unassigned-import
import 'jest';
import {type IQattCodeBlock} from 'QattCodeBlock';
import {HandlebarsHelpers} from 'Render/HandlebarsHelpers';
import Handlebars, {type HelperOptions} from 'handlebars';

function generateCodeBlock(template: string): IQattCodeBlock {
  return {
    template,
    renderEngine: 'handlebars',
    customJSForSql: [],
    customJSForHandlebars: [],
    query: '',
    queryEngine: '',
    postRenderFormat: '',
    logLevel: '',
    codeBlockContent: '',
    replaceCodeBlock: '',
    queryDataSource: '',
    id: '',
    queryFile: undefined,
    templateFile: undefined,
    replaceTargetPath: undefined,
  };
}

describe('handlebars helpers', () => {
  it('capitalize parses correctly', () => {
    HandlebarsHelpers.registerCapitalize();
    // OLD: const testCodeBlock = generateCodeBlock('{{#each result}}{{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}}{{/each}}');
    const testCodeBlock = generateCodeBlock('{{capitalize result.0.task}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'some sentence',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    expect(output).toBe('Some sentence');
  });

  it('lowercase parses correctly', () => {
    HandlebarsHelpers.registerLowercase();
    // OLD: const testCodeBlock = generateCodeBlock('{{#each result}}{{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}}{{/each}}');
    const testCodeBlock = generateCodeBlock('{{lowercase result.0.task}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    expect(output).toBe('this is a **thing** to do');
  });

  it('uppercase parses correctly', () => {
    HandlebarsHelpers.registerUppercase();
    // OLD: const testCodeBlock = generateCodeBlock('{{#each result}}{{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}}{{/each}}');
    const testCodeBlock = generateCodeBlock('{{uppercase result.0.task}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    expect(output).toBe('THIS IS A **THING** TO DO');
  });

  it('uppercase parses correctly', () => {
    HandlebarsHelpers.registerStringify();
    // OLD: const testCodeBlock = generateCodeBlock('{{#each result}}{{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}}{{/each}}');
    const testCodeBlock = generateCodeBlock('{{stringify result}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    expect(output).toBe(`[
  {
    "task": "This is a **thing** to do",
    "page": "folder/SomePage.md"
  }
]`);
  });

  // It('stringify parses correctly', () => {
  //   HandlebarsRenderer.registerHandlebarsHelpers();
  //   const testCodeBlock: IQattCodeBlock = {
  //     template: '{{stringify complexObject}}',
  //     renderEngine: 'handlebars',
  //     customJSForSql: [],
  //     customJSForHandlebars: [],
  //     query: '',
  //     queryEngine: '',
  //     postRenderFormat: '',
  //     logLevel: '',
  //     codeBlockContent: '',
  //     replaceCodeBlock: '',
  //     queryDataSource: '',
  //     id: '',
  //   };

  //   const renderEngine: IRenderer = RenderFactory.getRenderer(testCodeBlock);

  //   const html = renderEngine?.renderTemplate([{
  //     task: 'This is a **thing** to do',
  //     page: 'folder/SomePage.md',
  //   }]) ?? 'Unknown error or exception has occurred.';

  //   expect(html).toBe('This is a <strong>thing</strong> to do <a href="folder/SomePage.md" class="internal-link data-link-icon data-link-icon-after data-link-text new">📝</a>');
  // });
});
