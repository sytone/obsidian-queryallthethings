/* eslint-disable no-bitwise */
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Handlebars, {type HelperOptions} from 'handlebars';
import {Component, MarkdownPreviewView} from 'obsidian';
import {Md5} from 'ts-md5';
import {logging} from 'lib/Logging';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {type IRenderer} from 'Render/IRenderer';
import {markdown2html} from 'Render/MicromarkRenderer';

export class HandlebarsRenderer implements IRenderer {
  public static registerHandlebarsHelpers(plugin: IQueryAllTheThingsPlugin) {
    const app = plugin.app;
    type IMap = Record<string, {value: string; items: Array<Record<string, any>>}>;
    // Just add the simple helpers here.
    Handlebars.registerHelper({
      capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      },
      lowercase(word: string) {
        return word.toLowerCase();
      },
      stringify(value) {
        return JSON.stringify(value, null, 2);
      },
      notelink(value) {
        return `[[${value as string}]]`;
      },
      isHighPriority(value) {
        return value === 1;
      },
      isMediumPriority(value) {
        return value === 2;
      },
      isLowPriority(value) {
        return value === 3;
      },
      group(list, options: HelperOptions) {
        const fn = options.fn;
        const inverse = options.inverse;
        const hash = options.hash;
        const prop = hash?.by;
        const keys: string[] = [];
        const groups: IMap = {};

        if (!prop || !list || list.length === 0) {
          return inverse(this);
        }

        // Gets the value of the property name specified by prop. This comes
        // from the by part of the helper.
        function get(object: Record<string, any>, prop: string | undefined) {
          if (prop === undefined) {
            return undefined;
          }

          const parts = prop.split('.');
          const last = parts.pop();

          while ((prop = parts.shift())) {
            object = object[prop];

            if (object === null) {
              return;
            }
          }

          if (last === undefined) {
            return undefined;
          }

          return object[last];
        }

        function groupKey(item: Record<string, any>) {
          const key = get(item, prop);

          if (!keys.includes(key)) {
            keys.push(key);
          }

          if (!groups[key]) {
            groups[key] = {
              value: key,
              items: [],
            };
          }

          groups[key].items.push(item);
        }

        function renderGroup(buffer: any, key: string | number) {
          return buffer + fn(groups[key]);
        }

        list.forEach(groupKey);

        return keys.reduce(renderGroup, '');
      },
    });

    /*
    // >> handlebars-helper-micromark-snippet

    The `micromark`\-helper renders markdown as HTML using the micromark library. It has one setting
    which will remove the wrapping `<p>` tag from the output if inline is set to true.

    ```
    {{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}}
    ```

    when used with this context:

    ```
    {
      task: "This is a **thing** to do",
      page: "folder/SomePage.md"
    }
    ```

    will result in:

    ```
    This is a <strong>thing</strong> to do
    ```

    If the inline property is not set, then the output will be wrapped in a `<p>` tag and result in:

    ```
    <p>This is a <strong>thing</strong> to do</p>
    ```

    // << handlebars-helper-micromark-snippet
    */
    Handlebars.registerHelper('micromark', function (this: any, options) {
      const hash = options.hash;
      const inline = hash?.inline === 'true';
      const parsedChildTemplate = markdown2html(options.fn(this), inline);
      return new Handlebars.SafeString(parsedChildTemplate);
    });

