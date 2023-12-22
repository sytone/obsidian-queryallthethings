
/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Handlebars, {type HelperOptions} from 'handlebars';
import {markdown2html} from 'PostRender/MicromarkRenderer';

/**
   * This will register all the default handlebars helpers that make working
   * with the templates easier in Obsidian.
   *
   * @return {*}  {void}
   * @memberof HandlebarsHelpers
   */
export function registerHandlebarsHelpers(): void {
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

