import {describe, expect, test} from '@jest/globals';

describe('Timezones', () => {
  test('should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});
