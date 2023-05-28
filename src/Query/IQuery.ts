import {type QattCodeBlock} from 'QattCodeBlock';

export interface IQuery {
  name: string | undefined;
  queryConfiguration: QattCodeBlock;
  error: string | undefined;
  applyQuery: (queryId: string) => any;
}
