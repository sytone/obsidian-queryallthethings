
export interface IQuery {
    name: string;
    source: string;
    error: string | undefined;
    template: string | undefined;
    applyQuery: (queryId: string) => any;
}
