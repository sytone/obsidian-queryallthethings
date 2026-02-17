/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import Handlebars from 'handlebars';
import {capitalize} from '../src/Render/HandlebarsHelpers/Capitalize.js';
import {lowercase} from '../src/Render/HandlebarsHelpers/Lowercase.js';
import {uppercase} from '../src/Render/HandlebarsHelpers/Uppercase.js';
import {trim} from '../src/Render/HandlebarsHelpers/Trim.js';
import {stringify} from '../src/Render/HandlebarsHelpers/Stringify.js';
import {eq, ne, gt, ge, lt, le} from '../src/Render/HandlebarsHelpers/RelationalOperators.js';

describe('capitalize - enhanced', () => {
  it('capitalizes first letter of simple string', () => {
    assert.strictEqual(capitalize('hello'), 'Hello');
    assert.strictEqual(capitalize('world'), 'World');
  });

  it('handles already capitalized strings', () => {
    assert.strictEqual(capitalize('Hello'), 'Hello');
    assert.strictEqual(capitalize('HELLO'), 'HELLO');
  });

  it('handles single character strings', () => {
    assert.strictEqual(capitalize('a'), 'A');
    assert.strictEqual(capitalize('Z'), 'Z');
  });

  it('handles empty string', () => {
    assert.strictEqual(capitalize(''), '');
  });

  it('handles strings starting with numbers', () => {
    assert.strictEqual(capitalize('123test'), '123test');
  });

  it('handles strings starting with special characters', () => {
    assert.strictEqual(capitalize('@mention'), '@mention');
    assert.strictEqual(capitalize('#hashtag'), '#hashtag');
  });

  it('handles strings with markdown formatting', () => {
    assert.strictEqual(capitalize('**bold**'), '**bold**');
    assert.strictEqual(capitalize('_italic_'), '_italic_');
  });

  it('handles strings with leading whitespace', () => {
    assert.strictEqual(capitalize('  hello'), '  hello');
  });

  it('preserves rest of string unchanged', () => {
    assert.strictEqual(capitalize('hELLO wORLD'), 'HELLO wORLD');
  });
});

describe('lowercase - enhanced', () => {
  it('converts entire string to lowercase', () => {
    assert.strictEqual(lowercase('HELLO WORLD'), 'hello world');
    assert.strictEqual(lowercase('TeSt'), 'test');
  });

  it('handles already lowercase strings', () => {
    assert.strictEqual(lowercase('hello'), 'hello');
  });

  it('handles empty string', () => {
    assert.strictEqual(lowercase(''), '');
  });

  it('preserves markdown formatting', () => {
    assert.strictEqual(lowercase('**BOLD**'), '**bold**');
    assert.strictEqual(lowercase('_ITALIC_'), '_italic_');
  });

  it('handles strings with numbers', () => {
    assert.strictEqual(lowercase('ABC123XYZ'), 'abc123xyz');
  });

  it('handles special characters', () => {
    assert.strictEqual(lowercase('HELLO-WORLD!'), 'hello-world!');
  });

  it('handles unicode characters', () => {
    assert.strictEqual(lowercase('CAFÉ'), 'café');
  });
});

describe('uppercase - enhanced', () => {
  it('converts entire string to uppercase', () => {
    assert.strictEqual(uppercase('hello world'), 'HELLO WORLD');
    assert.strictEqual(uppercase('TeSt'), 'TEST');
  });

  it('handles already uppercase strings', () => {
    assert.strictEqual(uppercase('HELLO'), 'HELLO');
  });

  it('handles empty string', () => {
    assert.strictEqual(uppercase(''), '');
  });

  it('preserves markdown formatting', () => {
    assert.strictEqual(uppercase('**bold**'), '**BOLD**');
    assert.strictEqual(uppercase('_italic_'), '_ITALIC_');
  });

  it('handles strings with numbers', () => {
    assert.strictEqual(uppercase('abc123xyz'), 'ABC123XYZ');
  });

  it('handles special characters', () => {
    assert.strictEqual(uppercase('hello-world!'), 'HELLO-WORLD!');
  });

  it('handles unicode characters', () => {
    assert.strictEqual(uppercase('café'), 'CAFÉ');
  });
});

