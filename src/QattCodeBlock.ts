import { parse } from 'yaml';

export interface IQattCodeBlock {
  customJSForSql: Array<string>;
  customJSForHandlebars: Array<string>;
  query: string | undefined;
  queryEngine: string | undefined;
  template: string | undefined;
  postRenderFormat: string | undefined;
  renderEngine: string | undefined;
  logLevel: string | undefined;
  codeBlockContent: string;
}

export class QattCodeBlock implements IQattCodeBlock {
  customJSForSql: Array<string>;
  customJSForHandlebars: Array<string>;
  query: string | undefined;
  queryEngine: string | undefined;
  template: string | undefined;
  postRenderFormat: string | undefined;
  renderEngine: string | undefined;
  logLevel: string | undefined;
  codeBlockContent: string;

  constructor (
    codeBlockContent: string
  ) {
    this.codeBlockContent = codeBlockContent;
    const parsedCodeBlock = parse(codeBlockContent);

    this.customJSForSql = parsedCodeBlock.customJSForSql;
    this.customJSForHandlebars = parsedCodeBlock.customJSForHandlebars;
    this.query = parsedCodeBlock.query;
    this.queryEngine = parsedCodeBlock.queryEngine;
    this.template = parsedCodeBlock.template;
    this.postRenderFormat = parsedCodeBlock.postRenderFormat;
    this.renderEngine = parsedCodeBlock.renderEngine;
    this.logLevel = parsedCodeBlock.logLevel;
  }
}
