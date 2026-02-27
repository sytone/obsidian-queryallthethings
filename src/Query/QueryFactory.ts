/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {type QattCodeBlock} from 'QattCodeBlock.ts';
import {AlaSqlQuery} from 'Query/AlaSqlQuery.ts';
import {type IQuery} from 'Query/IQuery.ts';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService.ts';

export class QueryFactory extends Service {
  logger = this.use(LoggingService).getLogger('Qatt.QueryFactory');

  async onload() {
    this.logger.info('QueryFactory loaded');
  }

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
        return query;
      }
    }
  }
}
