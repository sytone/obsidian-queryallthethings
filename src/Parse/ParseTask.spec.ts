
// eslint-disable-next-line import/no-unassigned-import
import 'jest';
import {ListItem} from 'ListItem';
import {Note} from 'Note';
import {parseDataViewProperty, parseTask} from 'Parse/Parsers';
import {TaskItem} from 'TaskItem';

describe('parse functions', () => {
  test('task parses tags correctly', () => {
    const parsedTask = parseTask('- [ ] this is a task #TasK #test priority:: high 📅 2022-03-05 ✅ 2022-04-05');
    expect(parsedTask.tags[0]).toBe('TasK');
    expect(parsedTask.tags[1]).toBe('test');
  });

  test('task parses tasks plugin based dates correctly', () => {
    const parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 ✅ 2022-04-05 🛫 2022-05-05 ➕ 2022-06-05 ⏳ 2022-07-05 💨 2022-08-05');

    expect(parsedTask.dueDate).toBe('2022-03-05');
    expect(parsedTask.doneDate).toBe('2022-04-05');
    expect(parsedTask.startDate).toBe('2022-05-05');
    expect(parsedTask.createDate).toBe('2022-06-05');
    expect(parsedTask.scheduledDate).toBe('2022-07-05');
    expect(parsedTask.doDate).toBe('2022-08-05');
    expect(parsedTask.cleanTask).toBe('this is a task');
  });

  test('task parses dataview plugin based dates correctly', () => {
    const parsedDvTask = parseTask('- [ ] this is a task [due:: 2022-03-05] [completion:: 2022-04-05] [start:: 2022-05-05] [created:: 2022-06-05] [scheduled:: 2022-07-05] [do:: 2022-08-05]');

    expect(parsedDvTask.dueDate).toBe('2022-03-05');
    expect(parsedDvTask.doneDate).toBe('2022-04-05');
    expect(parsedDvTask.startDate).toBe('2022-05-05');
    expect(parsedDvTask.createDate).toBe('2022-06-05');
    expect(parsedDvTask.scheduledDate).toBe('2022-07-05');
    expect(parsedDvTask.doDate).toBe('2022-08-05');
    expect(parsedDvTask.cleanTask).toBe('this is a task');

    const parsedDvAltTask = parseTask('- [ ] this is a task (due:: 2022-03-05) (completion:: 2022-04-05) (start:: 2022-05-05) (created:: 2022-06-05) (scheduled:: 2022-07-05) (do:: 2022-08-05)');

    expect(parsedDvAltTask.dueDate).toBe('2022-03-05');
    expect(parsedDvAltTask.doneDate).toBe('2022-04-05');
    expect(parsedDvAltTask.startDate).toBe('2022-05-05');
    expect(parsedDvAltTask.createDate).toBe('2022-06-05');
    expect(parsedDvAltTask.scheduledDate).toBe('2022-07-05');
    expect(parsedDvAltTask.doDate).toBe('2022-08-05');

    expect(parsedDvAltTask.cleanTask).toBe('this is a task');
  });

  test('task parses tasks plugin based priority correctly', () => {
    let parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 ⏫');
    expect(parsedTask.priority).toBe(1);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 🔼');
    expect(parsedTask.priority).toBe(2);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 🔽');
    expect(parsedTask.priority).toBe(3);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05');
    expect(parsedTask.priority).toBe(undefined);
    expect(parsedTask.cleanTask).toBe('this is a task');
  });

  test('task parses dataview plugin based priority correctly', () => {
    let parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: high]');
    expect(parsedTask.priority).toBe(1);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: medium]');
    expect(parsedTask.priority).toBe(2);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 [priority:: low]');
    expect(parsedTask.priority).toBe(3);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 (priority:: high)');
    expect(parsedTask.priority).toBe(1);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 (priority:: medium)');
    expect(parsedTask.priority).toBe(2);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05 (priority:: low)');
    expect(parsedTask.priority).toBe(3);
    expect(parsedTask.cleanTask).toBe('this is a task');

    parsedTask = parseTask('- [ ] this is a task 📅 2022-03-05');
    expect(parsedTask.priority).toBe(undefined);
    expect(parsedTask.cleanTask).toBe('this is a task');
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

    expect(end - start).toBeLessThan(500);
  });
});

describe('parseDataViewProperty', () => {
  test.each(
    [
      ['(', '- [ ] this is a task (property1:: value1) (property2:: value2)'],
      ['[', '- [ ] this is a task [property1:: value1] [property2:: value2]'],
    ])('parses data view properties correctly for %s', (bracketType, markdownTask) => {
    const task = getTaskItem(markdownTask);

    const cleanTask = parseDataViewProperty(task);

    expect(cleanTask).toBe('this is a task');
    expect((task as any).property1).toBe('value1');
    expect((task as any).property2).toBe('value2');
  });

  test('handles multiple occurrences of properties', () => {
    const markdownTask = '- [ ] this is a task [property1:: value1] [property2:: value2] [property1:: value3]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    expect(cleanTask).toBe('this is a task');
    expect((task as any).property1).toBe('value3');
    expect((task as any).property2).toBe('value2');
  });

  test('handles properties with special characters', () => {
    const markdownTask = '- [ ] this is a task [property1:: value with spaces] [property2:: value-with-hyphen]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    expect(cleanTask).toBe('this is a task');
    expect((task as any).property1).toBe('value with spaces');
    expect((task as any).property2).toBe('value-with-hyphen');
  });

  test('handles properties with empty values', () => {
    const markdownTask = '- [ ] this is a task [property1::] [property2::]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    expect(cleanTask).toBe('this is a task [property1::] [property2::]');
    expect((task as any).property1).toBe(undefined);
    expect((task as any).property2).toBe(undefined);
  });

  test('handles properties with no values', () => {
    const markdownTask = '- [ ] this is a task [property1] [property2]';
    const task = getTaskItem(markdownTask);
    const cleanTask = parseDataViewProperty(task);

    expect(cleanTask).toBe('this is a task [property1] [property2]');
    expect((task as any).property1).toBe(undefined);
    expect((task as any).property2).toBe(undefined);
  });
});

function getTaskItem(markdownTask: string) {
  return new TaskItem(getListItemWithTask(markdownTask));
}

function getListItemWithTask(markdownTask: string) {
  return new ListItem(1,
    ' ',
    markdownTask,
    1,
    1,
    new Note(),
  );
}

