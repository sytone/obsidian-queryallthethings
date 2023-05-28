import {describe, expect, test} from '@jest/globals';
import {parseTask} from 'Parse/Parsers';

describe('parse functions', () => {
  test('task parses correctly', () => {
    const parsedTask = parseTask('this is a task #TasK #test priority:: high 📅 2022-03-05 ✅ 2022-04-05');

    expect(parsedTask.tags[0]).toBe('TasK');
    expect(parsedTask.tagsNormalized[0]).toBe('task');
    expect(parsedTask.dueDate).toBe('2022-03-05');
    expect(parsedTask.doneDate).toBe('2022-04-05');
    expect(parsedTask.startDate).toBe(undefined);
    expect(parsedTask.createDate).toBe(undefined);
    expect(parsedTask.scheduledDate).toBe(undefined);
    expect(parsedTask.priority).toBe(1);
  });

  test('task parses are fast', () => {
    const sampleTask = 'this is a task #TasK #test priority:: high 📅 2022-03-05 ✅ 2022-04-05';
    let parsedTask = parseTask(sampleTask);

    const start = performance.now();

    for (let index = 0; index < 10_000; index++) {
      parsedTask = parseTask(sampleTask);
    }

    const end = performance.now();
    // Uncomment to show timing. console.log(`parseTask took ${end - start} milliseconds to run 10000 times`);

    expect(end - start).toBeLessThan(100);

    expect(parsedTask.tags[0]).toBe('TasK');
    expect(parsedTask.tagsNormalized[0]).toBe('task');
    expect(parsedTask.dueDate).toBe('2022-03-05');
    expect(parsedTask.doneDate).toBe('2022-04-05');
    expect(parsedTask.startDate).toBe(undefined);
    expect(parsedTask.createDate).toBe(undefined);
    expect(parsedTask.scheduledDate).toBe(undefined);
    expect(parsedTask.priority).toBe(1);
  });
});
