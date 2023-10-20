// eslint-disable-next-line import/no-unassigned-import
import 'jest';

describe('Timezones', () => {
  test('should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});
