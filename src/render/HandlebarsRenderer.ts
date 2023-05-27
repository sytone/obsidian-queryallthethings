import Handlebars from 'handlebars';
import { Component, MarkdownPreviewView } from 'obsidian';

import { logging } from 'lib/logging';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { IRenderer } from 'render/IRenderer';

export class HandlebarsRenderer implements IRenderer {
  _logger = logging.getLogger('Qatt.HandlebarsRenderer');

  private compliedTemplate;

  constructor (
    private template: string
  ) {
    this.compliedTemplate = Handlebars.compile(template ?? '{{stringify result}}');
  }

  public renderTemplate (result: any) {
    this._logger.debug('rendering compiled template', this.template);
    return this.compliedTemplate({ result });
  }

  public static registerHandlebarsHelpers (plugin: IQueryAllTheThingsPlugin) {
    const app = plugin.app;
    interface IMap {
      [key: string]: { value: string, items: Array<{ [x: string]: any; }> };
    }
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
        const fn = options.fn;
        const inverse = options.inverse;
        const hash = options.hash;
        const prop = hash && hash.by;
        const keys: string[] = [];
        const groups: IMap = {};

        if (!prop || !list || !list.length) {
          return inverse(this);
        }

        function get (obj: { [x: string]: any; }, prop: string | undefined) {
          if (prop === undefined) {
            return undefined;
          }

          const parts = prop.split('.');
          const last = parts.pop();

          while ((prop = parts.shift())) {
            obj = obj[prop];

            if (obj == null) {
              return;
            }
          }

          if (last === undefined) {
            return undefined;
          }
          return obj[last];
        }

        function groupKey (item: { [x: string]: any; }) {
          const key = get(item, prop);

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

        function renderGroup (buffer: any, key: string | number) {
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

      const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTask('${value.page}',${value.line},'${currentStatus}','${nextStatus}');"></input>`;
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
}
