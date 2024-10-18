
import {type MarkdownPostProcessorContext, Plugin} from 'obsidian';
import {QattCodeBlock} from 'QattCodeBlock';
import {Service, useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {DateTime} from 'luxon';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {NotesCacheService} from 'NotesCacheService';
import {QueryRenderChildV2} from 'QueryRenderChildV2';
import {QueryRenderChildV3} from 'QueryRenderChildV3';
import {QattCodeBlockSettings} from 'lib/QattCodeBlockSettings';

export interface IRenderingSettings {
  postRenderFormat: string;
  enableExperimentalRender: boolean;
  renderingSettingsOpen: boolean;
  internalQueryRenderChildVersion: number;
  enableCodeBlockEditor: boolean;
  queryFileRoot: string;
  templateFileRoot: string;
  debounceWindow: number;
  disableDebounce: boolean;
}

export const RenderingSettingsDefaults: IRenderingSettings = {
  postRenderFormat: 'markdown',
  enableExperimentalRender: false,
  renderingSettingsOpen: false,
  internalQueryRenderChildVersion: 2,
  enableCodeBlockEditor: true,
  queryFileRoot: '',
  templateFileRoot: '',
  debounceWindow: 5000,
  disableDebounce: false,
};

/**
 * This service handles the registration of the code block processor for QATT. So
 * when the block is processed Obsidian will call the code block processor registered
 * here and a new render child will be created and registered. When the block
 * is changed or navigated away from the render child will be unloaded.
 *
 * @export
 * @class QueryRendererV2Service
 * @extends {Service}
 */
export class QueryRendererV2Service extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.QueryRendererV2Service');
  notesCacheService = this.use(NotesCacheService);
  renderingSettingsOpen: boolean;

  lastCreation: DateTime;
  settingsTab = useSettingsTab(this);
  settings = useSettings(
    this,
    RenderingSettingsDefaults,
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Updated Settings');
      this.postRenderFormat = settings.postRenderFormat ?? 'markdown';
      this.renderingSettingsOpen = settings.renderingSettingsOpen;
      this.internalQueryRenderChildVersion = settings.internalQueryRenderChildVersion;
      this.enableCodeBlockEditor = settings.enableCodeBlockEditor;
      this.queryFileRoot = settings.queryFileRoot ?? '';
      this.templateFileRoot = settings.templateFileRoot ?? '';
      this.debounceWindow = settings.debounceWindow;
      this.disableDebounce = settings.disableDebounce;
    },
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Initialize Settings');
      this.postRenderFormat = settings.postRenderFormat ?? 'markdown';
      this.renderingSettingsOpen = settings.renderingSettingsOpen;
      this.internalQueryRenderChildVersion = settings.internalQueryRenderChildVersion;
      this.enableCodeBlockEditor = settings.enableCodeBlockEditor;
      this.queryFileRoot = settings.queryFileRoot ?? '';
      this.templateFileRoot = settings.templateFileRoot ?? '';
      this.debounceWindow = settings.debounceWindow;
      this.disableDebounce = settings.disableDebounce;
    },
  );

  postRenderFormat = 'markdown';
  internalQueryRenderChildVersion = 2;
  enableCodeBlockEditor = false;
  queryFileRoot = '';
  templateFileRoot = '';
  debounceWindow = 5000;
  disableDebounce = false;

  constructor() {
    super();
    this.lastCreation = DateTime.now();
  }

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const settingsSection = tab.addHeading(
      new SettingsTabHeading({
        open: this.renderingSettingsOpen,
        text: 'Codeblock Rendering Settings',
        level: 'h2',
        class: 'settings-heading',
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.renderingSettingsOpen = value;
        });
      });

    const postRenderSetting = tab.addDropdownInput(
      new SettingsTabField({
        name: 'Default Post Render Format',
        description: 'Once the template has finished rendering the final output needs to be HTML. If the template returns markdown then it needs to be converted, this settings allows you to select the default processor so you do not have to set it in each codeblock.',
        placeholder: {
          markdown: 'Obsidian Markdown',
          micromark: 'Micromark',
          none: 'None',
        },
        value: this.postRenderFormat,
      }),
      async (value: string) => {
        await settings.update(settings => {
          settings.postRenderFormat = value;
        });
      },
      settingsSection,
    );

    const queryFileRootSetting = tab.addTextInput(
      new SettingsTabField({
        name: 'Query File Root',
        description: 'The root directory for the query files. This is the directory where the query files are stored. If this is not set the path must be relative to the root of the vault.',
        value: this.queryFileRoot,
      }),
      async (value: string) => {
        await settings.update(settings => {
          settings.queryFileRoot = value;
        });
      },
      settingsSection,
    );

    const templateFileRootSetting = tab.addTextInput(
      new SettingsTabField({
        name: 'Template File Root',
        description: 'The root directory for the template files. This is the directory where the template files are stored. If this is not set the path must be relative to the root of the vault.',
        value: this.templateFileRoot,
      }),
      async (value: string) => {
        await settings.update(settings => {
          settings.templateFileRoot = value;
        });
      },
      settingsSection,
    );

    const debounceDisable = tab.addToggle(
      new SettingsTabField({
        name: 'Disable Query Debounce',
        description: 'This disables the debounce on query execution, queries will run more often.',
        value: this.disableDebounce,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.disableDebounce = value;
        });
      },
      settingsSection,
    );

    const debounceWindow = tab.addTextInput(
      new SettingsTabField({
        name: 'Debounce Window',
        description: 'The time to wait until queries will run while a user is updating the vault.',
        value: this.debounceWindow.toString(), // Convert the value to a string
      }),
      async (value: string) => {
        await settings.update(settings => {
          settings.debounceWindow = Number.parseInt(value, 10); // Convert the value to a number
        });
      },
      settingsSection,
    );

    const internalQueryRenderChildVersionSetting = tab.addDropdownInput(
      new SettingsTabField({
        name: '🧪 Default Internal Query Render Child Version',
        description: 'This allows use of an alternative way to render the results in Obsidian using a different method. This is experimental and may not work as expected.',
        placeholder: {
          2: 'As child of MarkdownPostProcessorContext',
          3: 'Independent container update',
        },
        value: this.internalQueryRenderChildVersion,
      }),
      async (value: number) => {
        await settings.update(settings => {
          settings.internalQueryRenderChildVersion = value;
        });
      },
      settingsSection,
    );

    const enableCodeBlockEditorSetting = tab.addToggle(
      new SettingsTabField({
        name: '🧪 Enable Code Block Editor',
        description: 'This will enable a button on the code block to allow you to edit the settings for the block. This is experimental and may not work as expected.',
        value: this.enableCodeBlockEditor,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.enableCodeBlockEditor = value;
        });
      },
      settingsSection,
    );
  }

  async onload() {
    this.plugin.registerMarkdownCodeBlockProcessor('qatt', async (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) => {
      this.logger.info(`lastCreation ${this.lastCreation.toISO() ?? ''} registering block on ${context.sourcePath}`);
      this.logger.debug(`Adding QATT Render for ${source} to context ${context.docId}`);

      const codeblockConfiguration = new QattCodeBlock(source);

      if (this.internalQueryRenderChildVersion !== undefined) {
        codeblockConfiguration.internalQueryRenderChildVersion = Number(this.internalQueryRenderChildVersion);
      }

      // If the queryFile is set then we need to update the path to include the root
      if (codeblockConfiguration.queryFile !== undefined) {
        if (this.queryFileRoot !== '' && !this.queryFileRoot.endsWith('/')) {
          this.queryFileRoot = `${this.queryFileRoot}/`;
        }

        // Wild assumption here. If there is no dot in the file name it is missing an extension so adds .md by default.
        if (!codeblockConfiguration.queryFile.includes('.')) {
          codeblockConfiguration.queryFile = `${codeblockConfiguration.queryFile}.md`;
        }

        this.logger.debug(`Updating queryFile to set default root. ${this.queryFileRoot}${codeblockConfiguration.queryFile}`);
        codeblockConfiguration.queryFile = `${this.queryFileRoot}${codeblockConfiguration.queryFile}`;
      }

      // If the templateFile is set then we need to update the path to include the root
      if (codeblockConfiguration.templateFile !== undefined) {
        if (this.templateFileRoot !== '' && !this.templateFileRoot.endsWith('/')) {
          this.templateFileRoot = `${this.templateFileRoot}/`;
        }

        // Wild assumption here. If there is no dot in the file name it is missing an extension so adds .md by default.
        if (!codeblockConfiguration.templateFile.includes('.')) {
          codeblockConfiguration.templateFile = `${codeblockConfiguration.templateFile}.md`;
        }

        this.logger.debug(`Updating templateFile to set default root. ${this.templateFileRoot}${codeblockConfiguration.templateFile}`);
        codeblockConfiguration.templateFile = `${this.templateFileRoot}${codeblockConfiguration.templateFile}`;
      }

      if (this.enableCodeBlockEditor) {
        this.logger.debug('codeblockConfiguration', codeblockConfiguration);
        const observer = new MutationObserver(() => {
          const editButton = element.parentElement?.childNodes.item(1);
          if (editButton) {
            editButton.addEventListener('click', event => {
              event.stopImmediatePropagation();
              event.preventDefault();
              event.stopPropagation();
              new QattCodeBlockSettings(this.plugin.app, this.plugin, codeblockConfiguration, context, element).open();
            }, {capture: true});
          }
        });
        observer.observe(element, {
          childList: true,
          subtree: true,
        });
      }

      if (codeblockConfiguration.internalQueryRenderChildVersion === 2) {
        this.logger.debug('Rendered as child of MarkdownPostProcessorContext ');

        context.addChild(
          new QueryRenderChildV2(
            element,
            codeblockConfiguration,
            context,
            this,
            this.debounceWindow,
            this.disableDebounce,
          ),
        );
      }

      if (codeblockConfiguration.internalQueryRenderChildVersion === 3) {
        this.logger.debug('Rendered directly to container');

        const queryRenderChild = new QueryRenderChildV3(element, codeblockConfiguration, context, this);
        await queryRenderChild.create(source, element, context);
      }
    });
    this.logger.info('QueryRendererV2Service loaded');
  }
}

