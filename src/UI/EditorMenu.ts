import {type Editor, type Menu, stringifyYaml} from 'obsidian';

export function createEditorMenu(menu: Menu, editor: Editor): void {
  const handlebarsHelpers: Record<string, string> = {
    'Capitalize the first letter of the string': '{{capitalize \'replace with property\'}}',
    'Start markdown code block with optional type': '{{codeBlockHeader \'text\'}}',
    'End markdown code block': '{{codeBlockFooter}}',
  };

  const alaSqlFunctions: Record<string, string> = {
    'Reverse characters in a string': 'REVERSE ( basename )',
    'Join array with optional separator': 'JoinArray ( dataArray [ , separator ] )',
  };

  const communityQueries: Record<string, string> = {
    'Get 5 most recently changed notes': `
\`\`\`qatt
query: |
  SELECT TOP 5 * FROM obsidian_notes ORDER BY modified DESC
template: |
  {{#each result}}
  [[{{basename}}]] - Last Updated: {{formatDate modified}}
  {{/each}}
\`\`\``,
  };

  menu.addSeparator();

  menu.addItem(qattItem => {
    qattItem.setTitle('QATT: Handlebars Helpers');
    qattItem.setIcon('layout-template');

    const qattSubmenu = qattItem.setSubmenu();

    for (const [description, declaration] of Object.entries(handlebarsHelpers)) {
      qattSubmenu.addItem(item => {
        item.setTitle(description);
        item.onClick(() => {
          insetAtCursor(editor, declaration);
        });
      });
    }
  });

  menu.addItem(qattItem => {
    qattItem.setTitle('QATT: SQL Functions');
    qattItem.setIcon('search');

    const qattSubmenu = qattItem.setSubmenu();

    for (const [description, declaration] of Object.entries(alaSqlFunctions)) {
      qattSubmenu.addItem(item => {
        item.setTitle(description);
        item.onClick(() => {
          insetAtCursor(editor, declaration);
        });
      });
    }
  });

  menu.addItem(qattItem => {
    qattItem.setTitle('QATT: Example Queries');
    qattItem.setIcon('gift');

    const qattSubmenu = qattItem.setSubmenu();

    for (const [description, declaration] of Object.entries(communityQueries)) {
      qattSubmenu.addItem(item => {
        item.setTitle(description);
        item.onClick(() => {
          insetAtCursor(editor, declaration);
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
