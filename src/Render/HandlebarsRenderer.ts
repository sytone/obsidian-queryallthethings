
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Service} from '@ophidian/core';
import Handlebars, {type HelperOptions} from 'handlebars';
import {LoggingService} from 'lib/LoggingService';
import {type IRenderer} from 'Render/IRenderer';
import {markdown2html} from 'Render/MicromarkRenderer';

export class HandlebarsRenderer extends Service implements IRenderer {
  defaultTemplate = '{{stringify result}}';
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

    // This map is just a simple way to hold the helper functions that are to be registered.
    type IMap = Record<string, {value: string; items: Array<Record<string, any>>}>;

    // Just add the simple helpers here.
    Handlebars.registerHelper({
      /*
      // >> docs-handlebars-helper-capitalize

      The `capitalize`\-helper will capitalize the first letter of the string.

      {% raw %}

      ```handlebars
        {{{capitalize sentence}}}
      ```

      {% endraw %}

      when used with this context:

      ```
      {
        sentence: "this is some sentence"
      }
      ```

      will result in:

      ```
      This is some sentence
      ```

      // << docs-handlebars-helper-capitalize
      */
      capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      },

      /*
      // >> docs-handlebars-helper-lowercase

      The `lowercase`\-helper will convert the entire string to lowercase.

      {% raw %}

      ```handlebars
        {{{lowercase sentence}}}
      ```

      {% endraw %}

      when used with this context:

      ```
      {
        sentence: "This Is Some SENtence"
      }
      ```

      will result in:

      ```
      this is some sentence
      ```

      // << docs-handlebars-helper-lowercase
      */
      lowercase(word: string) {
        return word.toLowerCase();
      },

      /*
      // >> docs-handlebars-helper-stringify

      The `lowercase`\-helper will convert the entire string to lowercase.

      {% raw %}

      ```handlebars
        {{{stringify complexObject}}}
      ```

      {% endraw %}

      when used with this context:

      ```
      {
        complexObject: {
          "this": "is",
          "a": "complex",
          "object": "with",
          "lots": "of",
          "things": "in",
          "it": "!"
        }
      }
      ```

      will result in:

      ```
      this is some sentence
      ```

      // << docs-handlebars-helper-stringify
      */
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

    {% raw %}

    ```handlebars
      {{{#micromark inline="true"}}} {{{task}}} [[{{{page}}}|📝]] {{{/micromark}}}
    ```

    {% endraw %}

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
  }

  public renderTemplate(template: string, result: any) {
    this.logger.debug('rendering compiled template', template);
    const compliedTemplate = Handlebars.compile(template ?? '{{stringify result}}');

    return compliedTemplate({result});
  }
}
