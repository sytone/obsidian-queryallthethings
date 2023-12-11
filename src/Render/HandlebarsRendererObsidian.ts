/* eslint-disable no-bitwise */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Handlebars from 'handlebars';
import {Component, MarkdownPreviewView, MarkdownRenderer} from 'obsidian';
import {logging} from 'lib/Logging';
import {type IRenderer} from 'Render/IRenderer';

export class HandlebarsRendererObsidian implements IRenderer {
  public static registerHandlebarsHelpers() {
    Handlebars.registerHelper('obsidiantasklist', value => {
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

    Handlebars.registerHelper('taskcheckboxwithappend', value => {
      let checked = '';
      let classList = 'task-list-item-checkbox';
      let nextStatus = 'x';
      const currentStatus: string = value.status as string;
      const appendValue: string = value.append as string;

      if (value.status !== ' ') {
        checked = 'checked';
        classList += ' is-checked';
        nextStatus = ' ';
      }

      const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTaskWithAppend('${value.page as string}',${value.line as string},'${currentStatus}','${nextStatus}','${appendValue}');"></input>`;
      return new Handlebars.SafeString(checkBoxHtml);
    });

    Handlebars.registerHelper('htmltasklist', value => {
      const ulOpen = '<ul class="contains-task-list has-list-bullet">';
      const ulClose = '</ul>';
      const liOpen = '<li class="task-list-item plugin-tasks-list-item">';
      const liClose = '</li>';
      let depth = 0;

      let listHtml = ulOpen;
      for (const taskItem of value) {
        if (taskItem.depth > depth) {
          listHtml += ulOpen;
          depth++;
        }

        if (taskItem.depth < depth) {
          listHtml += ulClose;
          depth--;
        }

        let checked = '';
        let classList = 'task-list-item-checkbox';
        let nextStatus = 'x';

        const currentStatus: string = taskItem.status as string;
        const text = taskItem.text as string;

        if (taskItem.status !== ' ') {
          checked = 'checked';
          classList += ' is-checked';
          nextStatus = ' ';
        }

        const content = document.createElement('span');

        const html = MarkdownRenderer.renderMarkdown(text, content, '', new Component()).then(() => content.innerHTML);

        // A console.log(`HTML: ${content.firstElementChild?.innerHTML}`);

        listHtml += `${liOpen}<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTask('${taskItem.page as string}',${taskItem.line as string},'${currentStatus}','${nextStatus}');"></input>`;
        listHtml += `${content.firstElementChild?.innerHTML ?? ' '}${liClose}`;
      }

      listHtml += ulClose;

      return new Handlebars.SafeString(listHtml);
    });
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
