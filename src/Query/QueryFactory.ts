/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {type QattCodeBlock} from 'QattCodeBlock';
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {type IQuery} from 'Query/IQuery';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';

export class QueryFactory extends Service {
  public getQuery(queryConfiguration: QattCodeBlock, sourcePath: string, frontmatter: any, renderId?: string): IQuery {
    switch (queryConfiguration.queryEngine) {
      case 'alasql': {
        const query = this.use.fork().use(AlaSqlQuery);
        query.setupQuery(queryConfiguration, sourcePath, frontmatter, renderId);
        return query;
      }

      default: {
        const query = this.use.fork().use(AlaSqlQuery);
        query.setupQuery(queryConfiguration, sourcePath, frontmatter, renderId);
        return query; }
    }
  }
}
