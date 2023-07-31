import {Service} from '@ophidian/core';
import {type IRenderer} from 'Render/IRenderer';
import {LoggingService} from 'lib/LoggingService';

export class TextRenderer extends Service implements IRenderer {
  defaultTemplate = '';
  logger = this.use(LoggingService).getLogger('Qatt.TextRenderer');

  public renderTemplate(template: string, result: any) {
    this.logger.debug('rendering template', template);

    return JSON.stringify(result);
  }
}
