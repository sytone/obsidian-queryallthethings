import { QattCodeBlock } from 'QattCodeBlock';

export interface IQuery {
  name: string;
  queryConfiguration: QattCodeBlock;
  error: string | undefined;
  applyQuery: (queryId: string) => any;
};
