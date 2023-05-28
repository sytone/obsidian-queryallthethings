/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {logging} from 'lib/Logging';
import {type QattCodeBlock} from 'QattCodeBlock';
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {type IQuery} from 'Query/IQuery';

export class QueryFactory {
  public static getQuery(queryConfiguration: QattCodeBlock, sourcePath: string, frontmatter: any, plugin: IQueryAllTheThingsPlugin): IQuery {
    switch (queryConfiguration.queryEngine) {
      case 'alasql': {
        return new AlaSqlQuery(queryConfiguration, sourcePath, frontmatter, plugin);
      }

      default: {
        return new AlaSqlQuery(queryConfiguration, sourcePath, frontmatter, plugin);
      }
    }
  }

  _logger = logging.getLogger('Qatt.QueryFactory');
}
