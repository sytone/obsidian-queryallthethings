import {type IRelease, type ReleaseNotes} from 'ReleaseNotes';
import {Component, MarkdownRenderer, Modal} from 'obsidian';

function addExtraHashToHeadings(
  markdownText: string,
  numberHashes = 1,
): string {
  // Split the markdown text into an array of lines
  const lines = markdownText.split('\n');

  // Loop through each line and check if it starts with a heading syntax (#)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#')) {
      // If the line starts with a heading syntax, add an extra '#' to the beginning
      lines[i] = '#'.repeat(numberHashes) + lines[i];
    }
  }

  // Join the array of lines back into a single string and return it
  return lines.join('\n');
}

export class UpdateModal extends Modal {
  releases: IRelease[];
  private readonly releaseNotesPromise: Promise<IRelease[]>;
  private readonly previousVersion: string;

  constructor(previousVersion: string, releaseNotes: ReleaseNotes) {
    super(app);
    this.previousVersion = previousVersion;
    if (previousVersion === undefined || previousVersion === '') {
      this.previousVersion = '0.0.0';
    }

    this.releases = releaseNotes.getChangesSince(this.previousVersion);
    if (this.releases.length === 0) {
      this.close();
      return;
    }

    this.display();
  }

  onOpen() {
    const {contentEl} = this;
    contentEl.empty();
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }

  public display(): void {
    if (this.releases.length === 0) {
      this.close();
      return;
    }

    const {contentEl} = this;
    contentEl.empty();
    contentEl.classList.add('qatt-update-modal-container');

    const releaseNotes = this.releases
      .map(release => `## Release v${release.version}\n\n${release.body}`)
      .join('\n\n---\n\n');

    const markdownString = `
### New in Query All the Things v${this.releases[0].version} 🎉

Thank you for using Query All the Things! I hope you're enjoying it.
I'm always looking for ways to improve the plugin, so if you have any feedback, please let me know by creating an <a href="https://github.com/sytone/obsidian-queryallthethings/issues">issue</a>.
You can download the documentation and example vault to open in obsidian to see the queries in action <A href="https://github.com/sytone/obsidian-queryallthethings/releases/latest/download/obsidian-queryallthethings.vault.zip">here</a>.

And now, here is everything new in Query All the Things since your last update (v${this.previousVersion}).

*You can disable these announcements in the plugin settings under General*

---

${addExtraHashToHeadings(releaseNotes)}

`;

    const contentDiv = contentEl.createDiv('qatt-update-modal');

    void MarkdownRenderer.renderMarkdown(
      markdownString,
      contentDiv,
      app.vault.getRoot().path,
      new Component(),
    );
  }
}
