---

parent: Handlebars Helpers
grand_parent: Using Templates
title: Relational Operators
---
# {{ $frontmatter.title }}

The Relational Operators helpers will allow you to compare two values using different relational operators.

## Operators

- eq - equal to
- ne - not equal to
- lt - less than
- gt - greater than
- le - less than or equal to
- ge - greater than or equal to

With any helper add values a, b to be compared if their condition validates

## Usage

Include the operators needed in your application. Then condition in your template, for example:

```handlebars
{{#eq a b}}
  content when condition validates
{{else}}
  content in any other case
{{/eq}}
```

### Credits

Created by [Makis Tracend](http://github.com/tracend)
Sourced from: https://gist.github.com/tracend/7522125