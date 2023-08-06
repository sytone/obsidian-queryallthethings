import {type QattCodeBlock} from 'QattCodeBlock';

export interface IQuery {
  name: string | undefined;
  codeblockConfiguration: QattCodeBlock;
  error: string | undefined;
  applyQuery: (queryId: string) => any;
}
