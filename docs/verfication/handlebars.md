---
exclude: true
---

#### capitalize

```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```
---
#### codeBlockHeader & codeBlockFooter

```qatt
query: |
  SELECT 'something to render in a code block as text ' AS code
template: |
  {{#each result}}
    {{codeBlockHeader 'text'}}
    {{code}}
    {{codeBlockFooter}}
  {{/each}}
```

```qatt
query: |
  SELECT '// Javascript Example for code block type
  var c = ((1 < 2) ? true : false)' AS code
template: |
  {{#each result}}
    {{codeBlockHeader 'javascript'}}
    {{{code}}}
    {{codeBlockFooter}}
  {{/each}}
```
---
#### formatDate (miliseconds to YYYY-MM-DD)

```qatt
query: |
  SELECT 0 as modified
template: |
  {{#each result}}
  {{formatDate modified}}
  {{/each}}
```
---
#### group

```qatt
query: |
  SELECT TOP 14 *
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

#### isHighPriority

```qatt
query: |
  SELECT 1 AS pri1, 2 AS pri2, 3 AS pri3
template: |
  {{#each result}}
    Pri 1: {{isHighPriority pri1}}
    Pri 2: {{isHighPriority pri2}}
    Pri 3: {{isHighPriority pri3}}
  {{/each}}
```
#### isLowPriority
```qatt
query: |
  SELECT 1 AS pri1, 2 AS pri2, 3 AS pri3
template: |
  {{#each result}}
    Pri 1: {{isLowPriority pri1}}
    Pri 2: {{isLowPriority pri2}}
    Pri 3: {{isLowPriority pri3}}
  {{/each}}
```
#### isMediumPriority
```qatt
query: |
  SELECT 1 AS pri1, 2 AS pri2, 3 AS pri3
template: |
  {{#each result}}
    Pri 1: {{isMediumPriority pri1}}
    Pri 2: {{isMediumPriority pri2}}
    Pri 3: {{isMediumPriority pri3}}
  {{/each}}
```
#### lowercase
```qatt
query: |
  SELECT 'asdfSDFsdf7823452dfgjkhlsdfgsdfgEDFGJIKDFG9dfglkjdfg' AS VariedCase
template: |
  {{#each result}}
    Value from result: **{{VariedCase}}**
    Value using lowercase: **{{lowercase VariedCase}}**
  {{/each}}
```

#### uppercase
```qatt
query: |
  SELECT 'asdfSDFsdf7823452dfgjkhlsdfgsdfgEDFGJIKDFG9dfglkjdfg' AS VariedCase
template: |
  {{#each result}}
    Value from result: **{{VariedCase}}**
    Value using uppercase: **{{uppercase VariedCase}}**
  {{/each}}
```

#### noteLink
```qatt
query: |
  SELECT 'notepages/school/My Cool Page' AS link
template: |
  {{#each result}}
    Value: {{link}}
    Note Link: {{noteLink link}}
  {{/each}}
```

#### pad
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    Pad '-' 20 times
    Start{{pad 20 padWith="-"}}End
  {{/each}}
```

#### stringify

```qatt
query: |
  SELECT TOP 1 * FROM obsidian_notes ORDER BY modified DESC
template: |
  {{#each result}}
  [[{{basename}}]]
  stringify headings: `{{stringify headings}}`
  {{/each}}
```


#### toInt
```qatt
query: |
  SELECT now() as converttoint
template: |
  {{#each result}}
    {{converttoint}} to string: {{toInt converttoint}}
  {{/each}}
```
#### trim
```qatt
query: |
  SELECT '   sdf sdf s sd    ' as needsatrim
template: |
  {{#each result}}
    Not trimmed: **Start**{{needsatrim}}**End**
    Trimmed: **Start**{{trim needsatrim}}**End**
  {{/each}}
```
