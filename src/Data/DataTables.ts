import alasql from 'alasql';
import {DateTime} from 'luxon';
import {getAPI, isPluginEnabled, type PageMetadata} from 'obsidian-dataview';
import {parseTask} from 'Parse/Parsers';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {logging} from 'lib/Logging';

export interface IDataTables {
  refreshTables (reason: string): void;
}

export class DataTables {
  logger = logging.getLogger('Qatt.DataTables');

  constructor(
    private readonly plugin: IQueryAllTheThingsPlugin,
  ) {
    this.logger.info('Created proxy table manager.');
  }

  public refreshTables(reason: string): void {
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

  public refreshTasksTableFromDataview(reason: string): void {
    alasql('SELECT * INTO qatt.Events FROM ?', [[{date: DateTime.now(), event: `Tasks Table refreshed: ${reason}`}]]);
    if (alasql('SHOW TABLES FROM alasql LIKE "tasks"').length > 0) {
      this.logger.info('Dropping the tasks table to repopulate.');
      alasql('DROP TABLE tasks ');
    }

    alasql('CREATE TABLE tasks ');

    const start = DateTime.now();
    const dataviewPages = this.getDataviewPages() ?? new Map<string, PageMetadata>();

    // Look at forcing a update on page changes.
    for (const p of dataviewPages) {
      for (const l of p[1].lists) {
        if (l.task) {
          const parsedTask = parseTask(l.text);
          /*
          Update the table below when new columns are added so documentation is updated.
          // >> tasks-table-snippet

          If a property is not found in the task body it will be set to undefined. This table
          is backed by dataview and will be refreshed when dataview is refreshed.

          | Column Name    | Type         | Description                                                                                             |
          | -------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
          | page           | string       | The full path including the page name and extension                                                     |
          | task           | string       | The full text of the task, any tags or dates are still in this. This may be multiple lines of markdown. |
          | status         | string       | The text in between the brackets of the '[ ]' task indicator ('[X]' would yield 'X', for example.)      |
          | line           | number       | The line that this list item starts on in the file.                                                     |
          | tags           | string array | Array of tags                                                                                           |
          | tagsNormalized | string array | Array of tags all in lowercase                                                                          |
          | dueDate        | string       | Due date of the task as string.                                                                         |
          | doneDate       | string       | Done date of the task as string.                                                                        |
          | startDate      | string       | Start date of the task as string.                                                                       |
          | createDate     | string       | Create date of the task as string.                                                                      |
          | scheduledDate  | string       | Schedule date of the task as string.                                                                    |
          | priority       | number       | Priority of the task with 1 as highest and three as lowest                                              |

          // << tasks-table-snippet
          */
          alasql('INSERT INTO tasks VALUES ?', [{
            page: p[1].path,
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
            priority: parsedTask.priority,
          }]);
        }
      }
    }

    this.logger.log('info', `Tasks refreshed in ${DateTime.now().diff(start, 'millisecond').toString() ?? ''}`);
  }

  public refreshListsTableFromDataview(reason: string): void {
    alasql('SELECT * INTO qatt.Events FROM ?', [[{date: DateTime.now(), event: `Lists Table refreshed: ${reason}`}]]);

    // Temporary tables based on current state to make some queries faster.
    if (alasql('SHOW TABLES FROM alasql LIKE "lists"').length > 0) {
      this.logger.info('Dropping the tasks table to repopulate.');
      alasql('DROP TABLE lists ');
    }

    alasql('CREATE TABLE lists ');

    const start = DateTime.now();
    const dataviewPages = this.getDataviewPages() ?? new Map<string, PageMetadata>();

    // Look at forcing a update on page changes.
    for (const p of dataviewPages) {
      for (const l of p[1].lists) {
        const links = [];

        for (const itemLinks of l.links) {
          links.push(itemLinks.path);
        }

        /*
        Update the table below when new columns are added so documentation is updated.
        // >> lists-table-snippet

        If a property is not found in the task body it will be set to undefined. This table
        is backed by dataview and will be refreshed when dataview is refreshed.

        | Column Name | Type         | Description |
        | ----------- | ------------ | ----------- |
        | symbol      | string       |             |
        | path        | string       |             |
        | pageName    | string       |             |
        | text        | number       |             |
        | line        | string array |             |
        | fields      | string array |             |
        | lineCount   | string       |             |
        | list        | string       |             |
        | section     | string       |             |
        | links       | string       |             |
        | children    | string       |             |
        | parent      | number       |             |

        // << lists-table-snippet
        */
        alasql('INSERT INTO lists VALUES ?', [{
          symbol: l.symbol,
          path: p[1].path,
          pageName: this.parsePathFilenameNoExt(p[1].path),
          text: l.text,
          line: l.line,
          fields: l.fields,
          lineCount: l.lineCount,
          list: l.list,
          section: l.section.subpath,
          links,
          children: l.children,
          parent: l.parent,
        }]);
      }
    }

    this.logger.log('info', `Lists refreshed in ${DateTime.now().diff(start, 'millisecond').toString() ?? ''}`);
  }

  private getDataviewPages(): Map<string, PageMetadata> | undefined {
    if (!isPluginEnabled(this.plugin.app)) {
      return;
    }

    const dataviewApi = getAPI(this.plugin.app);
    if (!dataviewApi) {
      return;
    }

    return dataviewApi.index.pages;
  }

  // Parse a path to return the filename without an extension.
  private parsePathFilenameNoExt(path: string): string {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
