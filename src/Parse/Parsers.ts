import {type TaskItem} from 'TaskItem';

const dueDatePrefixes = ['📅', '[due::', '(due::'];
const doneDatePrefixes = ['✅', '[completion::', '(completion::'];
const startDatePrefixes = ['🛫', '[start::', '(start::'];
const createDatePrefixes = ['➕', '[created::', '(created::'];
const scheduledDatePrefixes = ['⏳', '[scheduled::', '(scheduled::'];
const doDatePrefixes = ['💨', '[do::', '(do::'];

const usePriorityV2Method = true; // This is a flag to use the new priority method.

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
  let blockLink: string | undefined;

  for (let index = 0; index < tokens.length; index++) {
    parseTags(tokens, index, tags, tagsNormalized);
    // Check to see is the token is a block link and if it is then set the block link property. The
    // block link is in the form of a '^' character followed by only Latin letters, numbers, and dashes.
    blockLink = parseBlockLink(tokens, index);
    dueDate = dueDate ?? parseDate(tokens, index, dueDatePrefixes);
    doneDate = doneDate ?? parseDate(tokens, index, doneDatePrefixes);
    startDate = startDate ?? parseDate(tokens, index, startDatePrefixes);
    createDate = createDate ?? parseDate(tokens, index, createDatePrefixes);
    scheduledDate = scheduledDate ?? parseDate(tokens, index, scheduledDatePrefixes);
    doDate = doDate ?? parseDate(tokens, index, doDatePrefixes);

    priority = priority ?? (usePriorityV2Method ? parsePriorityV2(tokens, index) : parsePriority(tokens, index));
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
    cleanTask = cleanTask.replace('[priority:: high]', '');
    cleanTask = cleanTask.replace('[priority:: medium]', '');
    cleanTask = cleanTask.replace('[priority:: low]', '');
    cleanTask = cleanTask.replace('(priority:: high)', '');
    cleanTask = cleanTask.replace('(priority:: medium)', '');
    cleanTask = cleanTask.replace('(priority:: low)', '');
  }

  if (tags.length > 0) {
    for (const tag of tags) {
      cleanTask = cleanTask.replace(`#${tag}`, '');
    }
  }

  if (blockLink) {
    cleanTask = cleanTask.replace(`^${blockLink}`, '');
  }

  cleanTask = cleanTask.trim().slice(6);

  return {tags, tagsNormalized, dueDate, doneDate, startDate, createDate, scheduledDate, doDate, priority, cleanTask, blockLink};
};

const regex = /[[|(](.+?):: (.+?)[\]|)]/g;

export const parseDataViewProperty = (task: TaskItem) => {
  const taskString = task.text;
  let cleanTask = task.cleanTask;

  let m;
  const properties: Record<string, string> = {};

  while ((m = regex.exec(taskString)) !== null) {
    const key = m[1];
    const value = m[2];

    properties[key] = value;
    cleanTask = cleanTask.replace(`[${key}:: ${value}]`, '');
    cleanTask = cleanTask.replace(`(${key}:: ${value})`, '');
  }

  Object.assign(task, properties);

  return cleanTask.trim();
};

export const cleanTaskProperties = (taskString: string, searchString: string, prefixes: string[]) => {
  taskString = taskString.replace(searchString, '');

  for (const prefix of prefixes) {
    if (prefix.startsWith('[')) {
      taskString = taskString.replace(`${prefix} ]`, '');
    } else if (prefix.startsWith('(')) {
      taskString = taskString.replace(`${prefix} )`, '');
    } else {
      taskString = taskString.replace(prefix, '');
    }
  }

  return taskString;
};

function parsePriority(tokens: string[], index: number) {
  switch (tokens[index]) {
    case '⏫': {
      return 1;
    }

    case '🔼': {
      return 2;
    }

    case '🔽': {
      return 3;
    }

    default: {
      break;
    }
  }

  if (((tokens[index].startsWith('[priority::') || tokens[index].startsWith('(priority::')))) {
    if (tokens[index + 1].startsWith('high')) {
      return 1;
    }

    if (tokens[index + 1].startsWith('medium')) {
      return 2;
    }

    if (tokens[index + 1].startsWith('low')) {
      return 3;
    }
  }
}

const priorityMap: Record<string, number> = {
  '⏫': 1,
  '🔼': 2,
  '🔽': 3,
  '[priority:: high]': 1,
  '[priority:: medium]': 2,
  '[priority:: low]': 3,
  '(priority:: high)': 1,
  '(priority:: medium)': 2,
  '(priority:: low)': 3,
};

function parsePriorityV2(tokens: string[], index: number): number | undefined {
  const token = tokens[index];
  const nextToken = tokens[index + 1];

  return priorityMap[token] || priorityMap[`${token} ${nextToken}`];
}

// Iterate through the prefixes and pull the following value and return.
function parseDate(tokens: string[], index: number, prefixes: string[]) {
  const token = tokens[index];
  const nextToken = tokens[index + 1];

  for (const prefix of prefixes) {
    if (token.startsWith(prefix) && nextToken) {
      const endIndex = nextToken.endsWith(']') || nextToken.endsWith(')') ? nextToken.length - 1 : nextToken.length;
      return nextToken.slice(0, endIndex);
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

function parseBlockLink(tokens: string[], index: number) {
  if (tokens[index].startsWith('^')) {
    return tokens[index].slice(1);
  }

  return undefined;
}
