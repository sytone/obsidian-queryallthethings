import {type FuzzyMatch, FuzzySuggestModal} from 'obsidian';

// From https://github.com/SilentVoid13/Templater/blob/9bccec9e34e485be729793ce472e2ed41c09b53a/src/utils/Error.ts#L3
export class SuggesterModalError extends Error {
  constructor(message: string, public console_message?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Original from https://github.com/SilentVoid13/Templater/blob/9bccec9e34e485be729793ce472e2ed41c09b53a/src/core/functions/internal_functions/system/SuggesterModal.ts#L4
export class SuggesterModal<T> extends FuzzySuggestModal<T> {
  private resolve: (value: T) => void;
  private reject: (reason?: SuggesterModalError) => void;
  private submitted = false;

  constructor(
    private readonly text_items: string[] | ((item: T) => string),
    private readonly items: T[],
    placeholder: string,
    limit?: number,
  ) {
    super(app);
    this.setPlaceholder(placeholder);
    if (limit) {
      this.limit = limit;
    }
  }

  getItems(): T[] {
    return this.items;
  }

  onClose(): void {
    if (!this.submitted) {
      this.reject(new SuggesterModalError('Cancelled prompt'));
    }
  }

  selectSuggestion(
    value: FuzzyMatch<T>,
    evt: MouseEvent | KeyboardEvent,
  ): void {
    this.submitted = true;
    this.close();
    this.onChooseSuggestion(value, evt);
  }

  getItemText(item: T): string {
    if (this.text_items instanceof Function) {
      return this.text_items(item);
    }

    return (
      this.text_items[this.items.indexOf(item)] || 'Undefined Text Item'
    );
  }

  onChooseItem(item: T): void {
    this.resolve(item);
  }

  async openAndGetValue(
    resolve: (value: T) => void,
    reject: (reason?: SuggesterModalError) => void,
  ): Promise<void> {
    this.resolve = resolve;
    this.reject = reject;
    this.open();
  }
}
