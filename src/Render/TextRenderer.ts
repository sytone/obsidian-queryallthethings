import {Service} from '@ophidian/core';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {LoggingService} from 'lib/LoggingService';

export class TextRenderer extends Service implements IRenderer {
  defaultTemplate = '';
  logger = this.use(LoggingService).getLogger('Qatt.TextRenderer');

  public async renderTemplate(codeblockConfiguration: QattCodeBlock, result: any) {
    this.logger.debug('rendering template is just JSON.stringify');

    return JSON.stringify(result);
  }
}