    Handlebars.registerHelper('tasklist', function (this: string, options) {
      let hash = 0;
      let i;
      let chr: number;
      if (this.length === 0) {
        return hash;
      }

      for (i = 0; i < this.length; i++) {
        chr = this.codePointAt(i) ?? 0;
        hash = ((hash << 5) - hash) + chr;
        hash = Math.trunc(hash); // Convert to 32bit integer
      }

      const elementId = 'temp-prefix-' + hash;
      let itemHtml: boolean | string | undefined = false;

      const content = document.createElement('div');
      const parsedChildTemplate = options.fn(this);
      MarkdownPreviewView.renderMarkdown(parsedChildTemplate, content, '', new Component()).then(() => {
        itemHtml = content.firstElementChild?.innerHTML;
        const element = document.querySelector(`#${elementId}`);
        if (element) {
          element.outerHTML = itemHtml ?? '';
        }
      }).catch(error => {
        console.error(error);
      });

      if (itemHtml) {
        return new Handlebars.SafeString(itemHtml);
      }

      return new Handlebars.SafeString('<span id="' + elementId + '">Loading..</span>');
    });

    // This one is more complex, probably a bad design as well. Works
    // on my machine!
    Handlebars.registerHelper('markdown2', function (this: any, options) {
      const hash: string = Md5.hashStr(JSON.stringify(this));

      const elementId = 'temp-prefix-' + hash;
      let itemHtml: boolean | string | undefined = false;

      const content = document.createElement('div');
      const parsedChildTemplate = options.fn(this);
      MarkdownPreviewView.renderMarkdown(parsedChildTemplate, content, '', new Component()).then(() => {
        itemHtml = content.firstElementChild?.innerHTML;
        const element = document.querySelector(`#${elementId}`);
        if (element) {
          element.outerHTML = itemHtml ?? '';
        }
      }).catch(error => {
        console.error(error);
      });
      if (itemHtml) {
        return new Handlebars.SafeString(itemHtml);
      }

      return new Handlebars.SafeString('<span id="' + elementId + '">Loading..</span>');
    });

    Handlebars.registerHelper('markdown', value => {
      const hash: string = Md5.hashStr(JSON.stringify(this));

      const elementId = 'temp-prefix-' + hash;
      let itemHtml: boolean | string | undefined = false;

      const content = document.createElement('div');
      MarkdownPreviewView.renderMarkdown(value, content, '', new Component()).then(() => {
        itemHtml = content.firstElementChild?.innerHTML;
        const element = document.querySelector(`#${elementId}`);
        if (element) {
          element.outerHTML = itemHtml ?? '';
        }
      }).catch(error => {
        console.error(error);
      });
      if (itemHtml) {
        return new Handlebars.SafeString(itemHtml);
      }

      return new Handlebars.SafeString('<span id="' + elementId + '">Loading..</span>');
    });

    Handlebars.registerHelper('taskcheckbox', value => {
      let checked = '';
      let classList = 'task-list-item-checkbox';
      let nextStatus = 'x';
      const currentStatus: string = value.status as string;

      if (value.status !== ' ') {
        checked = 'checked';
        classList += ' is-checked';
        nextStatus = ' ';
      }

      const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTask('${value.page as string}',${value.line as string},'${currentStatus}','${nextStatus}');"></input>`;
      return new Handlebars.SafeString(checkBoxHtml);
    });

    (window as any).qattUpdateOriginalTask = async function (page: string, line: number, currentStatus: string, nextStatus: string) {
      nextStatus = nextStatus === '' ? ' ' : nextStatus;

      const rawFileText = await plugin.app.vault.adapter.read(page);
      const hasRN = rawFileText.contains('\r');
      const fileText = rawFileText.split(/\r?\n/u);

      if (fileText.length < line) {
        return;
      }

      fileText[line] = fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`);

      const newText = fileText.join(hasRN ? '\r\n' : '\n');
      await plugin.app.vault.adapter.write(page, newText);
      app.workspace.trigger('dataview:refresh-views');
    };
  }

  _logger = logging.getLogger('Qatt.HandlebarsRenderer');

  private readonly compliedTemplate;

  constructor(
    private readonly template: string,
  ) {
    this.compliedTemplate = Handlebars.compile(template ?? '{{stringify result}}');
  }

  public renderTemplate(result: any) {
    this._logger.debug('rendering compiled template', this.template);
    return this.compliedTemplate({result});
  }
}
