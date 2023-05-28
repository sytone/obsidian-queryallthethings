/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {logging} from 'lib/Logging';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'render/IRenderer';
import {HandlebarsRenderer} from 'render/HandlebarsRenderer';
import {TextRenderer} from 'render/TextRenderer';

export class RenderFactory {
  public static getRenderer(queryConfiguration: QattCodeBlock): IRenderer {
    switch (queryConfiguration.renderEngine) {
      case 'handlebars': {
        return new HandlebarsRenderer(queryConfiguration.template ?? '{{stringify result}}');
      }

      case 'text': {
        return new TextRenderer();
      }

      default: {
        return new HandlebarsRenderer(queryConfiguration.template ?? '{{stringify result}}');
      }
    }
  }

  _logger = logging.getLogger('Qatt.QueryRenderer');
}
