/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {type QattCodeBlock} from 'QattCodeBlock';
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {type IQuery} from 'Query/IQuery';
import {Service} from '@ophidian/core';

export class QueryFactory extends Service {
  public async getQuery(codeblockConfiguration: QattCodeBlock, sourcePath: string, frontmatter: any, renderId?: string): Promise<IQuery> {
    switch (codeblockConfiguration.queryEngine) {
      case 'alasql': {
        const query = this.use.fork().use(AlaSqlQuery);
        await query.setupQuery(codeblockConfiguration, sourcePath, frontmatter, renderId ?? '');
        return query;
      }

      default: {
        const query = this.use.fork().use(AlaSqlQuery);
        await query.setupQuery(codeblockConfiguration, sourcePath, frontmatter, renderId ?? '');
        return query; }
    }
  }
}
