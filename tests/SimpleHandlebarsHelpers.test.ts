/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import Handlebars, {type HelperOptions} from 'handlebars';
import {toInt} from '../src/Render/HandlebarsHelpers/ToInt.js';
import {pad} from '../src/Render/HandlebarsHelpers/Pad.js';
import {formatDate} from '../src/Render/HandlebarsHelpers/FormatDate.js';

describe('toInt', () => {
  it('parses valid integer strings', () => {
    assert.strictEqual(toInt('42'), 42);
    assert.strictEqual(toInt('0'), 0);
    assert.strictEqual(toInt('-10'), -10);
    assert.strictEqual(toInt('999'), 999);
  });

  it('parses strings with leading zeros', () => {
    assert.strictEqual(toInt('007'), 7);
    assert.strictEqual(toInt('0123'), 123);
    assert.strictEqual(toInt('000'), 0);
  });

  it('handles negative numbers', () => {
    assert.strictEqual(toInt('-5'), -5);
    assert.strictEqual(toInt('-100'), -100);
    // -0 is a special case in JavaScript
    assert.strictEqual(toInt('-0'), -0);
  });

  it('handles invalid strings', () => {
    assert.ok(Number.isNaN(toInt('abc')));
    assert.ok(Number.isNaN(toInt('')));
    // ParseInt('12.5') returns 12, not NaN
    assert.strictEqual(toInt('12.5'), 12);
  });

  it('parses strings with whitespace', () => {
    // ParseInt behavior with whitespace
    assert.strictEqual(toInt('  42  '), 42);
    assert.strictEqual(toInt('\t123\n'), 123);
  });

  it('handles partial numeric strings', () => {
    // ParseInt stops at first non-digit
    assert.strictEqual(toInt('42abc'), 42);
    assert.strictEqual(toInt('123xyz'), 123);
  });

  it('handles large numbers', () => {
    assert.strictEqual(toInt('999999999'), 999_999_999);
    assert.strictEqual(toInt('2147483647'), 2_147_483_647);
  });

  it('handles edge cases', () => {
    assert.ok(Number.isNaN(toInt('NaN')));
    assert.ok(Number.isNaN(toInt('Infinity')));
    assert.ok(Number.isNaN(toInt('undefined')));
  });
});

describe('pad', () => {
  it('pads with default space character', () => {
    const options: HelperOptions = {
      fn: () => '',
      inverse: () => '',
      hash: {},
    };

    const result = pad(3, options);
    assert.strictEqual(result.toString(), '   ');
  });

  it('pads with custom character', () => {
    const options: HelperOptions = {
      fn: () => '',
      inverse: () => '',
      hash: {padWith: '-'},
    };

    const result = pad(5, options);
    assert.strictEqual(result.toString(), '-----');
  });

  it('pads with zero count', () => {
    const options: HelperOptions = {
      fn: () => '',
      inverse: () => '',
      hash: {},
    };

    const result = pad(0, options);
    assert.strictEqual(result.toString(), '');
  });

  it('pads with multiple character string', () => {
    const options: HelperOptions = {
      fn: () => '',
      inverse: () => '',
      hash: {padWith: 'ab'},
    };

    const result = pad(3, options);
    assert.strictEqual(result.toString(), 'ababab');
  });

  it('pads with emoji', () => {
    const options: HelperOptions = {
      fn: () => '',
      inverse: () => '',
      hash: {padWith: '🎉'},
    };

    const result = pad(3, options);
    assert.strictEqual(result.toString(), '🎉🎉🎉');
  });

  it('handles negative count gracefully', () => {
    const options: HelperOptions = {
      fn: () => '',
      inverse: () => '',
      hash: {},
    };

    // String.repeat with negative throws RangeError
    assert.throws(() => {
      pad(-1, options);
    }, RangeError);
  });

  it('works with Handlebars template', () => {
    Handlebars.registerHelper('pad', pad);

    const template = Handlebars.compile('{{pad 5 padWith="*"}}');
    const result = template({});

    assert.strictEqual(result, '*****');
  });

  it('works in template context', () => {
    Handlebars.registerHelper('pad', pad);

    const template = Handlebars.compile('{{pad 3 padWith="-"}}');
    const result = template({});

    assert.strictEqual(result, '---');
  });
});

describe('formatDate', () => {
  it('formats Unix timestamp to yyyy-MM-dd', () => {
    // 2024-01-15 12:00:00 UTC
    const timestamp = 1_705_320_000_000;
    const result = formatDate(timestamp);

    assert.strictEqual(result, '2024-01-15');
  });

  it('formats different dates correctly', () => {
    // 2023-12-25 00:00:00 UTC
    const christmas = 1_703_462_400_000;
    assert.strictEqual(formatDate(christmas), '2023-12-25');

    // 2024-07-04 00:00:00 UTC
    const july4 = 1_720_051_200_000;
    assert.strictEqual(formatDate(july4), '2024-07-04');
  });

  it('handles epoch time (0)', () => {
    const result = formatDate(0);
    assert.strictEqual(result, '1970-01-01');
  });

  it('handles recent timestamps', () => {
    // Just verify format is correct (yyyy-MM-dd)
    const recent = Date.now();
    const result = formatDate(recent);

    // Check format matches yyyy-MM-dd pattern
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(result));
  });

  it('formats dates with single-digit days and months', () => {
    // 2024-01-05 00:00:00 UTC
    const timestamp = 1_704_412_800_000;
    const result = formatDate(timestamp);

    assert.strictEqual(result, '2024-01-05');
  });

  it('handles year boundaries', () => {
    // 2023-12-31 23:59:59 UTC
    const newYearsEve = 1_704_067_199_000;
    assert.strictEqual(formatDate(newYearsEve), '2023-12-31');

    // 2024-01-01 00:00:00 UTC
    const newYearsDay = 1_704_067_200_000;
    assert.strictEqual(formatDate(newYearsDay), '2024-01-01');
  });

  it('handles negative timestamps (before epoch)', () => {
    // 1969-12-31 00:00:00 UTC
    const beforeEpoch = -86_400_000;
    const result = formatDate(beforeEpoch);

    assert.strictEqual(result, '1969-12-31');
  });

  it('handles very large timestamps', () => {
    // 2099-12-31 00:00:00 UTC
    const future = 4_102_358_400_000;
    const result = formatDate(future);

    assert.strictEqual(result, '2099-12-31');
  });

  it('preserves leading zeros in formatted output', () => {
    // 2024-03-05 00:00:00 UTC
    const timestamp = 1_709_596_800_000;
    const result = formatDate(timestamp);

    // Should have leading zeros
    assert.strictEqual(result, '2024-03-05');
    assert.ok(result.includes('-03-'));
    assert.ok(result.includes('-05'));
  });
});
