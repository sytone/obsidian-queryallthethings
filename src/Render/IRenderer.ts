
export interface IRenderer {
  renderTemplate: (template: string, result: any) => string;
  defaultTemplate: string;
}
