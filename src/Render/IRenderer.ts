import {type QattCodeBlock} from 'QattCodeBlock';

export interface IRenderer {
  renderTemplate: (codeblockConfiguration: QattCodeBlock, result: any) => Promise<string>;
  defaultTemplate: string;
}