describe('trim', () => {
  it('removes leading whitespace', () => {
    assert.strictEqual(trim('  hello'), 'hello');
    assert.strictEqual(trim('\thello'), 'hello');
    assert.strictEqual(trim('\nhello'), 'hello');
  });

  it('removes trailing whitespace', () => {
    assert.strictEqual(trim('hello  '), 'hello');
    assert.strictEqual(trim('hello\t'), 'hello');
    assert.strictEqual(trim('hello\n'), 'hello');
  });

  it('removes both leading and trailing whitespace', () => {
    assert.strictEqual(trim('  hello  '), 'hello');
    assert.strictEqual(trim('\t\nhello\n\t'), 'hello');
  });

  it('preserves internal whitespace', () => {
    assert.strictEqual(trim('  hello world  '), 'hello world');
    assert.strictEqual(trim('  hello  world  '), 'hello  world');
  });

  it('handles empty string', () => {
    assert.strictEqual(trim(''), '');
  });

  it('handles string with only whitespace', () => {
    assert.strictEqual(trim('   '), '');
    assert.strictEqual(trim('\t\n'), '');
  });

  it('handles string without whitespace', () => {
    assert.strictEqual(trim('hello'), 'hello');
  });

  it('handles non-string values by converting to string', () => {
    assert.strictEqual(trim('123'), '123');
  });
});

describe('stringify - enhanced', () => {
  it('stringifies objects with proper indentation', () => {
    const object = {name: 'Alice', age: 30};
    const result = stringify(object);

    assert.ok(result.toString().includes('"name": "Alice"'));
    assert.ok(result.toString().includes('"age": 30'));
  });

  it('stringifies arrays', () => {
    const array = [1, 2, 3];
    const result = stringify(array);

    assert.ok(result.toString().includes('1'));
    assert.ok(result.toString().includes('2'));
    assert.ok(result.toString().includes('3'));
  });

  it('stringifies nested objects', () => {
    const object = {
      person: {
        name: 'Bob',
        address: {
          city: 'NYC',
        },
      },
    };
    const result = stringify(object);

    assert.ok(result.toString().includes('"name": "Bob"'));
    assert.ok(result.toString().includes('"city": "NYC"'));
  });

  it('handles null', () => {
    const result = stringify(null);
    assert.strictEqual(result.toString(), 'null');
  });

  it('handles undefined', () => {
    const result = stringify(undefined);
    assert.strictEqual(result.toString(), 'undefined');
  });

  it('handles primitive values', () => {
    assert.strictEqual(stringify('hello').toString(), '"hello"');
    assert.strictEqual(stringify(42).toString(), '42');
    assert.strictEqual(stringify(true).toString(), 'true');
  });

  it('handles empty object', () => {
    const result = stringify({});
    assert.strictEqual(result.toString().trim(), '{}');
  });

  it('handles empty array', () => {
    const result = stringify([]);
    assert.strictEqual(result.toString().trim(), '[]');
  });

  it('handles cyclical objects', () => {
    const object: any = {name: 'test'};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    object.self = object;

    const result = stringify(object);
    assert.ok(result.toString().includes('[Cyclical]'));
  });
});

