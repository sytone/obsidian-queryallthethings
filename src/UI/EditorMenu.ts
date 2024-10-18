import {type Editor, type Menu, stringifyYaml} from 'obsidian';
import alaSqlFunctions from 'UI/alaSqlFunctions.json';
import communityQueries from 'UI/communityQueries.json';
import handlebarsHelpers from 'UI/handlebarsHelpers.json';

/**
 * Creates an editor menu with various submenus and items.
 *
 * @param menu - The menu object to which items and submenus will be added.
 * @param editor - The editor instance where actions will be performed.
 *
 * The menu will contain the following sections:
 * - Handlebars Helpers: A submenu with items for each Handlebars helper.
 * - SQL Functions: A submenu with items for each SQL function.
 * - Example Queries: A submenu with items for each community query.
 *
 * Each submenu item will insert a corresponding declaration at the cursor position in the editor when clicked.
 *
 * To add more items update the YAML files in this folder.
 */
export function createEditorMenu(menu: Menu, editor: Editor): void {
  menu.addSeparator();

  menu.addItem(qattItem => {
    qattItem.setTitle('QATT: Handlebars Helpers');
    qattItem.setIcon('layout-template');

    const qattSubmenu = qattItem.setSubmenu();

    for (const example of handlebarsHelpers) {
      qattSubmenu.addItem(item => {
        item.setTitle(String(example.description));
        item.onClick(() => {
          insetAtCursor(editor, String(example.declaration));
        });
      });
    }
  });

  menu.addItem(qattItem => {
    qattItem.setTitle('QATT: SQL Functions');
    qattItem.setIcon('search');

    const qattSubmenu = qattItem.setSubmenu();

    for (const example of alaSqlFunctions) {
      qattSubmenu.addItem(item => {
        item.setTitle(String(example.description));
        item.onClick(() => {
          insetAtCursor(editor, String(example.declaration));
        });
      });
    }
  });

  menu.addItem(qattItem => {
    qattItem.setTitle('QATT: Example Queries');
    qattItem.setIcon('gift');

    const qattSubmenu = qattItem.setSubmenu();

    for (const example of communityQueries) {
      qattSubmenu.addItem(item => {
        item.setTitle(String(example.description));
        item.onClick(() => {
          insetAtCursor(editor, String(example.declaration));
        });
      });
    }

    // TBD Add new editor modal for query
    // mbSubmenu.addItem(buttonItem => {
    //   buttonItem.setTitle('Button');
    //   buttonItem.onClick(() => {
    //     plugin.internal.openButtonBuilderModal({
    //       onOkay(config): void {
    //         insetAtCursor(editor, `\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``);
    //       },
    //       submitText: 'Insert',
    //     });
    //   });
    // });
  });
}

function insetAtCursor(editor: Editor, text: string): void {
  editor.replaceSelection(text);
}
