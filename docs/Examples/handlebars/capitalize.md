---
layout: default
parent: Examples
title: Handlebars - Capitalize
published: true
---
This uses a simple query to help show what the Capitalize helper does when rendering. 

```qatt
query: | 
  SELECT 'word' AS LowerCaseWord
template: | 
  {{#each result}}   
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}} 
```

