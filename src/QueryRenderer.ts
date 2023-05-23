import Handlebars from 'handlebars';
import { parse } from 'yaml';
import { IQuery } from 'Interfaces/IQuery';
import { QuerySql } from 'QuerySql';
import { logging } from 'lib/logging';
import { App, Component, MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild } from 'obsidian';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';

export class QueryRenderer {
  public addQuerySqlRenderChild = this._addQuerySqlRenderChild.bind(this);
  _logger = logging.getLogger('Qatt.QueryRenderer');

  private readonly _app: App;

  constructor (
    private plugin: IQueryAllTheThingsPlugin
  ) {
    this._app = plugin.app;
    plugin.registerMarkdownCodeBlockProcessor('qatt', this._addQuerySqlRenderChild.bind(this));
  }

  private async _addQuerySqlRenderChild (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
    this._logger.debug(`Adding SQL Query Render for ${source} to context ${context.docId}`);
    context.addChild(
      new QueryRenderChild(
        this._app,
        this.plugin,
        element,
        source,
        new QuerySql(
          source,
          context.sourcePath,
          context.frontmatter,
          this.plugin
        )
      )
    );
  }
}

class QueryRenderChild extends MarkdownRenderChild {
  private readonly queryId: string;
  // private queryReloadTimeout: NodeJS.Timeout | undefined;

  _logger = logging.getLogger('Qatt.QueryRenderChild');

  constructor (
    private app: App,
    private plugin: IQueryAllTheThingsPlugin,
    private container: HTMLElement,
    private source: string,
    private queryEngine: IQuery
  ) {
    super(container);
    this.queryId = 'TBD';
    this._logger.debug(`Query Render generated for class ${this.containerEl.className} -> ${this.container}`);

    // Just add the simple helpers here.
    Handlebars.registerHelper({
      capitalize: (word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      },
      lowercase: (word: string) => {
        return word.toLowerCase();
      },
      stringify: (value) => {
        return JSON.stringify(value, null, 2);
      },
      notelink: (value) => {
        return `[[${value}]]`;
      },
      group: function (list, options) {

        var fn = options.fn,
          inverse = options.inverse,
          hash = options.hash,
          prop = hash && hash.by,
          keys: string[] = [],
          groups = {};

        if (!prop || !list || !list.length) {
          return inverse(this);
        }

        function get (obj, prop) {
          var parts = prop.split('.'),
            last = parts.pop();

          while ((prop = parts.shift())) {
            obj = obj[prop];

            if (obj == null) {
              return;
            }
          }

          return obj[last];
        }

        function groupKey (item) {
          var key = get(item, prop);

          if (keys.indexOf(key) === -1) {
            keys.push(key);
          }

          if (!groups[key]) {
            groups[key] = {
              value: key,
              items: []
            };
          }

          groups[key].items.push(item);
        }

        function renderGroup (buffer, key) {
          return buffer + fn(groups[key]);
        }

        list.forEach(groupKey);

        return keys.reduce(renderGroup, '');
      }
    });

    Handlebars.registerHelper('tasklist', function (this: string, options) {
      let hash = 0;
      let i; let chr;
      if (this.length === 0) return hash;
      for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      const elementId = 'temp-prefix-' + hash;
      let itemHtml: boolean | string | undefined = false;

      const content = document.createElement('div');
      const parsedChildTemplate = options.fn(this);
      MarkdownPreviewView.renderMarkdown(parsedChildTemplate, content, '', new Component()).then(() => {
        itemHtml = content.firstElementChild?.innerHTML;
        const element = document.getElementById(elementId);
        if (element) {
          element.outerHTML = itemHtml ?? '';
        }
      });
      if (itemHtml) {
        return new Handlebars.SafeString(itemHtml);
      }
      return new Handlebars.SafeString('<span id="' + elementId + '">Loading..</span>');
    });

    // This one is more complex, probably a bad design as well. Works
    // on my machine!
    Handlebars.registerHelper('markdown2', function (this: string, options) {
      let hash = 0;
      let i; let chr;
      if (this.length === 0) return hash;
      for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      const elementId = 'temp-prefix-' + hash;
      let itemHtml: boolean | string | undefined = false;

      const content = document.createElement('div');
      const parsedChildTemplate = options.fn(this);
      MarkdownPreviewView.renderMarkdown(parsedChildTemplate, content, '', new Component()).then(() => {
        itemHtml = content.firstElementChild?.innerHTML;
        const element = document.getElementById(elementId);
        if (element) {
          element.outerHTML = itemHtml ?? '';
        }
      });
      if (itemHtml) {
        return new Handlebars.SafeString(itemHtml);
      }
      return new Handlebars.SafeString('<span id="' + elementId + '">Loading..</span>');
    });

    Handlebars.registerHelper('markdown', function (value) {
      let hash = 0;
      let i; let chr;
      if (value.length === 0) return hash;
      for (i = 0; i < value.length; i++) {
        chr = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      const elementId = 'temp-prefix-' + hash;
      let itemHtml: boolean | string | undefined = false;

      const content = document.createElement('div');
      MarkdownPreviewView.renderMarkdown(value, content, '', new Component()).then(() => {
        itemHtml = content.firstElementChild?.innerHTML;
        const element = document.getElementById(elementId);
        if (element) {
          element.outerHTML = itemHtml ?? '';
        }
      });
      if (itemHtml) {
        return new Handlebars.SafeString(itemHtml);
      }
      return new Handlebars.SafeString('<span id="' + elementId + '">Loading..</span>');
    });

    Handlebars.registerHelper('taskcheckbox', function (value) {
      let checked = '';
      let classList = 'task-list-item-checkbox';
      let nextStatus = 'x';
      const currentStatus = value.status;

      if (value.status !== ' ') {
        checked = 'checked';
        classList += ' is-checked';
        nextStatus = ' ';
      }

      const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} onclick="console.log(this.checked); qattUpdateOriginalTask('${value.page}',${value.line},'${currentStatus}','${nextStatus}');"></input>`;
      return new Handlebars.SafeString(checkBoxHtml);
    });

    (<any>window).qattUpdateOriginalTask = async function (page: string, line: number, currentStatus: string, nextStatus: string) {
      nextStatus = nextStatus === '' ? ' ' : nextStatus;

      const rawFileText = await plugin.app.vault.adapter.read(page);
      const hasRN = rawFileText.contains('\r');
      const fileText = rawFileText.split(/\r?\n/u);

      if (fileText.length < line) return;
      fileText[line] = fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`);

      const newText = fileText.join(hasRN ? '\r\n' : '\n');
      await plugin.app.vault.adapter.write(page, newText);
      app.workspace.trigger('dataview:refresh-views');
    };
  }

