import alasql from 'alasql';
import { DateTime } from 'luxon';
import { getAPI } from "obsidian-dataview";
import { parseTask } from 'Parse/parsers';
import { IQueryAllTheThingsPlugin } from 'IQueryAllTheThingsPlugin';
import { ILogger } from 'lib/logging';
import { injected } from 'brandi';
import { TOKENS } from 'tokens';

export interface IDataTables {
    refreshTables(reason: string): void;
}

export class DataTables {

    constructor(
        private logger: ILogger,
        private plugin: IQueryAllTheThingsPlugin,
    ) {
    }

    public refreshTables(reason: string): void {
        if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length == 0) {
            alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
        }

        // Persisted tables, this data will exist between obsidian reloads but is not replicated between machines or vault copies.
        alasql('CREATE localStorage DATABASE IF NOT EXISTS qatt');
        alasql('ATTACH localStorage DATABASE qatt');
        alasql('CREATE TABLE IF NOT EXISTS qatt.Events (date DATETIME, event STRING)');

        alasql('SELECT * INTO qatt.Events FROM ?', [[{ date: DateTime.now(), event: `Tables refreshed: ${reason}` }]]);


        // Temporary tables based on current state to make some queries faster.
        if (alasql('SHOW TABLES FROM alasql LIKE "tasks"').length != 0) {
            alasql('DROP TABLE tasks ');

        }
        alasql('CREATE TABLE tasks ');

        let start = DateTime.now();
        // Todo force a update on page changes.
        getAPI(this.plugin.app)?.index.pages.forEach(p => {
            p.lists.forEach(l => {
                if (l.task) {
                    let parsedTask = parseTask(l.text);
                    alasql('INSERT INTO tasks VALUES ?', [{
                        page: p.path,
                        task: l.text,
                        status: l.task?.status,
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
        this.logger.log('info', `Tasks refreshed in ${DateTime.now().diff(start, 'millisecond').toString()}ms`);
    }


}

injected(DataTables, TOKENS.logger, TOKENS.plugin);
