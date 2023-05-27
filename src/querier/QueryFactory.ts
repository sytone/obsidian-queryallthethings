/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { logging } from 'lib/logging';
import { QattCodeBlock } from 'QattCodeBlock';
import { AlaSqlQuery } from './AlaSqlQuery';
import { IQuery } from './IQuery';

export class QueryFactory {
  _logger = logging.getLogger('Qatt.QueryFactory');

  public static getQuery (queryConfiguration: QattCodeBlock, sourcePath: string, frontmatter: any | null | undefined, plugin: IQueryAllTheThingsPlugin): IQuery {
    switch (queryConfiguration.queryEngine) {
      case 'alasql':
        return new AlaSqlQuery(queryConfiguration, sourcePath, frontmatter, plugin);
      default:
        return new AlaSqlQuery(queryConfiguration, sourcePath, frontmatter, plugin);
    }
  }
}
