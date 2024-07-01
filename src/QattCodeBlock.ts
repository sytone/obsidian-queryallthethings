/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {parseYaml} from 'obsidian';

/**
* This is the interface for the YAML configuration stored in the markdown codeblock in Obsidian
*
* @export
* @interface IQattCodeBlock
*
* Published documentation:
// >> id='docs-codeblock-configuration' options='file=codeblock.md'
---
order: 4

title: Codeblock Configuration
---

When you create the query and template to render the results if the query the configuration values are placed in a markdown codeblock with the tag `qatt` added after the first three backticks of the block.

The configuration is YAML based and support the following properties. As it is YAML you can use the `|` symbol after the key name and enter your values on multiple lines which are indented.

Here is an example of all codeblock configurations

```yaml
customJSForSql: ['MyCoolClass ConvertWordsToEmoji','MyCoolClass AnotherSQLFunction']
customJSForHandlebars: ['MyCoolClass MyHandlebarsHelper']
query: |
  SELECT TOP 10
    basename
  FROM obsidian_notes
queryFile: qatt/queries/GetTop10Notes.md
queryEngine: alasql
template: |
  {{#each result}}
  {{basename}}
  {{/each}}
templateFile: qatt/templates/ListOfNotes.md
postRenderFormat: markdown | micromark | html | raw
renderEngine: handlebars | text
logLevel: trace | debug | info | warn | error
replaceCodeBlock: true | false
replaceTargetPath: notes/topten.md
replaceType: never | once | onceDaily | onceDailyAppend | onceDailyPrepend | onceWeekly | always | alwaysappend | alwaysprepend
```

%%snippet id='docs-codeblock-configuration-customjsforsql' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-customjsforhandlebars' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-query' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-queryfile' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-queryengine' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-template' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-templatefile' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-postrenderformat' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-renderengine' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-loglevel' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-replacecodeblock' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-replacetargetpath' options='nocodeblock'%%
%%/snippet%%

%%snippet id='docs-codeblock-configuration-replacetype' options='nocodeblock'%%
%%/snippet%%

// << docs-codeblock-configuration
*/
export interface IQattCodeBlock {

  /**
   * Array of classes and functions to pull from Custom JS.
   *
   * @type {string[]}
   * @memberof IQattCodeBlock
   * Published documentation:
  // >> id='docs-codeblock-configuration-customjsforsql' options=''

  ## customJSForSql

  If you have the CustomJS plugin installed this field allows you to reference any CustomJS classes and methods and they will be loaded in the AlaSQL engine so you can call them in a query to extend the capabilities of the query for personal needs.

  It expects an array of string with a space between the class name and the method name

  So for example if you have a class called MyCoolClass with a method in it called ConvertWordsToEmoji you would set the value like this:

  ```
  customJSForSql: ['MyCoolClass ConvertWordsToEmoji']
  ```

  Then in the query field you can reference this function just like the other inbuilt functions already available.
  // << docs-codeblock-configuration-customjsforsql
   */
  customJSForSql: string[];

  /**
   * Array of classes and functions to pull from Custom JS.
   *
   * @type {string[]}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-customjsforhandlebars' options=''

   ## customJSForHandlebars

   This works the same as `customJSForSql` but makes the functions available as helper blocks in handlebars so you can customize you rendering further.

   // << docs-codeblock-configuration-customjsforhandlebars
   */
  customJSForHandlebars: string[];

  /**
   * The query to pass to the chosen query engine, currently only the AlaSQL engine is available.
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-query' options=''

   ## query

   This is the query to pass to the chosen query engine, currently only the AlaSQL engine is available.

   // << docs-codeblock-configuration-query
   */
  query: string | undefined;

  /**
   * Path to file that contains the query.
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-queryfile' options=''

   ## queryFile

   To simplify query reuse you can specify a query file, this is the absolute path to a md file in your vault. The file should have nothing but the query contents in it.

   // << docs-codeblock-configuration-queryfile
   */
  queryFile: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-queryengine' options=''

   ## queryEngine

   This defines the query engine to use to execute the query entered for the query field.

   By default it will use alasql so you do not have to set this. The only supported value is `alasql` currently.

   // << docs-codeblock-configuration-queryengine
  */
  queryEngine: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-template' options=''

   ## template

   This value is used to render the results of the query.

   // << docs-codeblock-configuration-template
   */
  template: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-templatefile' options=''

   ## templateFile

   To simplify template reuse you can template a query file, this is the absolute path to a md file in your vault. The file should have nothing but the template contents in it.

