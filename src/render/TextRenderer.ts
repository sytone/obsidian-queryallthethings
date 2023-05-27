import { logging } from 'lib/logging';
import { IRenderer } from 'render/IRenderer';

export class TextRenderer implements IRenderer {
  _logger = logging.getLogger('Qatt.TextRenderer');

  public renderTemplate (result: any) {
    return JSON.stringify(result);
  }
}
