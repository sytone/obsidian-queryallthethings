/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-relationaloperators' options='file=templates/hb-helpers/relationaloperators.md'
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

// << docs-handlebars-helper-relationaloperators
*/
/*
// >> id='docs-examples-handlebars-relationaloperators' options='file=examples-tutorials/handlebars/relationaloperators.md'
title: Relational Operators Helper
---

This uses a simple query to help show what the Relational Operators helpers does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT TOP 10 path, name, frontmatter->type AS page_type
  FROM obsidian_notes
  WHERE frontmatter->type
template: |
  ## ✅ Next actions
  {{#each result}}
    - [[{{name}}]] - {{page_type}} -
  {{#eq page_type 'journal'}}
    <!-- When the two values are equal -->
    Journal Page!!!!
  {{else}}
    <!-- When the two values are not equal -->
    Not Journal Page
  {{/eq}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT TOP 10 path, name, frontmatter->type AS page_type
  FROM obsidian_notes
  WHERE frontmatter->type
template: |
  ## ✅ Next actions
  {{#each result}}
    - [[{{name}}]] - {{page_type}} -
  {{#eq page_type 'Journal'}}
    <!-- When the two values are equal -->
    Journal Page!!!!
  {{else}}
    <!-- When the two values are not equal -->
    Not Journal Page
  {{/eq}}
  {{/each}}
```

// << docs-examples-handlebars-relationaloperators
*/

/**
 * Compares two values for equality using strict comparison (===).
 * If the values are equal, it executes the `fn` function from the last argument.
 * Otherwise, it executes the `inverse` function from the last argument.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns The result of `fn` if `a` and `b` are equal, otherwise the result of `inverse`.
 */
export function eq(a: any, b: any) {
  const next = arguments[arguments.length - 1];
  return (a === b) ? next.fn() : next.inverse();
}

/**
 * Handlebars helper function to compare if the first argument is greater than or equal to the second argument.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns The result of the comparison: if `a` is greater than or equal to `b`, it returns the result of `next.fn()`, otherwise it returns the result of `next.inverse()`.
 */
export function ge(a: any, b: any) {
  const next = arguments[arguments.length - 1];
  return (a >= b) ? next.fn() : next.inverse();
}

/**
 * Handlebars helper function to compare if the first argument is greater than the second argument.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns The result of the comparison. If `a` is greater than `b`, it returns the result of `next.fn()`, otherwise it returns the result of `next.inverse()`.
 */
export function gt(a: any, b: any) {
  const next = arguments[arguments.length - 1];
  return (a > b) ? next.fn() : next.inverse();
}

/**
 * Compares two values using the less than or equal to (<=) operator.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns The result of the comparison: if `a` is less than or equal to `b`,
 *          it returns the result of `next.fn()`, otherwise it returns the result of `next.inverse()`.
 */
export function le(a: any, b: any) {
  const next = arguments[arguments.length - 1];
  return (a <= b) ? next.fn() : next.inverse();
}

/**
 * Handlebars helper function to compare if the first argument is less than the second argument.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns The result of the Handlebars block based on the comparison.
 */
export function lt(a: any, b: any) {
  const next = arguments[arguments.length - 1];
  return (a < b) ? next.fn() : next.inverse();
}

/**
 * Handlebars helper function to check if two values are not equal.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns The result of the Handlebars block based on the comparison.
 */
export function ne(a: any, b: any) {
  const next = arguments[arguments.length - 1];
  return (a === b) ? next.inverse() : next.fn();
}