   // << docs-codeblock-configuration-templatefile
   */
  templateFile: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-postrenderformat' options=''

   ## postRenderFormat

   Once the render engine is completed the output will be written to the page in Obsidian. As Obsidian uses HTML to display information to the user the rendered output will be treated as HTML. If you use a template that output markdown it would not be rendered correctly.

   To make this simpler there are three options. The default is `micromark` which uses the micromark engine to convert markdown to HTML. It has all the GitHub extensions enabled  by default so should handle most markdown as you would expect Obsidian to handle it.

   You can also choose `markdown` which uses the internal Obsidian markdown engine, this may cause some display issues as it need to render the markdown in an asynchronous way so a page refresh may be needed if you are rendering more complex markdown blocks.

   The last value is `html`, this assumes the rendered results are already in a html format  ready to be displayed in Obsidian. This is used for more complex rendering of things like tasks so you can check them off from the query results and have the original not they are on updated.

   // << docs-codeblock-configuration-postrenderformat
   */
  postRenderFormat: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-renderengine' options=''

   ## renderEngine

   By default it will use handlebars so you do not have to set this. It supports two options currently, `handlebars` which will use the handlebars library to render the results and `text` which will render the results as a JSON string. More can be added as needed and pul requests for new rendering formats are welcome.

   // << docs-codeblock-configuration-renderengine
   */
  renderEngine: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-loglevel' options=''

   ## logLevel

   This sets the level of logging used when this code block is processed. Setting it to `debug` or `trace` will give you the raw data and rendered results in a raw format in the console. This is handy for debugging issues with the results or rendering.

   // << docs-codeblock-configuration-loglevel
   */
  logLevel: string | undefined;

  /**
   *
   *
   * @type {(boolean | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-replacecodeblock' options=''

   ## replaceCodeBlock

   **Pending Feature**

   If set to true the page that the codeblock on it will be updated with the rendered content, this process updates the file so outside of obsidian you can access the contents.

   // << docs-codeblock-configuration-replacecodeblock
   */
  replaceCodeBlock: boolean;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-replacetargetpath' options=''

   ## replaceTargetPath

   **Pending Feature**

   The path to the file to replace the contents of with the rendered output. This is an absolute path to a file in your vault.

   If this is defined the `replaceCodeBlock` option is ignored and the page with the codeblock will not be updated.

   // << docs-codeblock-configuration-replacetargetpath
   */
  replaceTargetPath: string | undefined;

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IQattCodeBlock
   * Published documentation:
   // >> id='docs-codeblock-configuration-replacetype' options=''
   ## replaceType

   **Pending Feature**

   Valid replacement types for the codeblock or target file.
   ['never', 'once', 'onceDaily', 'onceDailyAppend', 'onceDailyPrepend', 'onceWeekly', 'always', 'alwaysAppend', 'alwaysPrepend']

   As the results of the query and render are only shown in Obsidian if you look at the markdown file in a text editor you will only see the query and template details. For most situations this would be fine but if you want the results and rendered output to be more permanent you can use this option to write the output to the page directly.

   By default the value will be `never` so each time the page is shown in Obsidian it is dynamically rendered.

   If you set it to `once` the entire codeblock or target path will be processed and replaced with the output, this will remove / disable the codeblock from the file completely and the rendered results will not change from that point forward.

   If you set it to `always` the rendered output will be placed before the codeblock and in preview and reading view the codeblock will be rendered as a blank string to hide it. It is still there and you can edit it in edit mode. When viewing in a text editor you will see the rendered output and then the codeblock below it. To place the renderers content after the codeblock use `alwaysappend`. You can also use `alwaysprepend` if you want to be explicit.

   // << docs-codeblock-configuration-replacetype
   */
  replaceType: string | undefined;

  /**
   * The content of the codeblock. May be modified, use `originalCodeBlockContent` to get the original content.
   *
   * @type {string}
   * @memberof IQattCodeBlock
   */
  codeBlockContent?: string;

  /**
   * The data source that the query is using. Could be qatt or dataview. This is used internally and not meant to be set by users.
   *
   * @type {string}
   * @memberof IQattCodeBlock
   */
  queryDataSource?: string;

  /**
   * The unique ID for the codeblock. This is used internally and not meant to be set by users. If set by user the ID will be shown in the logs.
   *
   * @type {string}
   * @memberof IQattCodeBlock
   */
  id?: string;

