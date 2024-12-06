import {
  type App,
  ButtonComponent,
  Modal,
  Platform,
  TextAreaComponent,
  TextComponent,
} from 'obsidian';

// From https://github.com/SilentVoid13/Templater/blob/master/src/core/functions/internal_functions/system/PromptModal.ts
export class PromptModalError extends Error {
  constructor(message: string, public console_message?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Original from https://github.com/SilentVoid13/Templater/blob/master/src/core/functions/internal_functions/system/PromptModal.ts
export class PromptModal extends Modal {
  private resolve: (value: string) => void;
  private reject: (reason?: PromptModalError) => void;
  private submitted = false;
  private value: string;

  constructor(
    private readonly prompt_text: string,
    private readonly default_value: string,
    private readonly multi_line: boolean,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(this.prompt_text);
    this.createForm();
  }

  onClose(): void {
    this.contentEl.empty();
    if (!this.submitted) {
      this.reject(new PromptModalError('Cancelled prompt'));
    }
  }

  createForm(): void {
    const div = this.contentEl.createDiv();
    div.addClass('qatt-modal-prompt-div');
    let textInput;
    if (this.multi_line) {
      textInput = new TextAreaComponent(div);

      // Add submit button since enter needed for multiline input on mobile
      const buttonDiv = this.contentEl.createDiv();
      buttonDiv.addClass('qatt-modal-button-div');
      const submitButton = new ButtonComponent(buttonDiv);
      submitButton.buttonEl.addClass('mod-cta');
      submitButton.setButtonText('Submit').onClick((evt: Event) => {
        this.resolveAndClose(evt);
      });
    } else {
      textInput = new TextComponent(div);
    }

    this.value = this.default_value ?? '';
    textInput.inputEl.addClass('qatt-modal-prompt-input');
    textInput.setPlaceholder('Type text here');
    textInput.setValue(this.value);
    textInput.onChange(value => (this.value = value)); // eslint-disable-line no-return-assign
    textInput.inputEl.focus();
    textInput.inputEl.addEventListener('keydown', (evt: KeyboardEvent) => {
      this.enterCallback(evt);
    },
    );
  }

  async openAndGetValue(
    resolve: (value: string) => void,
    reject: (reason?: PromptModalError) => void,
  ): Promise<void> {
    this.resolve = resolve;
    this.reject = reject;
    this.open();
  }

  private enterCallback(evt: KeyboardEvent) {
    // Fix for Korean inputs https://github.com/SilentVoid13/Templater/issues/1284
    if (evt.isComposing || evt.keyCode === 229) {
      return;
    }

    if (this.multi_line) {
      if (Platform.isDesktop && evt.key === 'Enter' && !evt.shiftKey) {
        this.resolveAndClose(evt);
      }
    } else if (evt.key === 'Enter') {
      this.resolveAndClose(evt);
    }
  }

  private resolveAndClose(evt: Event | KeyboardEvent) {
    this.submitted = true;
    evt.preventDefault();
    this.resolve(this.value);
    this.close();
  }
}
