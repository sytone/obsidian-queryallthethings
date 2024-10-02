/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Service} from '@ophidian/core';
import {Plugin, type TFile} from 'obsidian';
import Handlebars from 'handlebars';
import {LoggingService} from 'lib/LoggingService';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import * as handlebarsHelpers from 'Render/HandlebarsHelpers';

export class HandlebarsRenderer extends Service implements IRenderer {
  defaultTemplate = '{{stringify result}}';
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.HandlebarsRenderer');

  /**
   * This will register all the default handlebars helpers that make working
   * with the templates easier in Obsidian.
   *
   * @return {*}  {void}
   * @memberof HandlebarsRenderer
   */
  onload(): void {
    this.logger.info('Setting up inbuilt Handlebars helpers');

    // Iterate through all the exported helpers in the HandlebarsHelpers/index.ts file
    for (const handlebarsHelper of Object.entries(handlebarsHelpers)) {
      Handlebars.registerHelper(handlebarsHelper[0], handlebarsHelper[1]);
    }

    this.logger.info('HandlebarsRenderer loaded');
  }

  public async renderTemplate(codeblockConfiguration: QattCodeBlock, result: any) {
    if (codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(codeblockConfiguration.logLevel);
    }

    let template = this.defaultTemplate;

    if (codeblockConfiguration.templateFile) {
      const templateFile = this.plugin.app.vault.getAbstractFileByPath(codeblockConfiguration.templateFile);
      const content = (await this.plugin.app.vault.cachedRead(templateFile as TFile));
      template = content;
    } else if (codeblockConfiguration.template) {
      template = codeblockConfiguration.template ?? '';
    }

    this.logger.debug('rendering compiled template:', template);
    const compliedTemplate = Handlebars.compile(template);

    return compliedTemplate({result});
  }
}

