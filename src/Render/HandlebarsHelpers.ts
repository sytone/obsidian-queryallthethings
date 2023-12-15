
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Handlebars, {type HelperOptions} from 'handlebars';
import {markdown2html} from 'PostRender/MicromarkRenderer';
/*
  // >> id='docs-handlebars-helper-capitalize' options=''

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
export function registerCapitalize(): void {
  Handlebars.registerHelper('capitalize', (word: string) => word.charAt(0).toUpperCase() + word.slice(1));
}

/*
  // >> id='docs-handlebars-helper-lowercase' options='file=hb-helpers/lowercase.md'
  title: lowercase value
  ---
  The `lowercase`\-helper will convert the entire string to lowercase.

  {% raw %}

  ```handlebars
  {{{lowercase sentence}}}
  ```

  {% endraw %}

  when used with this context:

  ```json
  {
    sentence: "This Is Some SENtence"
  }
  ```

  will result in:

  ```text
  this is some sentence
  ```

  // << docs-handlebars-helper-lowercase
  */
export function registerLowercase(): void {
  Handlebars.registerHelper('lowercase', (word: string) =>
    typeof word === 'string' ? word.toLowerCase() : typeof (word as any),
  );
}

/*
  // >> id='docs-handlebars-helper-uppercase' options='file=hb-helpers/uppercase.md'
  title: uppercase value
  ---
  The `uppercase`\-helper will convert the entire string to uppercase.

  {% raw %}

  ```handlebars
    {{{uppercase sentence}}}
  ```

  {% endraw %}

  when used with this context:

  ```json
  {
    sentence: "This Is Some SENtence"
  }
  ```

  will result in:

  ```text
  THIS IS SOME SENTENCE
  ```
  // << docs-handlebars-helper-uppercase
  */
export function registerUppercase(): void {
  Handlebars.registerHelper('uppercase', (word: string) => word ? word.toUpperCase() : word);
}

/*
  // >> id='docs-handlebars-helper-stringify' options='file=hb-helpers/stringify.md'
  title: stringify value
  ---
  The `stringify`\-helper will convert the referenced object to a JSON string.

  {% raw %}

  ```handlebars
    {{{stringify complexObject}}}
  ```

  {% endraw %}

  when used with this context:

  ```json
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

  ```text
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

  // << docs-handlebars-helper-stringify
  */
export function registerStringify(): void {
  Handlebars.registerHelper('stringify', (value: any) => new Handlebars.SafeString(JSON.stringify(value, null, 2)));
}

export function registerCodeBlockHeader(): void {
  Handlebars.registerHelper('codeBlockHeader', (value: any) => new Handlebars.SafeString('```' + value));
}

export function registerCodeBlockFooter(): void {
  Handlebars.registerHelper('codeBlockFooter', () => new Handlebars.SafeString('```'));
}

export function registerToInt(): void {
  Handlebars.registerHelper('toInt', (value: any) => Number.parseInt(value, 10));
}

export function registerTrim(): void {
  Handlebars.registerHelper('trim', (value: string) => String(value).trim());
}

export function registerNotelink(): void {
  Handlebars.registerHelper('notelink', (value: string) => `[[${value}]]`);
}

export function registerIsHighPriority(): void {
  Handlebars.registerHelper('isHighPriority', (value: number) => value === 1);
}

export function registerIsMediumPriority(): void {
  Handlebars.registerHelper('isMediumPriority', (value: number) => value === 2);
}

export function registerIsLowPriority(): void {
  Handlebars.registerHelper('isLowPriority', (value: number) => value === 3);
}

export function registerGroup(): void {
    type IMap = Record<string, {value: string; items: Array<Record<string, any>>}>;

    Handlebars.registerHelper('group',
      function (list, options: HelperOptions) {
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
      });
}

/**
   * This will register all the default handlebars helpers that make working
   * with the templates easier in Obsidian.
   *
   * @return {*}  {void}
   * @memberof HandlebarsHelpers
   */
export function registerHandlebarsHelpers(): void {
  registerCapitalize();
  registerLowercase();
  registerUppercase();
  registerStringify();
  registerNotelink();
  registerIsHighPriority();
  registerIsMediumPriority();
  registerIsLowPriority();
  registerGroup();
  registerCodeBlockHeader();
  registerCodeBlockFooter();
  registerToInt();
  registerTrim();

  // Just add the simple helpers here.
  Handlebars.registerHelper({

    pad(count, options: HelperOptions) {
      const fn = options.fn;
      const inverse = options.inverse;
      const hash = options.hash;
      const paddingString = hash?.padWith ?? '  ';
      return new Handlebars.SafeString(paddingString.repeat((count as number)));
    },

    /*
// >> id='docs-handlebars-helper-obsidianhtmlinternallink' options='file=hb-helpers/obsidianhtmlinternallink.md'
title: obsidian html internal link
---
The `obsidianHtmlInternalLink` helper takes a path and a label and returns a link
matches the default HTML that obsidian uses for internal links. If ths files ends
in `.md` then the extension is removed from the link.

{% raw %}

```handlebars
  {{{obsidianHtmlInternalLink internalPath basename}}}
```

{% endraw %}

when used with this context:

```
{
  path: "notepages/school/My Cool Page",
  name: "My Cool Page is here!"
}
```

will result in:

```
<a data-tooltip-position="top" aria-label="notepages/school/My Cool Page" data-href="notepages/school/My Cool Page" href="notepages/school/My Cool Page" class="internal-link" target="_blank" rel="noopener">My Cool Page is here!</a>
```

// << docs-handlebars-helper-obsidianhtmlinternallink
*/
    obsidianHtmlInternalLink(link: string, label: string) {
      return new Handlebars.SafeString(`<a data-tooltip-position="top" aria-label="${link}" data-href="${link}" href="${link}" class="internal-link" target="_blank" rel="noopener">${label}</a>`);
    },

  });

  /*
    // >> id='handlebars-helper-micromark-snippet' options=''

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

  // Old Reference
  // Handlebars.registerHelper('taskcheckbox', value => {
  //   console.log(value);
  //   let checked = '';
  //   let classList = 'task-list-item-checkbox';
  //   let nextStatus = 'x';
  //   const currentStatus: string = value.status as string;

  //   if (value.status !== ' ') {
  //     checked = 'checked';
  //     classList += ' is-checked';
  //     nextStatus = ' ';
  //   }

  //   const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTask('${value.page as string}',${value.line as string},'${currentStatus}','${nextStatus}');"></input>`;
  //   return new Handlebars.SafeString(checkBoxHtml);
  // });
}

