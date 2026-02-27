import {Service} from '@ophidian/core';
import {type QattCodeBlock} from 'QattCodeBlock.ts';
import {type IRenderer} from 'Render/IRenderer.ts';
import {LoggingService} from 'lib/LoggingService.ts';

export class TextRenderer extends Service implements IRenderer {
  defaultTemplate = '';
  logger = this.use(LoggingService).getLogger('Qatt.TextRenderer');

  public async renderTemplate(codeblockConfiguration: QattCodeBlock, result: any) {
    this.logger.debug('rendering template is just JSON.stringify');

    return JSON.stringify(result);
  }
}
