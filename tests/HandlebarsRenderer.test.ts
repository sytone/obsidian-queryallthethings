
/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {type IQattCodeBlock} from 'QattCodeBlock';
import {capitalize} from 'Render/HandlebarsHelpers/Capitalize';
import {lowercase} from 'Render/HandlebarsHelpers/Lowercase';
import {uppercase} from 'Render/HandlebarsHelpers/Uppercase';
import {stringify} from 'Render/HandlebarsHelpers/Stringify';
import Handlebars from 'handlebars';
import {eq, ge, gt, le, lt, ne} from 'Render/HandlebarsHelpers/RelationalOperators';

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

  // Relational Operators
  it('eq parses correctly', () => {
    Handlebars.registerHelper('eq', eq);

    const testCodeBlock = generateCodeBlock('{{#eq \'test string\' \'test string\'}}equal{{else}}ERROR{{/eq}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'equal');
  });

  it('ne parses correctly', () => {
    Handlebars.registerHelper('ne', ne);

    const testCodeBlock = generateCodeBlock('{{#ne \'test string one\' \'test string two\'}}notequal{{else}}ERROR{{/ne}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'notequal');
  });

  it('ge parses greater than correctly', () => {
    Handlebars.registerHelper('ge', ge);

    const testCodeBlock = generateCodeBlock('{{#ge 23 20}}greaterthan{{else}}ERROR{{/ge}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'greaterthan');
  });

  it('ge parses equal correctly', () => {
    Handlebars.registerHelper('ge', ge);

    const testCodeBlock = generateCodeBlock('{{#ge 23 23}}equal{{else}}ERROR{{/ge}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'equal');
  });

  it('gt parses greater than correctly', () => {
    Handlebars.registerHelper('gt', gt);

    const testCodeBlock = generateCodeBlock('{{#gt 23 20}}greaterthan{{else}}ERROR{{/gt}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'greaterthan');
  });

  it('le parses less than correctly', () => {
    Handlebars.registerHelper('le', le);

    const testCodeBlock = generateCodeBlock('{{#le 20 23}}less than{{else}}ERROR{{/le}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'less than');
  });

  it('le parses equal correctly', () => {
    Handlebars.registerHelper('le', le);

    const testCodeBlock = generateCodeBlock('{{#le 20 20}}equal{{else}}ERROR{{/le}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'equal');
  });

  it('lt parses less than correctly', () => {
    Handlebars.registerHelper('lt', lt);

    const testCodeBlock = generateCodeBlock('{{#lt 20 23}}less than{{else}}ERROR{{/lt}}');

    const compliedTemplate = Handlebars.compile(testCodeBlock.template);
    const result = [{}];
    const output = compliedTemplate({result});

    assert.strictEqual(output, 'less than');
  });
});
