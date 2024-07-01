---

parent: Handlebars
grand_parent: Examples / Tutorials
title: Group Helper
---

This example uses the `qatt.ReferenceCalendar` table to get all the dates for February in the current year and groups by the `weekOfYear` value.

The render helper `group` then takes the result of the query and does a group by `weekOfYear`. Inside the `group` helper the value of the grouping property can be accessed by using `{{value}}`. In the example below it is being used as the 4th level header value.

The items in the group are then available via the `items` property. Below this is iterated though to get the `date` value and if it `isWeekend`. These are then used to display different outputs if `isWeekend` is true.

### Example
````markdown
```qatt
query: |
  SELECT *
  FROM qatt.ReferenceCalendar
  WHERE year = moment()->year()
  AND month = 2
template: |
  {{#group result by="weekOfYear"}}
  #### Week {{value}}
  {{#each items}}
  {{#if isWeekend}}
  - {{date}} 🥳🎂🍾🥂
  {{else}}
  - {{date}} ⚒️
  {{/if}}
  {{/each}}
  {{/group}}
```
````
### Live in Vault
```qatt
query: |
  SELECT *
  FROM qatt.ReferenceCalendar
  WHERE year = moment()->year()
  AND month = 2
template: |
  {{#group result by="weekOfYear"}}
  #### Week {{value}}
  {{#each items}}
  {{#if isWeekend}}
  - {{date}} 🥳🎂🍾🥂
  {{else}}
  - {{date}} ⚒️
  {{/if}}
  {{/each}}
  {{/group}}
```