/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {logging} from 'lib/Logging';
import {type IQattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {TextRenderer} from 'Render/TextRenderer';
import {Service} from '@ophidian/core';

export class RenderFactory extends Service {
  public getRenderer(queryConfiguration: IQattCodeBlock): IRenderer {
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
}
