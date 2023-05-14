import type { LayoutOptions } from '../LayoutOptions';

/**
 * Standard interface for the query engine used by Tasks, multiple
 * engines can be created by using this and then updating the
 * Query Render class to handle the syntax for the new query engine.
 *
 * @export
 * @interface IQuery
 */
export interface IQuery {
    /**
     * The name of the engine used in UI and logging.
     *
     * @type {string}
     * @memberof IQuery
     */
    name: string;

    /**
     * This is the text from the code block in markdown and contains
     * the query to be used by a implementation of the IQuery.
     *
     * @type {string}
     * @memberof IQuery
     */
    source: string;

    /**
     * Error message if there is an error in the query. This will be
     * shown to users.
     *
     * @type {(string | undefined)}
     * @memberof IQuery
     */
    error: string | undefined;

    /**
     * The template used to render the query results.
     *
     * @type {(string | undefined)}
     * @memberof IQuery
     */
    template: string | undefined;

    /**
     * Any layout options the query engine should be aware of or
     * used in the query.
     *
     * @type {LayoutOptions}
     * @memberof IQuery
     */
    layoutOptions: LayoutOptions;

    /**
     * Main method for executing the query. This will be called by the
     * code block processor registered in Obsidian. It takes the Task collection
     * from the cache and returns a TaskGroup collection. If there is no grouping
     * then the TaskGroup collection will contain a single TaskGroup with all tasks
     * found using the query.
     *
     * @param {string} queryId
     * @param {Task[]} tasks
     * @return {*}  {TaskGroups}
     * @memberof Query
     */
    applyQuery: (queryId: string) => any;
}
