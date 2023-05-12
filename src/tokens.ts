import { token } from 'brandi';

import { IQueryAllTheThingsPlugin } from 'IQueryAllTheThingsPlugin';
import { ILogger } from 'lib/logging';

export const TOKENS = {
    logger: token<ILogger>('logger'),
    plugin: token<IQueryAllTheThingsPlugin>('plugin'),
    dataTables: token<IQueryAllTheThingsPlugin>('plugin')

};
