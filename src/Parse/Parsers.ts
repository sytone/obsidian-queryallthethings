import {type TaskItem} from 'TaskItem';

const dueDatePrefixes = ['📅', 'due::'];
const doneDatePrefixes = ['✅', 'completion::'];
const startDatePrefixes = ['🛫', 'start::'];
const createDatePrefixes = ['➕', 'created::'];
const scheduledDatePrefixes = ['⏳', 'scheduled::'];
const doDatePrefixes = ['💨', 'do::'];

export const parseTask = (taskString: string) => {
  const tags: string[] = [];
  const tagsNormalized: string[] = [];
  const tokens = taskString.split(' ');
  let dueDate: string | undefined;
  let doneDate: string | undefined;
  let startDate: string | undefined;
  let createDate: string | undefined;
  let scheduledDate: string | undefined;
  let doDate: string | undefined;
  let priority;
  let cleanTask = taskString;

  for (let index = 0; index < tokens.length; index++) {
    parseTags(tokens, index, tags, tagsNormalized);

    dueDate = dueDate ?? parseDate(tokens, index, dueDatePrefixes);
    doneDate = doneDate ?? parseDate(tokens, index, doneDatePrefixes);
    startDate = startDate ?? parseDate(tokens, index, startDatePrefixes);
    createDate = createDate ?? parseDate(tokens, index, createDatePrefixes);
    scheduledDate = scheduledDate ?? parseDate(tokens, index, scheduledDatePrefixes);
    doDate = doDate ?? parseDate(tokens, index, doDatePrefixes);

    priority = priority ?? parsePriority(tokens, index);
  }

  if (dueDate) {
    cleanTask = cleanTaskProperties(cleanTask, dueDate, dueDatePrefixes);
  }

  if (doneDate) {
    cleanTask = cleanTaskProperties(cleanTask, doneDate, doneDatePrefixes);
  }

  if (startDate) {
    cleanTask = cleanTaskProperties(cleanTask, startDate, startDatePrefixes);
  }

  if (createDate) {
    cleanTask = cleanTaskProperties(cleanTask, createDate, createDatePrefixes);
  }

  if (scheduledDate) {
    cleanTask = cleanTaskProperties(cleanTask, scheduledDate, scheduledDatePrefixes);
  }

  if (doDate) {
    cleanTask = cleanTaskProperties(cleanTask, doDate, doDatePrefixes);
  }

  if (priority) {
    cleanTask = cleanTask.replace('⏫', '');
    cleanTask = cleanTask.replace('🔼', '');
    cleanTask = cleanTask.replace('🔽', '');
    cleanTask = cleanTask.replace('priority:: high', '');
    cleanTask = cleanTask.replace('priority:: medium', '');
    cleanTask = cleanTask.replace('priority:: low', '');
  }

  cleanTask = cleanTask.trim().slice(6);

  return {tags, tagsNormalized, dueDate, doneDate, startDate, createDate, scheduledDate, doDate, priority, cleanTask};
};

const regex = /\[(.+?):: (.+?)]/g;

export const parseDataViewProperty = (task: TaskItem) => {
  const taskString = task.text;
  let cleanTask = task.cleanTask;

  let m;

  while ((m = regex.exec(taskString)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    const key = m[1];
    const value = m[2];

    Object.assign(task, {[`${key}`]: value});
    cleanTask = cleanTask.replace(`[${key}:: ${value}]`, '');
  }

  return cleanTask;
};

export const cleanTaskProperties = (taskString: string, searchString: string, prefixes: string[]) => {
  taskString = taskString.replace(searchString, '');

  for (const prefix of prefixes) {
    taskString = taskString.replace(prefix, '');
  }

  return taskString;
};

function parsePriority(tokens: string[], index: number) {
  if (tokens[index].startsWith('⏫') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('high'))) {
    return 1;
  }

  if (tokens[index].startsWith('🔼') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('medium'))) {
    return 2;
  }

  if (tokens[index].startsWith('🔽') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('low'))) {
    return 3;
  }
}

// Iterate through the prefixes and pull the following value and return.
function parseDate(tokens: string[], index: number, prefixes: string[]) {
  for (const prefix of prefixes) {
    if (tokens[index].startsWith(prefix)) {
      return tokens[index + 1];
    }
  }

  return undefined;
}

function parseTags(tokens: string[], index: number, tags: string[], tagsNormalized: string[]) {
  if (tokens[index].startsWith('#')) {
    const tagBody = tokens[index].slice(1);
    const tagMatch = /[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~[\]\\\s]+/.exec(tagBody);
    // Log('info', `tagBody ${tagBody} tagMatch ${JSON.stringify(tagMatch)}`);
    if (tagMatch && /\D/.test(tagMatch[0])) {
      tags.push(tagMatch[0]);
      tagsNormalized.push(tagMatch[0].toLowerCase());
    }
  }
}
