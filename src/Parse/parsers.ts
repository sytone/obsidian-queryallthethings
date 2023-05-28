
export const parseTask = (taskString: string) => {
  const tags: string[] = [];
  const tagsNormalized: string[] = [];
  const tokens = taskString.split(' ');
  let dueDate: string | undefined;
  let doneDate: string | undefined;
  let startDate: string | undefined;
  let createDate: string | undefined;
  let scheduledDate: string | undefined;
  let priority = 4;

  for (let index = 0; index < tokens.length; index++) {
    parseTags(tokens, index, tags, tagsNormalized);

    ({dueDate, doneDate, startDate, createDate, scheduledDate} = parseDates(tokens, index));

    priority = parsePriority(tokens, index);
  }

  return {tags, tagsNormalized, dueDate, doneDate, startDate, createDate, scheduledDate, priority};
};

function parsePriority(tokens: string[], index: number) {
  let priority = 4;
  if (tokens[index].startsWith('⏫') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('high'))) {
    priority = 1;
  }

  if (tokens[index].startsWith('🔼') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('medium'))) {
    priority = 2;
  }

  if (tokens[index].startsWith('🔽') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('low'))) {
    priority = 3;
  }

  return priority;
}

function parseDates(tokens: string[], index: number) {
  let dueDate: string | undefined;
  let doneDate: string | undefined;
  let startDate: string | undefined;
  let createDate: string | undefined;
  let scheduledDate: string | undefined;
  if (tokens[index].startsWith('📅') || tokens[index].startsWith('due::')) {
    // DueDate = DateTime.fromISO(tokens[index + 1]).toISODate();
    dueDate = tokens[index + 1];
  }

  if (tokens[index].startsWith('✅') || tokens[index].startsWith('completion::')) {
    // DoneDate = DateTime.fromISO(tokens[index + 1]).toISODate();
    doneDate = tokens[index + 1];
  }

  if (tokens[index].startsWith('🛫') || tokens[index].startsWith('start::')) {
    // StartDate = DateTime.fromISO(tokens[index + 1]).toISODate();
    startDate = tokens[index + 1];
  }

  if (tokens[index].startsWith('➕') || tokens[index].startsWith('created::')) {
    // CreateDate = DateTime.fromISO(tokens[index + 1]).toISODate();
    createDate = tokens[index + 1];
  }

  if (tokens[index].startsWith('⏳') || tokens[index].startsWith('scheduled::')) {
    // ScheduledDate = DateTime.fromISO(tokens[index + 1]).toISODate();
    scheduledDate = tokens[index + 1];
  }

  return {dueDate, doneDate, startDate, createDate, scheduledDate};
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