  /**
   * The original codeblock content. This is used internally and not meant to be set by users.
   *
   * @type {string}
   * @memberof IQattCodeBlock
   */
  originalCodeBlockContent?: string;

  /**
   * The original codeblock content. This is used internally and not meant to be set by users.
   *
   * @type {number}
   * @memberof IQattCodeBlock
   */
  internalQueryRenderChildVersion: number;
}

/**
 * This is the class for the YAML configuration stored in the markdown codeblock in Obsidian
 *
 * @export
 * @class QattCodeBlock
 * @implements {IQattCodeBlock}
 */
export class QattCodeBlock implements IQattCodeBlock {
  customJSForSql: string[];
  customJSForHandlebars: string[];
  query: string | undefined;
  queryFile: string | undefined;
  queryEngine: string | undefined;
  template: string | undefined;
  templateFile: string | undefined;
  postRenderFormat: string | undefined;
  renderEngine: string | undefined;
  logLevel: string | undefined;
  replaceCodeBlock: boolean;
  replaceTargetPath: string | undefined;
  replaceType: string | undefined;
  queryDataSource?: string;
  id?: string;
  originalCodeBlockContent?: string;
  internalQueryRenderChildVersion: number;

  /**
   * Creates an instance of QattCodeBlock.
   * @param {string} codeBlockContent
   * @memberof QattCodeBlock
   */
  constructor(
    public codeBlockContent?: string,
    public defaultInternalQueryRenderChildVersion?: number,
  ) {
    const parsedCodeBlock = parseYaml(codeBlockContent ?? '');
    this.originalCodeBlockContent = codeBlockContent;

    this.customJSForSql = parsedCodeBlock.customJSForSql;
    this.customJSForHandlebars = parsedCodeBlock.customJSForHandlebars;
    this.query = parsedCodeBlock.query;
    this.queryFile = parsedCodeBlock.queryFile;
    this.queryEngine = parsedCodeBlock.queryEngine;
    this.template = parsedCodeBlock.template;
    this.templateFile = parsedCodeBlock.templateFile;
    this.postRenderFormat = parsedCodeBlock.postRenderFormat;
    this.renderEngine = parsedCodeBlock.renderEngine;
    this.id = parsedCodeBlock.id ?? this.generateCodeblockId(10);

    // Set to info by default.
    const validLogLevels = ['trace', 'debug', 'info', 'warn', 'error'];
    this.logLevel = validLogLevels.includes(parsedCodeBlock.logLevel as string) ? parsedCodeBlock.logLevel : undefined;

    // Set to never by default.
    const validReplaceTypes = ['never', 'once', 'onceDaily', 'onceDailyAppend', 'onceDailyPrepend', 'onceWeekly', 'always', 'alwaysappend', 'alwaysprepend'];
    this.replaceType = validReplaceTypes.includes(parsedCodeBlock.replaceType as string) ? parsedCodeBlock.replaceType : 'never';

    if (parsedCodeBlock.replaceCodeBlock === undefined) {
      this.replaceCodeBlock = false;
    } else if (parsedCodeBlock.replaceCodeBlock === 'true' || parsedCodeBlock.replaceCodeBlock === true) {
      this.replaceCodeBlock = true;
    }

    this.replaceTargetPath = parsedCodeBlock.replaceTargetPath;

    this.queryDataSource = this.getParsedQuerySource(this.query ?? 'qatt');

    this.internalQueryRenderChildVersion = parsedCodeBlock.internalQueryRenderChildVersion === undefined ? (defaultInternalQueryRenderChildVersion ?? 2) : Number(parsedCodeBlock.internalQueryRenderChildVersion);
  }

  /**
   * Gets the data source that the query is using.
   * This is based off the table name.
   *
   * @private
   * @param {string} query
   * @return {string} Either `qatt` or `dataview`
   * @memberof QattCodeBlock
   */
  private getParsedQuerySource(query: string) {
    if (/\bobsidian_markdown_notes\b/gi.test(query)) {
      return 'qatt';
    }

    if (/\bobsidian_markdown_lists\b/gi.test(query)) {
      return 'qatt';
    }

    if (/\bobsidian_markdown_tasks\b/gi.test(query)) {
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

    return 'qatt';
  }

  /**
   * Creates a unique ID for correlation of console logging.
   *
   * @private
   * @param {number} length
   * @return {string} The unique ID for this block when processed by Obsidian.
   * @memberof QuerySql
   */
  private generateCodeblockId(length: number): string {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]);

    const randomString = randomArray.join('');
    return randomString;
  }
}
