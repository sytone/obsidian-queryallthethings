import {PromptModal, type PromptModalError} from 'lib/PromptModal';
import {SuggesterModal, type SuggesterModalError} from 'lib/SuggesterModal';

// This is used across the plugin to make sure that the object path exists.
export function confirmObjectPath(path: string, leaf?: any): void {
  const pathChain = path.split('.');
  let parent: any = window;
  for (let i = 0; i < pathChain.length - 1; i++) {
    // eslint-disable-next-line no-multi-assign, @typescript-eslint/no-unsafe-assignment
    parent = (parent[pathChain[i]] ||= {});
  }

  parent[pathChain[pathChain.length - 1]] ||= (leaf === undefined ? {} : leaf);
}

// Review where this should end up landing in the code base and if I
// should centralize the internat functions better for user interaction.
// eslint-disable-next-line max-params
export async function promptWithSuggestions<T>(
  text_items: string[] | ((item: T) => string),
  items: T[],
  throw_on_cancel?: boolean,
  placeholder?: string,
  limit?: number,
): Promise<T> {
  if (throw_on_cancel === undefined) {
    throw_on_cancel = false;
  }

  if (placeholder === undefined) {
    placeholder = '';
  }

  const suggester = new SuggesterModal(
    text_items,
    items,
    placeholder,
    limit,
  );
  const promise = new Promise(
    // eslint-disable-next-line no-async-promise-executor
    async (
      resolve: (value: T) => void,
      reject: (reason?: SuggesterModalError) => void,
    // eslint-disable-next-line no-promise-executor-return
    ) => suggester.openAndGetValue(resolve, reject),
  );
  try {
    return await promise;
  } catch (error) {
    if (throw_on_cancel) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw error;
    }

    return null as T;
  }
}

export async function promptForInput<T>(
  prompt_text: string,
  default_value: string,
  throw_on_cancel: boolean,
  multi_line: boolean,
): Promise<string | undefined> {
  if (throw_on_cancel === undefined) {
    throw_on_cancel = false;
  }

  if (default_value === undefined) {
    default_value = '';
  }

  if (multi_line === undefined) {
    multi_line = false;
  }

  const prompt = new PromptModal(
    prompt_text,
    default_value,
    multi_line,
  );
  const promise = new Promise(
    // eslint-disable-next-line no-async-promise-executor
    async (
      resolve: (value: string) => void,
      reject: (reason?: PromptModalError) => void,
    // eslint-disable-next-line no-promise-executor-return
    ) => prompt.openAndGetValue(resolve, reject),
  );
  try {
    return await promise;
  } catch (error) {
    if (throw_on_cancel) {
      throw error;
    }

    return undefined;
  }
}
