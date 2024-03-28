/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {Service} from '@ophidian/core';
import {type IQattCodeBlock} from 'QattCodeBlock';
import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {MicromarkPostRenderer} from 'PostRender/MicromarkPostRenderer';
import {ObsidianPostRenderer} from 'PostRender/ObsidianPostRenderer';
import {HtmlPostRenderer} from 'PostRender/HtmlPostRenderer';
import {RawPostRenderer} from 'PostRender/RawPostRenderer';

export class PostRendererFactory extends Service {
  public async getPostRender(codeblockConfiguration: IQattCodeBlock): Promise<IPostRenderer> {
    let postRenderer: IPostRenderer;
    switch (codeblockConfiguration.postRenderFormat) {
      case 'markdown': {
        postRenderer = new ObsidianPostRenderer();
        break;
      }

      case 'micromark': {
        postRenderer = new MicromarkPostRenderer();
        break;
      }

      case 'html': {
        postRenderer = new HtmlPostRenderer();
        break;
      }

      case 'raw': {
        postRenderer = new RawPostRenderer();
        break;
      }

      default: {
        postRenderer = new RawPostRenderer();
        break;
      }
    }

    return postRenderer;
  }
}
