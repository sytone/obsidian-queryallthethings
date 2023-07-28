/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {parseYaml} from 'obsidian';

/*

// >> docs-codeblock-configuration

When you create the query and template to render the results if the query the configuration values are placed in a markdown codeblock with the tag `qatt` added after the first three backticks of the block.

The configuration is YAML based and support the following properties. As it is YAML you can use the `|` symbol after the key name and enter your values on multimple lines whcih are indented.

customJSForSql

If you have the CustomJS plugin installed this field allows you to refernce any CustomeJS classes and methods and they will be loaded in the AlaSQL engine so you can call them in a query to extend the capabilities of the query for personal needs.

It expects an array of string with a space betwrrn the class name and the method name

So for example if you have a class called MyCoolClass with a method in it called ConvertWordsToEmoji you would set the value like this:

```
customJSForSql: ['MyCoolClass ConvertWordsToEmoji']
```

Then in the query field you can reference this function just like the other inbuilt functions already available.

customJSForHandlebars

This works the same as `customJSForSql` but makes the functions avaiable as helper blocks in handlebars so you can customise you rendering further.

query

This is the query to pass to the choosen query engine, currently only the AlaSQL engine is avaiable.

queryEngine

This defines the query engine to use to execute the query entered for the query field.

By default it will use alasql so you do not have to set this. The only supported value is `alasql` currently.

template

This value is used to render the results of the query.

postRenderFormat

Once the render engine is completed the output will be written to the page in Obsidian. As Obsidian uses HTML to display information to the user the rendered output will be treated as HTML. If you use a template that output markdown it would not be rendered correctly.

To make this simpler there are three options. The default is `micromark` which uses the micromark engine to convert markdown to HTML. It has all the GitHub extensions enabled  by default so should handle most markdown as you would expect Obsidian to handle it.

You can also choose `markdown` which uses the internal Obsdian markdown engine, this may cause some display issues as it need to render the markdown in an asyncoronus way so a page refresh may be needed if you are rendering more complex markdown blocks.

The last value is `html`, this assumes the rendered reults are already in a html format  ready to be displayed in Obsidian. This is used for more complext rendering of things like tasks so you can check them off from the query results and have the orginal not they are on updated.

renderEngine

By default it will use handlebars so you do not have to set this. It supports two options currently, `handlebars` whcih will use the handlebars library to render the results and `text` which will render the results as a JSON string. More can be added as needed and pul requests for new rendering formats are welcome.

logLevel

This sets the level of logging used when this code block is processed. Setting it to `debug` or `trace` will give you the raw data and rendered results in a raw format in the console. This is handy for debugging issues with the results or rendering.

replaceCodeBlock

**Pending**

As the results of the query and render are only shown in Obsidan if tou look at the markdown file in a text editor you will only see the query and template details. For most situations this would be fine but if you want the results and rendered output to be more permanant you can use this option to write the output to the page directly.

By default the value will be `never` so each time the page is shown in Obsidian it is dynamically rendered.

If you set it to `once` the entire codeblock will be processed and replaced with the output, this will remove the codeblock from the file completetly and the rendered results will not change from that point forward.

If you set it to `always` the rendered output will be placed before the codeblock and in preview and reading view the codeblock will be rendered as a blank string to hide it. It is still there and you can edit it in edit mode. When viewing in a text editor you will see the rendered output and then the coseblock below it. To place the rednderes content after the codeblock use `alwaysappend`. You can also use `alwaysprepend` if you want to be explicit.

// << docs-codeblock-configuration
*/
export interface IQattCodeBlock {
  customJSForSql: string[];
  customJSForHandlebars: string[];
  query: string | undefined;
  queryEngine: string | undefined;
  template: string | undefined;
  postRenderFormat: string | undefined;
  renderEngine: string | undefined;
  logLevel: string | undefined;
  codeBlockContent: string;
  replaceCodeBlock: string | undefined;
  queryDataSource: string;
  id: string;
}

export class QattCodeBlock implements IQattCodeBlock {
  customJSForSql: string[];
  customJSForHandlebars: string[];
  query: string | undefined;
  queryEngine: string | undefined;
  template: string | undefined;
  postRenderFormat: string | undefined;
  renderEngine: string | undefined;
  logLevel: string | undefined;
  replaceCodeBlock: string | undefined;
  queryDataSource: string;
  id: string;

  constructor(
    public codeBlockContent: string,
  ) {
    const parsedCodeBlock = parseYaml(codeBlockContent);

    this.customJSForSql = parsedCodeBlock.customJSForSql;
    this.customJSForHandlebars = parsedCodeBlock.customJSForHandlebars;
    this.query = parsedCodeBlock.query;
    this.queryEngine = parsedCodeBlock.queryEngine;
    this.template = parsedCodeBlock.template;
    this.postRenderFormat = parsedCodeBlock.postRenderFormat;
    this.renderEngine = parsedCodeBlock.renderEngine;
    this.id = parsedCodeBlock.id ?? this.generateCodeblockId(10);

    // Set to info by default.
    if (
      parsedCodeBlock.logLevel !== 'trace'
      && parsedCodeBlock.logLevel !== 'debug'
      && parsedCodeBlock.logLevel !== 'info'
      && parsedCodeBlock.logLevel !== 'warn'
      && parsedCodeBlock.logLevel !== 'error') {
      this.logLevel = 'info';
    } else {
      this.logLevel = parsedCodeBlock.logLevel;
    }

    if (
      parsedCodeBlock.replaceCodeBlock !== 'never'
      && parsedCodeBlock.replaceCodeBlock !== 'once'
      && parsedCodeBlock.replaceCodeBlock !== 'always'
      && parsedCodeBlock.replaceCodeBlock !== 'alwaysappend'
      && parsedCodeBlock.replaceCodeBlock !== 'alwaysprepend') {
      this.replaceCodeBlock = 'never';
    } else {
      this.replaceCodeBlock = parsedCodeBlock.replaceCodeBlock;
    }

    this.queryDataSource = this.getParsedQuerySource(this.query ?? '');
  }

  private getParsedQuerySource(query: string) {
    if (/\bobsidian_markdown_notes\b/gi.test(query)) {
      return 'qatt';
    }

    if (/\bobsidian_markdown_files\b/gi.test(query)) {
      return 'obsidian';
    }

    if (/\bdataview_pages\b/gi.test(query)) {
      return 'dataview';
    }

    if (/\bdataview_tasks\b/gi.test(query)) {
      return 'dataview';
    }

    if (/\bdataview_lists\b/gi.test(query)) {
      return 'dataview';
    }

    return '';
  }

  /**
   * Creates a unique ID for correlation of console logging.
   *
   * @private
   * @param {number} length
   * @return {*}  {string}
   * @memberof QuerySql
   */
  private generateCodeblockId(length: number): string {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]);

    const randomString = randomArray.join('');
    return randomString;
  }
}
