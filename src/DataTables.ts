import alasql from 'alasql';
import { DateTime } from 'luxon';
import { getAPI } from 'obsidian-dataview';
import { parseTask } from 'Parse/parsers';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { logging } from 'lib/logging';

export interface IDataTables {
  refreshTables (reason: string): void;
}

export class DataTables {
  logger = logging.getLogger('Qatt.DataTables');

  constructor (
    private plugin: IQueryAllTheThingsPlugin
  ) {
    this.logger.info('Created proxy table manager.');
  }

  public refreshTables (reason: string): void {
    if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length === 0) {
      alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
    }

    // Persisted tables, this data will exist between obsidian reloads but is not replicated between machines or vault copies.
    alasql('CREATE localStorage DATABASE IF NOT EXISTS qatt');
    alasql('ATTACH localStorage DATABASE qatt');
    alasql('CREATE TABLE IF NOT EXISTS qatt.Events (date DATETIME, event STRING)');

    this.refreshTasksTableFromDataview(reason);
    this.refreshListsTableFromDataview(reason);

    this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
  }

  public refreshTasksTableFromDataview (reason: string): void {
    alasql('SELECT * INTO qatt.Events FROM ?', [[{ date: DateTime.now(), event: `Tasks Table refreshed: ${reason}` }]]);
    if (alasql('SHOW TABLES FROM alasql LIKE "tasks"').length !== 0) {
      this.logger.info('Dropping the tasks table to repopulate.');
      alasql('DROP TABLE tasks ');
    }
    alasql('CREATE TABLE tasks ');

    const start = DateTime.now();
    // Todo force a update on page changes.
    getAPI(this.plugin.app)?.index.pages.forEach(p => {
      p.lists.forEach(l => {
        if (l.task) {
          const parsedTask = parseTask(l.text);
          alasql('INSERT INTO tasks VALUES ?', [{
            page: p.path,
            task: l.text,
            status: l.task?.status,
            line: l.line,
            tags: parsedTask.tags,
            tagsNormalized: parsedTask.tagsNormalized,
            dueDate: parsedTask.dueDate,
            doneDate: parsedTask.doneDate,
            startDate: parsedTask.startDate,
            createDate: parsedTask.createDate,
            scheduledDate: parsedTask.scheduledDate,
            priority: parsedTask.priority
          }]);
        }
      });
    });
    this.logger.log('info', `Tasks refreshed in ${DateTime.now().diff(start, 'millisecond').toString()}`);
  }

  public refreshListsTableFromDataview (reason: string): void {
    alasql('SELECT * INTO qatt.Events FROM ?', [[{ date: DateTime.now(), event: `Lists Table refreshed: ${reason}` }]]);

    // Temporary tables based on current state to make some queries faster.
    if (alasql('SHOW TABLES FROM alasql LIKE "lists"').length !== 0) {
      this.logger.info('Dropping the tasks table to repopulate.');
      alasql('DROP TABLE lists ');
    }
    alasql('CREATE TABLE lists ');

    const start = DateTime.now();
    // Todo force a update on page changes.
    getAPI(this.plugin.app)?.index.pages.forEach(p => {
      p.lists.forEach(l => {
        alasql('INSERT INTO lists VALUES ?', [{
          symbol: l.symbol,
          page: p.path,
          text: l.text,
          line: l.line,
          fields: l.fields,
          lineCount: l.lineCount,
          list: l.list,
          section: l.section.subpath
        }]);
      });
    });
    this.logger.log('info', `Lists refreshed in ${DateTime.now().diff(start, 'millisecond').toString()}`);
  }
}
