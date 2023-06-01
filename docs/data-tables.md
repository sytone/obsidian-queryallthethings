# Data Tables

To make it simpler to quey data some in memory data tables have been created.

## Tasks

%%snippet id='tasks-table-snippet' options='nocodeblock'%%
If a property is not found in the task body it will be set to undefined. This table
is backed by dataview and will be refreshed when dataview is refreshed.

| Column Name    | Type         | Description                                                                                             |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| page           | string       | The full path including the page name and extension                                                     |
| task           | string       | The full text of the task, any tags or dates are still in this. This may be multiple lines of markdown. |
| status         | string       | The text in between the brackets of the '[ ]' task indicator ('[X]' would yield 'X', for example.)      |
| line           | number       | The line that this list item starts on in the file.                                                     |
| tags           | string array | Array of tags                                                                                           |
| tagsNormalized | string array | Array of tags all in lowercase                                                                          |
| dueDate        | string       | Due date of the task as string.                                                                         |
| doneDate       | string       | Done date of the task as string.                                                                        |
| startDate      | string       | Start date of the task as string.                                                                       |
| createDate     | string       | Create date of the task as string.                                                                      |
| scheduledDate  | string       | Schedule date of the task as string.                                                                    |
| priority       | number       | Priority of the task with 1 as highest and three as lowest                                              |
%%/snippet%%

## Lists

%%snippet id='lists-table-snippet' options='nocodeblock'%%
If a property is not found in the task body it will be set to undefined. This table
is backed by dataview and will be refreshed when dataview is refreshed.

| Column Name | Type         | Description |
| ----------- | ------------ | ----------- |
| symbol      | string       |             |
| path        | string       |             |
| pageName    | string       |             |
| text        | number       |             |
| line        | string array |             |
| fields      | string array |             |
| lineCount   | string       |             |
| list        | string       |             |
| section     | string       |             |
| links       | string       |             |
| children    | string       |             |
| parent      | number       |             |
%%/snippet%%