  hashCode = function (value: string) {
    let hash = 0;
    let i; let chr;
    if (value.length === 0) return hash;
    for (i = 0; i < value.length; i++) {
      chr = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  onload () {
    this.registerEvent(this.app.workspace.on('qatt:refresh-codeblocks', this.render));
    this.render();
  }

  onunload () {
    // if (this.queryReloadTimeout !== undefined) {
    //   clearTimeout(this.queryReloadTimeout);
    // }
  }

  render = async () => {
    const startTime = new Date(Date.now());
    const renderConfiguration = parse(this.source);

    // Run query and get results to be rendered.
    const results = this.queryEngine.applyQuery(this.queryId);
    this._logger.info('queryConfiguration', results);

    const template = Handlebars.compile(renderConfiguration.template ?? '{{stringify result}}');

    const content = this.containerEl.createEl('div');
    content.setAttr('data-query-id', this.queryId);

    if (this.queryEngine.error) {
      this._logger.error(`QATT query (${this.queryEngine.name}) error: ${this.queryEngine.error}`);
      content.setText(`QATT query error: ${this.queryEngine.error}`);
    } else {
      const html = template({ result: results });
      if (renderConfiguration.render === 'markdown') {
        await MarkdownPreviewView.renderMarkdown(html, content, '', this.plugin);
      } else {
        content.innerHTML = html;
      }
    }

    this.containerEl.firstChild?.replaceWith(content);
    const endTime = new Date(Date.now());
    this._logger.debugWithId(this.queryId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
  };
}
