
export const parseTask = (taskString: string) => {
  const tags = [];
  const tagsNormalized = [];
  const tokens = taskString.split(' ');
  let dueDate;
  let doneDate;
  let startDate;
  let createDate;
  let scheduledDate;
  let priority = 4;

  for (let index = 0; index < tokens.length; index++) {
    if (tokens[index].startsWith('#')) {
      const tagBody = tokens[index].slice(1);
      const tagMatch = /[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~[\]\\\s]+/.exec(tagBody);
      // log('info', `tagBody ${tagBody} tagMatch ${JSON.stringify(tagMatch)}`);

      if (tagMatch && /[^0-9]/.test(tagMatch[0])) {
        tags.push(tagMatch[0]);
        tagsNormalized.push(tagMatch[0].toLowerCase());
      }
    }
    if (tokens[index].startsWith('📅') || tokens[index].startsWith('due::')) {
      // dueDate = DateTime.fromISO(tokens[index + 1]).toISODate();
      dueDate = tokens[index + 1];
    }
    if (tokens[index].startsWith('✅') || tokens[index].startsWith('completion::')) {
      // doneDate = DateTime.fromISO(tokens[index + 1]).toISODate();
      doneDate = tokens[index + 1];
    }
    if (tokens[index].startsWith('🛫') || tokens[index].startsWith('start::')) {
      // startDate = DateTime.fromISO(tokens[index + 1]).toISODate();
      startDate = tokens[index + 1];
    }
    if (tokens[index].startsWith('➕') || tokens[index].startsWith('created::')) {
      // createDate = DateTime.fromISO(tokens[index + 1]).toISODate();
      createDate = tokens[index + 1];
    }
    if (tokens[index].startsWith('⏳') || tokens[index].startsWith('scheduled::')) {
      // scheduledDate = DateTime.fromISO(tokens[index + 1]).toISODate();
      scheduledDate = tokens[index + 1];
    }
    if (tokens[index].startsWith('⏫') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('high'))) {
      priority = 1;
    }
    if (tokens[index].startsWith('🔼') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('medium'))) {
      priority = 2;
    }
    if (tokens[index].startsWith('🔽') || (tokens[index].startsWith('priority::') && tokens[index + 1].startsWith('low'))) {
      priority = 3;
    }
  }

  return { tags, tagsNormalized, dueDate, doneDate, startDate, createDate, scheduledDate, priority };
};