describe('relational operators - enhanced', () => {
  describe('eq', () => {
    it('compares equal numbers', () => {
      Handlebars.registerHelper('eq', eq);
      const template = Handlebars.compile('{{#eq 5 5}}equal{{else}}not equal{{/eq}}');
      assert.strictEqual(template({}), 'equal');
    });

    it('compares unequal numbers', () => {
      Handlebars.registerHelper('eq', eq);
      const template = Handlebars.compile('{{#eq 5 6}}equal{{else}}not equal{{/eq}}');
      assert.strictEqual(template({}), 'not equal');
    });

    it('handles string comparison', () => {
      Handlebars.registerHelper('eq', eq);
      const template = Handlebars.compile('{{#eq "test" "test"}}equal{{else}}not equal{{/eq}}');
      assert.strictEqual(template({}), 'equal');
    });

    it('handles null and undefined', () => {
      Handlebars.registerHelper('eq', eq);
      const template = Handlebars.compile('{{#eq null null}}equal{{else}}not equal{{/eq}}');
      assert.strictEqual(template({}), 'equal');
    });
  });

  describe('ne', () => {
    it('compares unequal values', () => {
      Handlebars.registerHelper('ne', ne);
      const template = Handlebars.compile('{{#ne 5 6}}not equal{{else}}equal{{/ne}}');
      assert.strictEqual(template({}), 'not equal');
    });

    it('compares equal values', () => {
      Handlebars.registerHelper('ne', ne);
      const template = Handlebars.compile('{{#ne 5 5}}not equal{{else}}equal{{/ne}}');
      assert.strictEqual(template({}), 'equal');
    });
  });

  describe('gt', () => {
    it('compares greater than', () => {
      Handlebars.registerHelper('gt', gt);
      const template = Handlebars.compile('{{#gt 10 5}}greater{{else}}not greater{{/gt}}');
      assert.strictEqual(template({}), 'greater');
    });

    it('handles equal values', () => {
      Handlebars.registerHelper('gt', gt);
      const template = Handlebars.compile('{{#gt 5 5}}greater{{else}}not greater{{/gt}}');
      assert.strictEqual(template({}), 'not greater');
    });

    it('handles negative numbers', () => {
      Handlebars.registerHelper('gt', gt);
      const template = Handlebars.compile('{{#gt -1 -5}}greater{{else}}not greater{{/gt}}');
      assert.strictEqual(template({}), 'greater');
    });
  });

  describe('ge', () => {
    it('handles greater than', () => {
      Handlebars.registerHelper('ge', ge);
      const template = Handlebars.compile('{{#ge 10 5}}gte{{else}}not gte{{/ge}}');
      assert.strictEqual(template({}), 'gte');
    });

    it('handles equal values', () => {
      Handlebars.registerHelper('ge', ge);
      const template = Handlebars.compile('{{#ge 5 5}}gte{{else}}not gte{{/ge}}');
      assert.strictEqual(template({}), 'gte');
    });

    it('handles less than', () => {
      Handlebars.registerHelper('ge', ge);
      const template = Handlebars.compile('{{#ge 3 5}}gte{{else}}not gte{{/ge}}');
      assert.strictEqual(template({}), 'not gte');
    });
  });

  describe('lt', () => {
    it('compares less than', () => {
      Handlebars.registerHelper('lt', lt);
      const template = Handlebars.compile('{{#lt 5 10}}less{{else}}not less{{/lt}}');
      assert.strictEqual(template({}), 'less');
    });

    it('handles equal values', () => {
      Handlebars.registerHelper('lt', lt);
      const template = Handlebars.compile('{{#lt 5 5}}less{{else}}not less{{/lt}}');
      assert.strictEqual(template({}), 'not less');
    });

    it('handles negative numbers', () => {
      Handlebars.registerHelper('lt', lt);
      const template = Handlebars.compile('{{#lt -5 -1}}less{{else}}not less{{/lt}}');
      assert.strictEqual(template({}), 'less');
    });
  });

  describe('le', () => {
    it('handles less than', () => {
      Handlebars.registerHelper('le', le);
      const template = Handlebars.compile('{{#le 3 5}}lte{{else}}not lte{{/le}}');
      assert.strictEqual(template({}), 'lte');
    });

    it('handles equal values', () => {
      Handlebars.registerHelper('le', le);
      const template = Handlebars.compile('{{#le 5 5}}lte{{else}}not lte{{/le}}');
      assert.strictEqual(template({}), 'lte');
    });

    it('handles greater than', () => {
      Handlebars.registerHelper('le', le);
      const template = Handlebars.compile('{{#le 10 5}}lte{{else}}not lte{{/le}}');
      assert.strictEqual(template({}), 'not lte');
    });

    it('compares decimal numbers', () => {
      Handlebars.registerHelper('le', le);
      const template = Handlebars.compile('{{#le 3.5 5.5}}lte{{else}}not lte{{/le}}');
      assert.strictEqual(template({}), 'lte');
    });
  });
});
