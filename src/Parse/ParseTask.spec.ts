/* eslint-disable unicorn/filename-case */
import {parseTask} from 'Parse/Parsers';

describe('parse functions', () => {
  test('task parses correctly', () => {
    const parsedTask = parseTask('this is a task #TasK #test priority:: high 📅 2022-03-05 ✅ 2022-04-05');

    expect(parsedTask.tags[0]).toBe('TasK');
    // Testing
    // assert.equal(parsedTask.tagsNormalized[0], 'task');
    // assert.equal(parsedTask.dueDate, '2022-03-05');
    // assert.equal(parsedTask.doneDate, '2022-04-05');
    // assert.equal(parsedTask.startDate, undefined);
    // assert.equal(parsedTask.createDate, undefined);
    // assert.equal(parsedTask.scheduledDate, undefined);
    // assert.equal(parsedTask.priority, 1);
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

    expect(end - start).toBeLessThan(150);

    expect(parsedTask.tags[0]).toBe('TasK');
    // Testing
    // assert.equal(parsedTask.tagsNormalized[0], 'task');
    // assert.equal(parsedTask.dueDate, '2022-03-05');
    // assert.equal(parsedTask.doneDate, '2022-04-05');
    // assert.equal(parsedTask.startDate, undefined);
    // assert.equal(parsedTask.createDate, undefined);
    // assert.equal(parsedTask.scheduledDate, undefined);
    // assert.equal(parsedTask.priority, 1);
  });
});
