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

    const header = `### New in Query Add the Things v${this.releases[0].version}\n`;
    const text = 'Thank you for using QuickAdd! If you like the plugin, please consider supporting me by buying me a coffee. With your sponsorship, I\'ll be able to contribute more to my existing projects, start new ones, and be more responsive to issues & feature requests.';
    const buymeacoffee = '<div class="quickadd-bmac-container"><a href="https://www.buymeacoffee.com/chhoumann" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 144px !important;" ></a></div>';

    const contentDiv = contentEl.createDiv('quickadd-update-modal');
    const releaseNotes = this.releases
      .map(release => release.body)
      .join('\n---\n');

    const andNow = `And now, here is everything new in QuickAdd since your last update (v${this.previousVersion}):`;
    const feedbackForm = 'I\'d love to get your feedback on QuickAdd! Please fill out this <a href="https://forms.gle/WRq1ewcKK8qmkqps6">feedback form</a> to let me know what you think.';
    const markdownString = `${header}\n${text}\n${buymeacoffee}\n${feedbackForm}\n\n${andNow}\n\n---\n\n${addExtraHashToHeadings(
      releaseNotes,
    )}`;

    void MarkdownRenderer.renderMarkdown(
      markdownString,
      contentDiv,
      app.vault.getRoot().path,
      new Component(),
    );
  }
}
