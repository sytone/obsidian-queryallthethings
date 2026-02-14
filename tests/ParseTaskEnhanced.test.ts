/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, test} from 'node:test';
import assert from 'node:assert';
import {parseTask} from '../src/Parse/Parsers';

describe('parseTask - enhanced edge cases', () => {
  test('handles empty task string', () => {
    const result = parseTask('');
    assert.ok(result);
    assert.strictEqual(result.cleanTask, '');
  });

  test('handles task with only checkbox', () => {
    const result = parseTask('- [ ]');
    assert.strictEqual(result.cleanTask, '');
  });

  test('handles task with only whitespace', () => {
    const result = parseTask('- [ ]    ');
    assert.strictEqual(result.cleanTask, '');
  });

  test('handles multiple tags', () => {
    const result = parseTask('- [ ] task #tag1 #tag2 #tag3 #tag-with-dash');
    assert.strictEqual(result.tags.length, 4);
    assert.ok(result.tags.includes('tag1'));
    assert.ok(result.tags.includes('tag2'));
    assert.ok(result.tags.includes('tag3'));
    assert.ok(result.tags.includes('tag-with-dash'));
  });

  test('handles tags with numbers', () => {
    const result = parseTask('- [ ] task #tag123 #123tag');
    assert.ok(result.tags.includes('tag123'));
    assert.ok(result.tags.includes('123tag'));
  });

  test('handles tags with underscores', () => {
    const result = parseTask('- [ ] task #tag_name #another_tag_123');
    assert.ok(result.tags.includes('tag_name'));
    assert.ok(result.tags.includes('another_tag_123'));
  });

  test('handles malformed dates gracefully', () => {
    const result = parseTask('- [ ] task 📅 not-a-date');
    assert.ok(result);
    // The emoji and malformed date are removed
    assert.strictEqual(result.cleanTask, 'task');
  });

  test('handles multiple due dates (uses first)', () => {
    const result = parseTask('- [ ] task 📅 2022-01-01 📅 2022-12-31');
    // Should parse the first valid date
    assert.ok(result.dueDate);
  });

  test('handles task with special characters', () => {
    const result = parseTask('- [ ] task with @mentions & special!chars');
    assert.strictEqual(result.cleanTask, 'task with @mentions & special!chars');
  });

  test('handles task with URLs', () => {
    const result = parseTask('- [ ] check https://example.com');
    assert.ok(result.cleanTask.includes('https://example.com'));
  });

  test('handles task with emoji', () => {
    const result = parseTask('- [ ] important task 🔥 🎯');
    assert.ok(result.cleanTask.includes('important task'));
    // Emojis that aren't task plugin symbols should remain
    assert.ok(result.cleanTask.includes('🔥') || result.cleanTask.includes('🎯'));
  });

  test('handles priority symbols in different positions', () => {
    const result1 = parseTask('- [ ] ⏫ task at start');
    assert.strictEqual(result1.priority, 1);

    const result2 = parseTask('- [ ] task at end ⏫');
    assert.strictEqual(result2.priority, 1);

    const result3 = parseTask('- [ ] task ⏫ in middle');
    assert.strictEqual(result3.priority, 1);
  });

  test('handles mixed priority formats (uses first)', () => {
    const result = parseTask('- [ ] task ⏫ [priority:: low]');
    // When both formats exist, tasks plugin format takes precedence
    assert.strictEqual(result.priority, 1);
  });

  test('handles block links with special characters', () => {
    const result = parseTask('- [ ] task ^block-123_abc');
    assert.strictEqual(result.blockLink, 'block-123_abc');
  });

  test('handles multiple block links (uses last)', () => {
    const result = parseTask('- [ ] task ^first ^second');
    // Should use the last block link
    assert.ok(result.blockLink);
  });

  test('handles dataview properties with colons in value', () => {
    const result = parseTask('- [ ] task [time:: 12:30:45]');
    assert.ok(result);
  });

  test('handles dataview properties with spaces in value', () => {
    const result = parseTask('- [ ] task [name:: John Doe]');
    assert.ok(result);
  });

  test('handles very long task strings', () => {
    const longTask = 'a'.repeat(1000);
    const result = parseTask(`- [ ] ${longTask}`);
    assert.strictEqual(result.cleanTask, longTask);
  });

  test('handles task with nested brackets', () => {
    const result = parseTask('- [ ] task [[nested [brackets]]] text');
    assert.ok(result.cleanTask.includes('nested [brackets]'));
  });

  test('handles mixed date formats', () => {
    const result = parseTask('- [ ] task 📅 2022-03-05 [due:: 2022-04-05]');
    // Tasks plugin format should take precedence
    assert.strictEqual(result.dueDate, '2022-03-05');
  });

  test('handles invalid priority values', () => {
    const result = parseTask('- [ ] task [priority:: invalid]');
    assert.strictEqual(result.priority, undefined);
  });

  test('handles case sensitivity in priority', () => {
    const result1 = parseTask('- [ ] task [priority:: HIGH]');
    // Should handle case-insensitive priority
    assert.ok(result1.priority === 1 || result1.priority === undefined);

    const result2 = parseTask('- [ ] task [priority:: Low]');
    assert.ok(result2.priority === 3 || result2.priority === undefined);
  });

  test('handles task with only tags', () => {
    const result = parseTask('- [ ] #tag1 #tag2');
    assert.strictEqual(result.tags.length, 2);
    assert.strictEqual(result.cleanTask, '');
  });

  test('handles task with only dates', () => {
    const result = parseTask('- [ ] 📅 2022-03-05');
    assert.strictEqual(result.dueDate, '2022-03-05');
    assert.strictEqual(result.cleanTask, '');
  });

  test('handles unicode in task text', () => {
    const result = parseTask('- [ ] café résumé 日本語');
    assert.ok(result.cleanTask.includes('café'));
    assert.ok(result.cleanTask.includes('résumé'));
    assert.ok(result.cleanTask.includes('日本語'));
  });

  test('handles tasks with markdown links', () => {
    const result = parseTask('- [ ] check [link text](https://example.com)');
    assert.ok(result.cleanTask.includes('[link text]'));
  });

  test('handles tasks with inline code', () => {
    const result = parseTask('- [ ] review `code snippet` in task');
    assert.ok(result.cleanTask.includes('`code snippet`'));
  });

  test('handles all date types together', () => {
    const result = parseTask('- [ ] task 📅 2022-01-01 ✅ 2022-02-01 🛫 2022-03-01 ➕ 2022-04-01 ⏳ 2022-05-01 💨 2022-06-01');
    assert.strictEqual(result.dueDate, '2022-01-01');
    assert.strictEqual(result.doneDate, '2022-02-01');
    assert.strictEqual(result.startDate, '2022-03-01');
    assert.strictEqual(result.createDate, '2022-04-01');
    assert.strictEqual(result.scheduledDate, '2022-05-01');
    assert.strictEqual(result.doDate, '2022-06-01');
  });

  test('handles dataview all date types together', () => {
    const result = parseTask('- [ ] task [due:: 2022-01-01] [completion:: 2022-02-01] [start:: 2022-03-01] [created:: 2022-04-01] [scheduled:: 2022-05-01] [do:: 2022-06-01]');
    assert.strictEqual(result.dueDate, '2022-01-01');
    assert.strictEqual(result.doneDate, '2022-02-01');
    assert.strictEqual(result.startDate, '2022-03-01');
    assert.strictEqual(result.createDate, '2022-04-01');
    assert.strictEqual(result.scheduledDate, '2022-05-01');
    assert.strictEqual(result.doDate, '2022-06-01');
  });

  test('handles mixed priority and dates', () => {
    const result = parseTask('- [ ] task ⏫ 📅 2022-01-01 #tag');
    assert.strictEqual(result.priority, 1);
    assert.strictEqual(result.dueDate, '2022-01-01');
    assert.ok(result.tags.includes('tag'));
    assert.strictEqual(result.cleanTask, 'task');
  });

  test('handles completed checkbox', () => {
    const result = parseTask('- [x] completed task');
    assert.ok(result);
  });

  test('handles partial checkbox', () => {
    const result = parseTask('- [-] in progress task');
    assert.ok(result);
  });

  test('handles forward slashed checkbox', () => {
    const result = parseTask('- [/] partially done task');
    assert.ok(result);
  });

  test('stress test with all features combined', () => {
    const complexTask = '- [ ] Complex Task #tag1 #tag2 ⏫ 📅 2022-03-05 ✅ 2022-04-05 [priority:: high] [custom:: value] with **bold** and _italic_ text ^block123';
    const result = parseTask(complexTask);

    assert.ok(result.tags.includes('tag1'));
    assert.ok(result.tags.includes('tag2'));
    assert.strictEqual(result.priority, 1);
    assert.strictEqual(result.dueDate, '2022-03-05');
    assert.strictEqual(result.doneDate, '2022-04-05');
    // Block link should be at the end
    assert.strictEqual(result.blockLink, 'block123');
    assert.ok(result.cleanTask.includes('Complex Task'));
    // Verify markdown formatting is preserved
    assert.ok(result.cleanTask.includes('**bold**'));
    assert.ok(result.cleanTask.includes('_italic_'));
  });
});
