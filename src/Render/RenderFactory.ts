/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {type IQattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {TextRenderer} from 'Render/TextRenderer';
import {Service} from '@ophidian/core';

export class RenderFactory extends Service {
  public async getRenderer(codeblockConfiguration: IQattCodeBlock): Promise<IRenderer> {
    switch (codeblockConfiguration.renderEngine) {
      case 'handlebars': {
        return this.use(HandlebarsRenderer);
      }

      case 'text': {
        return this.use(TextRenderer);
      }

      default: {
        return this.use(HandlebarsRenderer);
      }
    }
  }
}
