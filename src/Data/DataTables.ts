/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import alasql from 'alasql';
import { AlaSqlQuery } from 'Query/AlaSqlQuery';
import { DateTime } from 'luxon';
import { parseTask } from 'Parse/Parsers';
import { Plugin } from 'obsidian';
import { Service } from '@ophidian/core';
import { LoggingService } from 'lib/LoggingService';
import { DataviewService } from 'Integrations/DataviewService';
import { MetricsService } from 'lib/MetricsService';

export class DataTables extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.DataTables');
  metrics = this.use(MetricsService);

  dvService = this.use(DataviewService);
  public setupLocalDatabasesCompleted = false;
  public refreshTablesCompleted = false;

  public async runAdhocQuery (query: string): Promise<any> {
    const result = await alasql.promise(query);
    return result; // eslint-disable-line @typescript-eslint/no-unsafe-return
  }

  public async setupLocalDatabase () {

    // Setup ALASQL and all custom functions.
    this.metrics.startMeasurement('AlaSqlQuery.initialize');
    AlaSqlQuery.initialize();
    this.logger.info('AlaSqlQuery Initialized');
    this.metrics.endMeasurement('AlaSqlQuery.initialize');

    alasql.options.cache = true;
    // Persisted tables, this data will exist between obsidian reloads but is not replicated between machines or vault copies.

    await alasql.promise([
      'CREATE INDEXEDDB DATABASE IF NOT EXISTS qatt',
      'ATTACH INDEXEDDB DATABASE qatt',
      // 'USE qatt',
      'CREATE TABLE IF NOT EXISTS pagedata (name STRING, keyvalue STRING)',
      'CREATE TABLE IF NOT EXISTS qatt.Events (date DATETIME, event STRING)',
      'CREATE TABLE IF NOT EXISTS qatt.ReferenceCalendar',
      'CREATE TABLE IF NOT EXISTS qatt.RenderTracker (time DATETIME, page STRING, id STRING)',
      'CREATE TABLE IF NOT EXISTS qatt.Configuration (time DATETIME, configkey STRING, configvalue STRING)',
      'CREATE TABLE IF NOT EXISTS obsidian_notes',
      'CREATE TABLE IF NOT EXISTS obsidian_lists',
      'CREATE TABLE IF NOT EXISTS obsidian_tasks',
      'CREATE TABLE IF NOT EXISTS last_modified_notes',
    ]);

    // To force local storage for all records the following could be uncommented
    // however performance will tank as local storage is sync and slower.
    this.logger.info('Current database:', alasql.useid);
    this.setupLocalDatabasesCompleted = true;
    this.plugin.app.workspace.trigger('qatt:data-local-database-setup-completed');

  }

  public async refreshTables (reason: string): Promise<void> {
    this.metrics.startMeasurement('DataTables.refreshTables');

    if (this.dvService.dataViewEnabled) {
      this.refreshTasksTableFromDataview(reason);
      this.refreshListsTableFromDataview(reason);
    }

    // UPDATE qatt.ReferenceCalendar SET date = '2000-01-01' WHERE isToday;
    this.metrics.startMeasurement('qatt.ReferenceCalendar Refresh Check');
    const referenceCalendarTodayDate = await alasql.promise('SELECT date FROM qatt.ReferenceCalendar WHERE isToday');
    if (referenceCalendarTodayDate.length === 0 || referenceCalendarTodayDate[0].date !== DateTime.now().toISODate()) {
      await this.refreshCalendarTable(reason);
    }

    this.metrics.endMeasurement('qatt.ReferenceCalendar Refresh Check');

    this.refreshTablesCompleted = true;
    this.plugin.app.workspace.trigger('qatt:dataview-store-update');
    this.plugin.app.workspace.trigger('qatt:data-refreshtables-completed');

    this.metrics.endMeasurement('DataTables.refreshTables');
  }

  /**
   * This needs to be refreshed on a daily basis to be accurate.
   *
   * @param {string} reason
   * @memberof DataTables
   */
  public async refreshCalendarTable (reason: string): Promise<void> {
    this.metrics.startMeasurement('DataTables.refreshCalendarTable');

    await alasql.promise('SELECT * INTO qatt.Events FROM ?', [[{ date: DateTime.now(), event: `Lists Table refreshed: ${reason}` }]]);

    await alasql.promise('DROP TABLE IF EXISTS qatt.ReferenceCalendar');
    await alasql.promise('CREATE TABLE IF NOT EXISTS qatt.ReferenceCalendar');

    /*
    // >> id='reference-calendar-table-snippet' options='file=data-tables/qatt-referencecalendar.md'
    ---
    order: 20
    parent: Data Tables
    title: Reference - Calendar Table
    ---

    # Reference - Calendar Table

    Table Name: `qatt.ReferenceCalendar`

    The reference calendar is used to help with date based management, you can directly query the table or use it to join to other data sources.

    | Column Name      | Type    | Description                                                               |
    | ---------------- | ------- | ------------------------------------------------------------------------- |
    | date             | string  | date.toISODate()                                                          |
    | day              | number  | date.day                                                                  |
    | month            | number  | date.month                                                                |
    | year             | number  | date.year                                                                 |
    | dayOfWeek        | number  | date.weekday                                                              |
    | dayOfYear        | number  | date.ordinal                                                              |
    | weekOfYear       | number  | date.weekNumber                                                           |
    | weekOfMonth      | number  | date.weekNumber - DateTime.local(date.year, date.month, 1).weekNumber + 1 |
    | quarter          | number  | Math.ceil(date.month / 3)                                                 |
    | isLeapYear       | boolean | date.isInLeapYear                                                         |
    | isToday          | boolean | date.hasSame(DateTime.now(), 'day')                                       |
    | isWeekend        | boolean | date.weekday > 5                                                          |
    | isFuture         | boolean | date > DateTime.now()                                                     |
    | isPast           | boolean | date < DateTime.now()                                                     |
    | isCurrentMonth   | boolean | date.month === DateTime.now().month                                       |
    | isCurrentYear    | boolean | date.year === DateTime.now().year                                         |
    | isCurrentQuarter | boolean | Math.ceil(date.month / 3) === Math.ceil(DateTime.now().month / 3)         |
    | isCurrentWeek    | boolean | date.weekNumber === DateTime.now().weekNumber                             |
    | isCurrentDay     | boolean | date.hasSame(DateTime.now(), 'day')                                       |

    // << reference-calendar-table-snippet
    */

    // Get the days in each year for this year plus and minus 1 year.
    const daysInPreviousYear = DateTime.local(DateTime.now().year - 1).daysInYear;
    const daysInCurrentYear = DateTime.local(DateTime.now().year).daysInYear;
    const daysInNextYear = DateTime.local(DateTime.now().year + 1).daysInYear;
    const nowIso = DateTime.now().toISODate();

    for (let i = 1; i <= (daysInPreviousYear + daysInCurrentYear + daysInNextYear); i++) {
      const date = DateTime.local(DateTime.now().year - 1, 1, 1).plus({ days: i - 1 });
      // eslint-disable-next-line no-await-in-loop
      await alasql.promise('INSERT INTO qatt.ReferenceCalendar VALUES ?', [{
        date: date.toISODate(),
        day: date.day,
        month: date.month,
        year: date.year,
        dayOfWeek: date.weekday,
        dayOfYear: date.ordinal,
        weekOfYear: date.weekNumber,
        weekOfMonth: date.weekNumber - DateTime.local(date.year, date.month, 1).weekNumber + 1,
        quarter: Math.ceil(date.month / 3),
        isLeapYear: date.isInLeapYear,
        isToday: nowIso === date.toISODate(),
        isWeekend: date.weekday > 5,
        isFuture: date > DateTime.now(),
        isPast: date < DateTime.now(),
        isCurrentMonth: date.month === DateTime.now().month && date.year === DateTime.now().year,
        isCurrentYear: date.year === DateTime.now().year,
        isCurrentQuarter: Math.ceil(date.month / 3) === Math.ceil(DateTime.now().month / 3) && date.year === DateTime.now().year,
        isCurrentWeek: date.weekNumber === DateTime.now().weekNumber && date.year === DateTime.now().year,
        isCurrentDay: date.hasSame(DateTime.now(), 'day'),
      }]);
    }

    this.metrics.endMeasurement('DataTables.refreshCalendarTable');
  }

  public async refreshTasksTableFromDataview (reason: string): void {
    this.metrics.startMeasurement('DataTables.refreshTasksTableFromDataview');

    await alasql.promise('SELECT * INTO qatt.Events FROM ?', [[{ date: DateTime.now(), event: `Tasks Table refreshed: ${reason}` }]]);
    const dataviewTasksTable = await alasql.promise('SHOW TABLES FROM alasql LIKE "dataview_tasks"');
    if (dataviewTasksTable.length > 0) {
      this.logger.info('Dropping the dataview_tasks table to repopulate.');
      await alasql.promise('DROP TABLE dataview_tasks ');
    }

    await alasql.promise('CREATE TABLE dataview_tasks ');

    const dataviewPages = this.dvService.getDataviewPages();

    // Look at forcing a update on page changes.
    for (const p of dataviewPages) {
      for (const l of p[1].lists) {
        if (l.task) {
          const parsedTask = parseTask(l.text);
          /*
          // >> id='tasks-table-snippet' options=''

          If a property is not found in the task body it will be set to undefined. This table
          is backed by Dataview and will be refreshed when Dataview is refreshed.

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
          | priority       | number       | Priority of the task with 1 as highest and 3 as lowest                                                  |

          // << tasks-table-snippet
          */
          await alasql.promise('INSERT INTO dataview_tasks VALUES ?', [{ // eslint-disable-line no-await-in-loop
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

    this.metrics.endMeasurement('DataTables.refreshTasksTableFromDataview');
  }

  public async refreshListsTableFromDataview (reason: string): void {
    this.metrics.startMeasurement('DataTables.refreshListsTableFromDataview');

    await alasql.promise('SELECT * INTO qatt.Events FROM ?', [[{ date: DateTime.now(), event: `Lists Table refreshed: ${reason}` }]]);

    const dataviewListsTable = await alasql.promise('SHOW TABLES FROM alasql LIKE "dataview_lists"');

    // Temporary tables based on current state to make some queries faster.
    if (dataviewListsTable.length > 0) {
      this.logger.info('Dropping the tasks table to repopulate.');
      await alasql.promise('DROP TABLE dataview_lists ');
    }

    await alasql.promise('CREATE TABLE dataview_lists ');

    const dataviewPages = this.dvService.getDataviewPages();

    // Look at forcing a update on page changes.
    for (const p of dataviewPages) {
      for (const l of p[1].lists) {
        const links = [];

        for (const itemLinks of l.links) {
          links.push(itemLinks.path);
        }

        /*
        // >> id='lists-table-snippet' options=''

        If a property is not found in the task body it will be set to undefined. This table
        is backed by Dataview and will be refreshed when Dataview is refreshed.

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
        await alasql.promise('INSERT INTO dataview_lists VALUES ?', [{ // eslint-disable-line no-await-in-loop
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

    this.metrics.endMeasurement('DataTables.refreshListsTableFromDataview');
  }

  // Parse a path to return the filename without an extension.
  private parsePathFilenameNoExt (path: string): string {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
