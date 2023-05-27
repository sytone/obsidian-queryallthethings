/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import { logging } from 'lib/logging';
import { QattCodeBlock } from 'QattCodeBlock';
import { IRenderer } from 'render/IRenderer';
import { HandlebarsRenderer } from 'render/HandlebarsRenderer';
import { TextRenderer } from 'render/TextRenderer';

export class RenderFactory {
  _logger = logging.getLogger('Qatt.QueryRenderer');

  public static getRenderer (queryConfiguration: QattCodeBlock): IRenderer {
    switch (queryConfiguration.renderEngine) {
      case 'handlebars':
        return new HandlebarsRenderer(queryConfiguration.template ?? '{{stringify result}}');
      case 'text':
        return new TextRenderer();
      default:
        return new HandlebarsRenderer(queryConfiguration.template ?? '{{stringify result}}');
    }
  }
}
