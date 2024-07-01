---
order: 25

parent: Data Tables
title: Dataview Tasks
---
# Dataview Tasks (dataview_tasks)

If a property is not found in the task body it will be set to undefined. This table
is backed by Dataview and will be refreshed when Dataview is refreshed.

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
| priority       | number       | Priority of the task with 1 as highest and 3 as lowest                                                  |
