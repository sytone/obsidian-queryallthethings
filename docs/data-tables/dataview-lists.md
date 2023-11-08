---
nav_order: 26
layout: default
parent: Data Tables
title: Dataview Lists (dataview_lists)
---
## Dataview Lists (dataview_lists)

%%snippet id='lists-table-snippet' options='nocodeblock'%%
If a property is not found in the task body it will be set to undefined. This table
is backed by Dataview and will be refreshed when Dataview is refreshed.

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
