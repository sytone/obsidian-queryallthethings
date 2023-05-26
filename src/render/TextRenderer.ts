import { logging } from 'lib/logging';
import { IRenderer } from 'Interfaces/IRenderer';

export class TextRenderer implements IRenderer {
  _logger = logging.getLogger('Qatt.TextRenderer');

  public renderTemplate (result: any) {
    return JSON.stringify(result);
  }
}
