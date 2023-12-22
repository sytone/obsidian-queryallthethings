export function codeBlockHeader(value: string) {
  return new Handlebars.SafeString('```' + value);
}
