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

## qatt.ReferenceCalendar

The reference calendar is used to help with date based management, you can directly query the table or use it to join to other data sources.



%%snippet id='reference-calendar-table-snippet' options='nocodeblock'%%
If a property is not found in the task body it will be set to undefined. This table
is backed by dataview and will be refreshed when dataview is refreshed.

| Column Name      | Type    | Description                                                               |
| ---------------- | ------- | ------------------------------------------------------------------------- |
| date             | string  | date.toISODate()                                                          |
| day              | number  | date.day                                                                  |
| month            | number  | date.month                                                                |
| year             | number  | date.year                                                                 |
| dayOfWeek        | number  | date.weekday                                                              |
| dayOfYear        | number  | date.ordinal                                                              |
| weekOfYear       | number  | date.weekNumber                                                           |
| weekOfMonth      | number  | date.weekNumber - DateTime.local(date.year, date.month, 1).weekNumber + 1 |
| quarter          | number  | Math.ceil(date.month / 3)                                                 |
| isLeapYear       | boolean | date.isInLeapYear                                                         |
| isToday          | boolean | date.hasSame(DateTime.now(), 'day')                                       |
| isWeekend        | boolean | date.weekday > 5                                                          |
| isFuture         | boolean | date > DateTime.now()                                                     |
| isPast           | boolean | date < DateTime.now()                                                     |
| isCurrentMonth   | boolean | date.month === DateTime.now().month                                       |
| isCurrentYear    | boolean | date.year === DateTime.now().year                                         |
| isCurrentQuarter | boolean | Math.ceil(date.month / 3) === Math.ceil(DateTime.now().month / 3)         |
| isCurrentWeek    | boolean | date.weekNumber === DateTime.now().weekNumber                             |
| isCurrentDay     | boolean | date.hasSame(DateTime.now(), 'day')                                       |
%%/snippet%%
