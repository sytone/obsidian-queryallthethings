/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {Service} from '@ophidian/core';
import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {MicromarkPostRenderer} from 'PostRender/MicromarkRenderer';
import {ObsidianRenderer} from 'PostRender/ObsidianRenderer';
import {HtmlRenderer} from 'PostRender/HtmlRenderer';
import {RawRenderer} from 'PostRender/RawRenderer';

export class PostRendererFactory extends Service {
  public async getPostRender(postRenderFormat: string): Promise<IPostRenderer> {
    let postRenderer: IPostRenderer;
    switch (postRenderFormat) {
      case 'markdown': {
        postRenderer = new ObsidianRenderer();
        break;
      }

      case 'micromark': {
        postRenderer = new MicromarkPostRenderer();
        break;
      }

      case 'html': {
        postRenderer = new HtmlRenderer();
        break;
      }

      case 'raw': {
        postRenderer = new RawRenderer();
        break;
      }

      default: {
        postRenderer = new RawRenderer();
        break;
      }
    }

    return postRenderer;
  }
}
