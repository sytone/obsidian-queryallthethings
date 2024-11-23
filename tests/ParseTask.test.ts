/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, test} from 'node:test';
import assert from 'node:assert';
import {parseDataViewProperty, parseTask} from 'Parse/Parsers';
import {TaskItem} from 'TaskItem';
import {ListItem} from 'ListItem';

describe('parse functions', () => {
  test('task parses tags correctly', () => {
    const parsedTask = parseTask('- [ ] this is a task #TasK #test priority:: high 📅 2022-03-05 ✅ 2022-04-05');
    assert.strictEqual(parsedTask.tags[0], 'TasK');
    assert.strictEqual(parsedTask.tags[1], 'test');
  });

  test('task parses tasks plugin based dates correctly', () => {
    const parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 ✅ 2022-04-05 🛫 2022-05-05 ➕ 2022-06-05 ⏳ 2022-07-05 💨 2022-08-05');

    assert.strictEqual(parsedTask.dueDate, '2022-03-05');
    assert.strictEqual(parsedTask.doneDate, '2022-04-05');
    assert.strictEqual(parsedTask.startDate, '2022-05-05');
    assert.strictEqual(parsedTask.createDate, '2022-06-05');
    assert.strictEqual(parsedTask.scheduledDate, '2022-07-05');
    assert.strictEqual(parsedTask.doDate, '2022-08-05');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');
  });

  test('task parses dataview plugin based dates correctly', () => {
    const parsedDvTask = parseTask('- [ ] this is a task [due:: 2022-03-05] [completion:: 2022-04-05] [start:: 2022-05-05] [created:: 2022-06-05] [scheduled:: 2022-07-05] [do:: 2022-08-05]');

    assert.strictEqual(parsedDvTask.dueDate, '2022-03-05');
    assert.strictEqual(parsedDvTask.doneDate, '2022-04-05');
    assert.strictEqual(parsedDvTask.startDate, '2022-05-05');
    assert.strictEqual(parsedDvTask.createDate, '2022-06-05');
    assert.strictEqual(parsedDvTask.scheduledDate, '2022-07-05');
    assert.strictEqual(parsedDvTask.doDate, '2022-08-05');
    assert.strictEqual(parsedDvTask.cleanTask, 'this is a task');

    const parsedDvAltTask = parseTask('- [ ] this is a task (due:: 2022-03-05) (completion:: 2022-04-05) (start:: 2022-05-05) (created:: 2022-06-05) (scheduled:: 2022-07-05) (do:: 2022-08-05)');

    assert.strictEqual(parsedDvAltTask.dueDate, '2022-03-05');
    assert.strictEqual(parsedDvAltTask.doneDate, '2022-04-05');
    assert.strictEqual(parsedDvAltTask.startDate, '2022-05-05');
    assert.strictEqual(parsedDvAltTask.createDate, '2022-06-05');
    assert.strictEqual(parsedDvAltTask.scheduledDate, '2022-07-05');
    assert.strictEqual(parsedDvAltTask.doDate, '2022-08-05');

    assert.strictEqual(parsedDvAltTask.cleanTask, 'this is a task');
  });

  test('task parses to create clean string', () => {
    let parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 ⏫');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 🔼');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 🔽');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task #il 📅 2022-03-05');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');
  });

  test('task parses tasks plugin based priority correctly', () => {
    let parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 ⏫');
    assert.strictEqual(parsedTask.priority, 1);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 🔼');
    assert.strictEqual(parsedTask.priority, 2);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 🔽');
    assert.strictEqual(parsedTask.priority, 3);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05');
    assert.strictEqual(parsedTask.priority, undefined);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');
  });

  test('task parses dataview plugin based priority correctly', () => {
    let parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: high]');
    assert.strictEqual(parsedTask.priority, 1);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: medium]');
    assert.strictEqual(parsedTask.priority, 2);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: low]');
    assert.strictEqual(parsedTask.priority, 3);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 (priority:: high)');
    assert.strictEqual(parsedTask.priority, 1);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 (priority:: medium)');
    assert.strictEqual(parsedTask.priority, 2);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 (priority:: low)');
    assert.strictEqual(parsedTask.priority, 3);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05');
    assert.strictEqual(parsedTask.priority, undefined);
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');
  });

  test('task parses block link correctly', () => {
    const parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: high] ^123ASD-asd');
    assert.strictEqual(parsedTask.blockLink, '123ASD-asd');
    assert.strictEqual(parsedTask.cleanTask, 'this is a task');
  });

  test('task parses are fast', () => {
    const sampleTask = '- [ ] this is a task #TasK #test [priority:: high] 📅 2022-03-05 ✅ 2022-04-05';
    let parsedTask = parseTask(sampleTask);

    const start = performance.now();

    for (let index = 0; index < 10_000; index++) {
      parsedTask = parseTask(sampleTask);
    }

    const end = performance.now();
    console.log(`parseTask took ${end - start} milliseconds to run 10000 times`);

    assert.ok(end - start < 200);
  });
});

describe('parseDataViewProperty', () => {
  const testTasks = [
    ['(', '- [ ] this is a task (property1:: value1) (property2:: value2)'],
    ['[', '- [ ] this is a task [property1:: value1] [property2:: value2]'],
  ];

  for (const [bracketType, markdownTask] of testTasks) {
    test(`parses data view properties correctly for ${bracketType}`, () => {
      const task = getTaskItem(markdownTask);

      const cleanTask = parseDataViewProperty(task);

      assert.strictEqual(cleanTask, 'this is a task');
      assert.strictEqual((task as any).property1, 'value1');
      assert.strictEqual((task as any).property2, 'value2');
    });
  }

  test('handles multiple occurrences of properties', () => {
    const markdownTask = '- [ ] this is a task [property1:: value1] [property2:: value2] [property1:: value3]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    assert.strictEqual(cleanTask, 'this is a task');
    assert.strictEqual((task as any).property1, 'value3');
    assert.strictEqual((task as any).property2, 'value2');
  });

  test('handles properties with special characters', () => {
    const markdownTask = '- [ ] this is a task [property1:: value with spaces] [property2:: value-with-hyphen]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    assert.strictEqual(cleanTask, 'this is a task');
    assert.strictEqual((task as any).property1, 'value with spaces');
    assert.strictEqual((task as any).property2, 'value-with-hyphen');
  });

  test('handles properties with empty values', () => {
    const markdownTask = '- [ ] this is a task [property1::] [property2::]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    assert.strictEqual(cleanTask, 'this is a task [property1::] [property2::]');
    assert.strictEqual((task as any).property1, undefined);
    assert.strictEqual((task as any).property2, undefined);
  });

  test('handles properties with no values', () => {
    const markdownTask = '- [ ] this is a task [property1] [property2]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    assert.strictEqual(cleanTask, 'this is a task [property1] [property2]');
    assert.strictEqual((task as any).property1, undefined);
    assert.strictEqual((task as any).property2, undefined);
  });
});

function getTaskItem(markdownTask: string) {
  const newTask = new TaskItem();
  return newTask.updateTaskItem(getListItemWithTask(markdownTask));
}

function getListItemWithTask(markdownTask: string) {
  return new ListItem(1,
    ' ',
    markdownTask,
    1,
    1,
    ' ',
    1,
    'heading',
    ' ',
  );
}

