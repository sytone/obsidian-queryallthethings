
import {type MarkdownPostProcessorContext, MarkdownPreviewView, moment, MarkdownRenderChild, Plugin, debounce, TFile} from 'obsidian';
import {QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryFactory} from 'Query/QueryFactory';
import {type IQuery} from 'Query/IQuery';
import {Service, useSettings} from '@ophidian/core';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {DateTime} from 'luxon';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {MicromarkPostRenderer, markdown2html} from 'PostRender/MicromarkPostRenderer';
import {NotesCacheService} from 'NotesCacheService';
import {ObsidianPostRenderer} from 'PostRender/ObsidianPostRenderer';
import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {HtmlPostRenderer} from 'PostRender/HtmlPostRenderer';
import {RawPostRenderer} from 'PostRender/RawPostRenderer';
import {QueryRenderChildV2} from 'QueryRenderChildV2';
import {QueryRenderChildV3} from 'QueryRenderChildV3';

export interface IRenderingSettings {
  postRenderFormat: string;
  enableExperimentalRender: boolean;
  renderingSettingsOpen: boolean;
  internalQueryRenderChildVersion: number;

}

export const RenderingSettingsDefaults: IRenderingSettings = {
  postRenderFormat: 'micromark',
  enableExperimentalRender: false,
  renderingSettingsOpen: false,
  internalQueryRenderChildVersion: 2,
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
      this.postRenderFormat = settings.postRenderFormat;
      this.renderingSettingsOpen = settings.renderingSettingsOpen;
      this.internalQueryRenderChildVersion = settings.internalQueryRenderChildVersion;
    },
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Initialize Settings');
      this.postRenderFormat = settings.postRenderFormat;
      this.renderingSettingsOpen = settings.renderingSettingsOpen;
      this.internalQueryRenderChildVersion = settings.internalQueryRenderChildVersion;
    },
  );

  postRenderFormat: string;
  internalQueryRenderChildVersion: number;

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
        text: 'Rendering Settings',
        level: 'h2',
        class: 'settings-heading'}),
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

    const internalQueryRenderChildVersionSetting = tab.addDropdownInput(
      new SettingsTabField({
        name: 'Default Internal Query Render Child Version',
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
  }

  async onload() {
    this.plugin.registerMarkdownCodeBlockProcessor('qatt', async (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) => {
      this.logger.info(`lastCreation ${this.lastCreation.toISO() ?? ''}`);
      this.logger.info(`Adding QATT Render for ${source} to context ${context.docId}`);

      const codeblockConfiguration = new QattCodeBlock(source);

      if (this.internalQueryRenderChildVersion !== undefined) {
        codeblockConfiguration.internalQueryRenderChildVersion = Number(this.internalQueryRenderChildVersion);
      }

      this.logger.info('codeblockConfiguration', codeblockConfiguration);

      if (codeblockConfiguration.internalQueryRenderChildVersion === 2) {
        this.logger.info('Rendered as child of MarkdownPostProcessorContext ');

        context.addChild(
          new QueryRenderChildV2(
            element,
            codeblockConfiguration,
            context,
            this,
          ),
        );
      }

      if (codeblockConfiguration.internalQueryRenderChildVersion === 3) {
        this.logger.info('Rendered directly to container');

        const queryRenderChild = new QueryRenderChildV3(element, codeblockConfiguration, context, this);
        await queryRenderChild.create(source, element, context);
      }
    });
  }
}

