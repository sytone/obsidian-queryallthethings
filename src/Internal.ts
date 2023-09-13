
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

