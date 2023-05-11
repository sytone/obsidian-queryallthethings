import { log } from './lib/logging';
import alasql from 'alasql';
import { getAPI } from "obsidian-dataview";
import moment from 'moment';
import { parseTask } from 'Parse/parsers';

export default class DataTables {


    public static refreshTables() {
        if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length == 0) {
            alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
        }
        if (alasql('SHOW TABLES FROM alasql LIKE "tasks"').length != 0) {
            alasql('DROP TABLE tasks ');

        }
        alasql('CREATE TABLE tasks ');

        let start = moment();
        // Todo force a update on page changes.
        getAPI(this.app)?.index.pages.forEach(p => {
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
        log('info', `Tasks refreshed in ${moment().diff(start, 'millisecond').toString()}ms`);
    }


}


