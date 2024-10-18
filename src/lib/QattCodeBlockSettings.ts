import {type QattCodeBlock} from 'QattCodeBlock';
import {type App, type Plugin, Modal, Setting, type MarkdownPostProcessorContext, TFile, stringifyYaml} from 'obsidian';

export class QattCodeBlockSettings extends Modal {
  plugin: Plugin;
  app: App;
  codeblockConfiguration: QattCodeBlock;
  ctx: MarkdownPostProcessorContext;
  el: HTMLElement;
  constructor(app: App, plugin: Plugin, codeblockConfiguration: QattCodeBlock, context: MarkdownPostProcessorContext, element: HTMLElement) {
    super(app);
    this.plugin = plugin;
    this.app = app;
    this.codeblockConfiguration = codeblockConfiguration;
    this.ctx = context;
    this.el = element;
    // ?? await this.updatecodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
  }

  onOpen() {
    this.display();
  }

  display() {
    const {contentEl} = this;
    contentEl.empty();
    // Close when user presses enter
    contentEl.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.close();
      }
    });
    contentEl.createEl('h2', {text: 'Query and Render Configuration'});

    contentEl.createEl('strong', {text: 'Query'});

    const defaultTextAreaRows = 10;
    const defaultTextAreaColumns = 55;
    const queryInput = new Setting(contentEl)
      .addTextArea(text => {
        text
          .setValue(this.codeblockConfiguration.query ?? '')
          .onChange(async value => {
            this.codeblockConfiguration.query = value;
            this.display();
            await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
          });
        text.inputEl.rows = defaultTextAreaRows;
        text.inputEl.cols = defaultTextAreaColumns;
        text.inputEl.wrap = 'off';
        text.inputEl.style.fontFamily = 'monospace';
      });

    queryInput.infoEl.remove();
    queryInput.controlEl.style.flex = '';
    queryInput.controlEl.style.display = 'block';

    contentEl.createEl('strong', {text: 'Render Template'});

    const renderInput = new Setting(contentEl)
      .addTextArea(text => {
        text
          .setValue(this.codeblockConfiguration.template ?? '')
          .onChange(async value => {
            this.codeblockConfiguration.query = value;
            this.display();
            await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
          });
        text.inputEl.rows = defaultTextAreaRows;
        text.inputEl.cols = defaultTextAreaColumns;
        text.inputEl.wrap = 'off';
        text.inputEl.style.fontFamily = 'monospace';
      });

    renderInput.infoEl.remove();
    renderInput.controlEl.style.flex = '';
    renderInput.controlEl.style.display = 'block';

    new Setting(contentEl)
      .setName('Replace Codeblock?')
      .setDesc('If set to true, the codeblock will be replaced with the render result. If set to false, the render result will replace the codeblock')
      .addToggle(toggle =>
        toggle
          .setValue(this.codeblockConfiguration.replaceCodeBlock)
          .onChange(async value => {
            this.codeblockConfiguration.replaceCodeBlock = value;
            this.display();
          }),
      );
    // If (this.codeblockConfiguration.showTitle) {
    new Setting(contentEl)
      .setName('Log Level')
      .setDesc('\'info\' by default, det to \'debug\' to see more detailed logs\'')
      .addText(text =>
        text
          .setValue(this.codeblockConfiguration.logLevel ?? 'info')
          .onChange(async value => {
            this.codeblockConfiguration.logLevel = value;
          }),
      );

    new Setting(contentEl)
      .addButton(btn =>
        btn
          .setButtonText('Save')
          .setCta()
          .onClick(async () => {
            await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);

            this.close();
          }));
    // }

    // new Setting(contentEl)
    //   .setName('Folder path for the overview')
    //   .setDesc('Choose the folder path for the overview')
    //   .addSearch(search => {
    //     new FolderSuggest(search.inputEl, this.plugin);
    //     search
    //       .setPlaceholder('Folder path')
    //       .setValue(this.codeblockConfiguration?.folderPath || '')
    //       .onChange(async value => {
    //         if (!(this.app.vault.getAbstractFileByPath(value) instanceof TFolder) && value !== '') {
    //           return;
    //         }

    //         this.codeblockConfiguration.folderPath = value;

    //         await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //       });
    //   });
    // new Setting(contentEl)
    //   .setName('Overview style')
    //   .setDesc('Choose the style of the overview (grid style soon)')
    //   .addDropdown(dropdown =>
    //     dropdown
    //       .addOption('list', 'List')
    //       .addOption('explorer', 'Explorer')
    //       .setValue(this.codeblockConfiguration?.style || 'list')
    //       .onChange(async (value: 'list') => {
    //         this.codeblockConfiguration.style = value;
    //         this.display();

    //         await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //       }),
    //   );
    // if (this.codeblockConfiguration.style === 'explorer') {
    //   new Setting(contentEl)
    //     .setName('Store collapsed condition')
    //     .setDesc('Choose if the collapsed condition should be stored stored until you restart Obsidian')
    //     .addToggle(toggle =>
    //       toggle
    //         .setValue(this.codeblockConfiguration.storeFolderCondition)
    //         .onChange(async value => {
    //           this.codeblockConfiguration.storeFolderCondition = value;

    //           await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //         }),
    //     );
    // }

    // const setting = new Setting(contentEl);
    // setting.setName('Include types');
    // const list = setting.createList((list: ListComponent) =>
    //   list
    //     .addModal(this)
    //     .setValues(this.codeblockConfiguration?.includeTypes || this.plugin.settings.defaultOverview.includeTypes || [])
    //     .addResetButton(),
    // );
    // if ((this.codeblockConfiguration?.includeTypes?.length || 0) < 8 && !this.codeblockConfiguration.includeTypes?.includes('all')) {
    //   setting.addDropdown(dropdown => {
    //     if (!this.codeblockConfiguration.includeTypes) {
    //       this.codeblockConfiguration.includeTypes = this.plugin.settings.defaultOverview.includeTypes || [];
    //     }

    //     this.codeblockConfiguration.includeTypes = this.codeblockConfiguration.includeTypes.map((type: string) => type.toLowerCase()) as includeTypes[];
    //     const options = [
    //       {value: 'markdown', label: 'Markdown'},
    //       {value: 'folder', label: 'Folder'},
    //       {value: 'canvas', label: 'Canvas'},
    //       {value: 'pdf', label: 'PDF'},
    //       {value: 'image', label: 'Image'},
    //       {value: 'audio', label: 'Audio'},
    //       {value: 'video', label: 'Video'},
    //       {value: 'other', label: 'All other file types'},
    //       {value: 'all', label: 'All file types'},
    //     ];

    //     for (const option of options) {
    //       if (!this.codeblockConfiguration.includeTypes?.includes(option.value as includeTypes)) {
    //         dropdown.addOption(option.value, option.label);
    //       }
    //     }

    //     dropdown.addOption('+', '+');
    //     dropdown.setValue('+');
    //     dropdown.onChange(async value => {
    //       if (value === 'all') {
    //         this.codeblockConfiguration.includeTypes = this.codeblockConfiguration.includeTypes?.filter((type: string) => type === 'folder');
    //         // @ts-expect-error
    //         list.setValues(this.codeblockConfiguration.includeTypes);
    //       }

    //       // @ts-expect-error
    //       await list.addValue(value.toLowerCase());
    //       this.display();

    //       await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //     });
    //   });
    // }

    // let disableFileTag;
    // this.codeblockConfiguration.includeTypes?.forEach((type: string) => {
    //   type === 'folder' || type === 'markdown' ? (disableFileTag = true) : null;
    // });
    // if (disableFileTag) {
    //   new Setting(contentEl)
    //     .setName('Disable file tag')
    //     .setDesc('Choose if the file tag should be shown after the file name')
    //     .addToggle(toggle => {
    //       toggle
    //         .setValue(this.codeblockConfiguration.disableFileTag)
    //         .onChange(async value => {
    //           this.codeblockConfiguration.disableFileTag = value;

    //           await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //         });
    //     });
    // }

    // new Setting(contentEl)
    //   .setName('Show folder notes')
    //   .setDesc('Choose if folder notes (the note itself and not the folder name) should be shown in the overview')
    //   .addToggle(toggle =>
    //     toggle
    //       .setValue(this.codeblockConfiguration.showFolderNotes)
    //       .onChange(async value => {
    //         this.codeblockConfiguration.showFolderNotes = value;

    //         await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //       }),
    //   );

    // if (this.codeblockConfiguration.style !== 'explorer') {
    //   new Setting(contentEl)
    //     .setName('File depth')
    //     .setDesc('File & folder = +1 depth')
    //     .addSlider(slider =>
    //       slider
    //         .setValue(this.codeblockConfiguration?.depth || 2)
    //         .setLimits(1, 10, 1)
    //         .onChange(async value => {
    //           this.codeblockConfiguration.depth = value;

    //           await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //         }),
    //     );
    // }

    // new Setting(contentEl)
    //   .setName('Sort files by')
    //   .setDesc('Choose how the files should be sorted')
    //   .addDropdown(dropdown =>
    //     dropdown
    //       .addOption('name', 'Name')
    //       .addOption('created', 'Created')
    //       .addOption('modified', 'Modified')
    //       .setValue(this.codeblockConfiguration?.sortBy || 'name')
    //       .onChange(async (value: 'name' | 'created' | 'modified') => {
    //         this.codeblockConfiguration.sortBy = value;

    //         await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //       }),
    //   )
    //   .addDropdown(dropdown => {
    //     dropdown
    //       .addOption('desc', 'Descending')
    //       .addOption('asc', 'Ascending');
    //     if (this.codeblockConfiguration.sortByAsc) {
    //       dropdown.setValue('asc');
    //     } else {
    //       dropdown.setValue('desc');
    //     }

    //     dropdown.onChange(async value => {
    //       this.codeblockConfiguration.sortByAsc = value !== 'desc';

    //       await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //     });
    //   });
    // if (this.codeblockConfiguration.style === 'list') {
    //   new Setting(contentEl)
    //     .setName('Show folder names of folders that appear empty in the folder overview')
    //     .setDesc('Show the names of folders that appear to have no files/folders in the folder overview. That\'s mostly the case when you set the file depth to 1.')
    //     .addToggle(toggle => {
    //       toggle
    //         .setValue(this.codeblockConfiguration.showEmptyFolders)
    //         .onChange(async value => {
    //           this.codeblockConfiguration.showEmptyFolders = value;
    //           this.codeblockConfiguration.onlyIncludeSubfolders = false;
    //           this.display();

    //           await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //         });
    //     });

    //   if (this.codeblockConfiguration.showEmptyFolders) {
    //     new Setting(contentEl)
    //       .setName('Only show first empty subfolders of current folder')
    //       .addToggle(toggle => {
    //         toggle
    //           .setValue(this.codeblockConfiguration.onlyIncludeSubfolders)
    //           .onChange(async value => {
    //             this.codeblockConfiguration.onlyIncludeSubfolders = value;

    //             await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //           });
    //       });
    //   }
    // }

    // if (this.codeblockConfiguration.style === 'explorer') {
    //   new Setting(contentEl)
    //     .setName('Disable collapse icon for folder notes')
    //     .setDesc('Remove the collapse icon next to the folder name for folder notes when they only contain the folder note itself')
    //     .addToggle(toggle => {
    //       toggle
    //         .setValue(this.codeblockConfiguration.disableCollapseIcon)
    //         .onChange(async value => {
    //           this.codeblockConfiguration.disableCollapseIcon = value;

    //           await this.updateCodeblockConfiguration(this.plugin, this.ctx, this.el, this.codeblockConfiguration);
    //         });
    //     });
    // }
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }

  async updateCodeblockConfiguration(plugin: Plugin, ctx: MarkdownPostProcessorContext, element: HTMLElement, codeblockConfiguration: QattCodeBlock) {
    const file = plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof TFile)) {
      return;
    }

    delete codeblockConfiguration.originalCodeBlockContent;
    delete codeblockConfiguration.codeBlockContent;
    delete codeblockConfiguration.id;
    delete codeblockConfiguration.defaultInternalQueryRenderChildVersion;

    let stringCodeblockConfiguration = stringifyYaml(codeblockConfiguration);
    await plugin.app.vault.process(file, text => {
      const info = ctx.getSectionInfo(element);
      // Check if stringCodeblockConfiguration ends with a newline
      if (!stringCodeblockConfiguration.endsWith('\n')) {
        stringCodeblockConfiguration += '\n';
      }

      if (info) {
        const {lineStart} = info;
        const lineEnd = this.getCodeBlockEndLine(text, lineStart);
        if (lineEnd === -1 || !lineEnd) {
          return text;
        }

        const lineLength = lineEnd - lineStart;
        const lines = text.split('\n');
        lines.splice(lineStart, lineLength + 1, `\`\`\`qatt\n${stringCodeblockConfiguration}\`\`\``);
        return lines.join('\n');
      }

      return `\`\`\`qatt\n${stringCodeblockConfiguration}\`\`\``;
    });
  }

  getCodeBlockEndLine(text: string, startLine: number, count = 1) {
    let line = startLine + 1;
    const lines = text.split('\n');
    while (line < lines.length) {
      if (count > 500) {
        return -1;
      }

      if (lines[line].startsWith('```')) {
        return line;
      }

      line++;
      count++;
    }

    return line;
  }
}
