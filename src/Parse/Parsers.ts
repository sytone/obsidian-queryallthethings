export const parseTask = (taskString: string) => {
  const tags: string[] = [];
  const tagsNormalized: string[] = [];
  const tokens = taskString.split(' ');
  let dueDate: string | undefined;
  let doneDate: string | undefined;
  let startDate: string | undefined;
  let createDate: string | undefined;
  let scheduledDate: string | undefined;
  let priority;

  for (let index = 0; index < tokens.length; index++) {
    parseTags(tokens, index, tags, tagsNormalized);

    dueDate = dueDate ?? parseDate(tokens, index, ['📅', 'due::']);
    doneDate = doneDate ?? parseDate(tokens, index, ['✅', 'completion::']);
    startDate = startDate ?? parseDate(tokens, index, ['🛫', 'start::']);
    createDate = createDate ?? parseDate(tokens, index, ['➕', 'created::']);
    scheduledDate = scheduledDate ?? parseDate(tokens, index, ['⏳', 'scheduled::']);

    priority = priority ?? parsePriority(tokens, index);
  }

  return {tags, tagsNormalized, dueDate, doneDate, startDate, createDate, scheduledDate, priority};
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
