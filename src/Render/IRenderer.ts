import {type QattCodeBlock} from 'QattCodeBlock.ts';

export interface IRenderer {
  renderTemplate: (codeblockConfiguration: QattCodeBlock, result: any) => Promise<string>;
  defaultTemplate: string;
}
