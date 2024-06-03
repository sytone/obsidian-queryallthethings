
/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {type IQattCodeBlock} from 'QattCodeBlock';
import {capitalize} from 'Render/HandlebarsHelpers/Capitalize';
import {lowercase} from 'Render/HandlebarsHelpers/Lowercase';
import {uppercase} from 'Render/HandlebarsHelpers/Uppercase';
import {stringify} from 'Render/HandlebarsHelpers/Stringify';
import Handlebars from 'handlebars';

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
    replaceCodeBlock: false,
    queryDataSource: '',
    id: '',
    queryFile: undefined,
    templateFile: undefined,
    replaceTargetPath: undefined,
    replaceType: '',
    internalQueryRenderChildVersion: 0,
  };
}

describe('handlebars helpers', () => {
  it('capitalize parses correctly', () => {
    assert.strictEqual(1, 1);

    Handlebars.registerHelper('capitalize', capitalize);

    const testCodeBlock = generateCodeBlock('{{capitalize result.0.task}}');
    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'some sentence',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});
    assert.strictEqual(output, 'Some sentence');
  });

  it('lowercase parses correctly', () => {
    Handlebars.registerHelper('lowercase', lowercase);

    const testCodeBlock = generateCodeBlock('{{lowercase result.0.task}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    assert.strictEqual(output, 'this is a **thing** to do');
  });

  it('uppercase parses correctly', () => {
    Handlebars.registerHelper('uppercase', uppercase);

    const testCodeBlock = generateCodeBlock('{{uppercase result.0.task}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    assert.strictEqual(output, 'THIS IS A **THING** TO DO');
  });

  it('stringify parses correctly', () => {
    Handlebars.registerHelper('stringify', stringify);

    const testCodeBlock = generateCodeBlock('{{stringify result}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{
      task: 'This is a **thing** to do',
      page: 'folder/SomePage.md',
    }];

    const output = compliedTemplate({result});

    assert.strictEqual(output, `[
  {
    "task": "This is a **thing** to do",
    "page": "folder/SomePage.md"
  }
]`);
  });
});
