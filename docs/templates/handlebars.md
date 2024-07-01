---
order: 4

parent: Using Templates
title: Default Helpers
---
# {{ $frontmatter.title }}

This page is based off <https://handlebarsjs.com/guide/builtin-helpers.html> and contains details on the built in helpers.

### #if

You can use the `if` helper to conditionally render a block. If its argument returns `false`, `undefined`, `null`, `""`, `0`, or `[]`, Handlebars will not render the block.


```text
<div class="entry">
{{#if author}}
<h1>{{firstName}} {{lastName}}</h1>
{{/if}}
</div>
```


When you pass the following input to the above template

```text
{
  author: true,
  firstName: "Yehuda",
  lastName: "Katz",
}
```

This will produce the result as below:

```text
<div class="entry">
<h1>Yehuda Katz</h1>
</div>
```

If the input is an empty JSONObject `{}`, then `author` will become `undefined` and `if` condition fails, resulting in the output as follow:

```text
<div class="entry"></div>
```

When using a block expression, you can specify a template section to run if the expression returns a falsy value. The section, marked by `else` is called an "else section".

```text
<div class="entry">
{{#if author}}
<h1>{{firstName}} {{lastName}}</h1>
{{else}}
<h1>Unknown Author</h1>
{{/if}}
</div>
```


### includeZero

The `includeZero=true` option may be set to treat the conditional as not empty. This effectively determines if `0` is handled by the positive or negative path.

```text
{{#if 0 includeZero=true}}
<h1>Does render</h1>
{{/if}}
```


### Sub-Expressions

Helpers are the proposed way to add custom logic to templates. You can write any helper and use it in a sub-expression.

For example, in checking for initialization of a variable the built-in `#if` check might not be appropriate as it returns false for empty collections (see [Utils.isEmpty](https://handlebarsjs.com/api-reference/utilities.html#handlebars-utils-isempty-value)).

You could write a helper that checks for "undefined" such as:

```text
Handlebars.registerHelper('isdefined', function (value) {
  return value !== undefined;
});
```

Then use your helper as a sub-expression:

```text
{{#if (isdefined value1)}}true{{else}}false{{/if}}
{{#if (isdefined value2)}}true{{else}}false{{/if}}
```


## #unless

You can use the `unless` helper as the inverse of the `if` helper. Its block will be rendered if the expression returns a falsy value.

```text
<div class="entry">
{{#unless license}}
<h3 class="warning">WARNING: This entry does not have a license!</h3>
{{/unless}}
</div>
```

If looking up `license` under the current context returns a falsy value, Handlebars will render the warning. Otherwise, it will render nothing.

## #each

You can iterate over a list using the built-in `each` helper. Inside the block, you can use `this` to reference the element being iterated over.

```text
<ul class="people_list">
  {{#each people}}
    <li>{{this}}</li>
  {{/each}}
</ul>
```

when used with this context:

```text
{
  people: [
    "Yehuda Katz",
    "Alan Johnson",
    "Charles Jolley",
  ],
}
```

will result in:

```text
<ul class="people_list">
    <li>Yehuda Katz</li>
    <li>Alan Johnson</li>
    <li>Charles Jolley</li>
</ul>
```

You can use the `this` expression in any context to reference the current context.

You can optionally provide an `else` section which will display only when the list is empty.

```text
{{#each paragraphs}}
<p>{{this}}</p>
{{else}}
<p class="empty">No content</p>
{{/each}}
```

When looping through items in `each`, you can optionally reference the current loop index via `{% raw %}{{@index}}{% endraw %}`.

```text
{{#each array}} {{@index}}: {{this}} {{/each}}
```

Additionally for object iteration, `{% raw %}{{@key}}{% endraw %}` references the current key name:

```text
{{#each object}} {{@key}}: {{this}} {{/each}}
```

The first and last steps of iteration are noted via the [`@first`](https://handlebarsjs.com/api-reference/data-variables.html#first) and [`@last`](https://handlebarsjs.com/api-reference/data-variables.html#last) variables when iterating over an array.

Nested `each` blocks may access the iteration variables via depth based paths. To access the parent index, for example, `{% raw %}{{@../index}}{% endraw %}` can be used.

## #with

The `with`\-helper allows you to change the evaluation context of template-part.

```text
{{#with person}}
{{firstname}} {{lastname}}
{{/with}}
```

when used with this context:

```text
{
  person: {
    firstname: "Yehuda",
    lastname: "Katz",
  },
}
```

will result in:

```text
Yehuda Katz
```

`with` can also be used with block parameters to define known references in the current block. The example above can be converted to

```text
{{#with city as | city |}}
  {{#with city.location as | loc |}}
    {{city.name}}: {{loc.north}} {{loc.east}}
  {{/with}}
{{/with}}
```

Which allows for complex templates to potentially provide clearer code than `../` depthed references allow for.

You can optionally provide an `{% raw %}{{else}}{% endraw %}` section which will display only when the passed value is empty.

```text
{{#with city}}
{{city.name}} (not shown because there is no city)
{{else}}
No city found
{{/with}}
```


```text
{
  person: {
    firstname: "Yehuda",
    lastname: "Katz",
  },
}
```

## lookup

The `lookup` helper allows for dynamic parameter resolution using Handlebars variables.

This is useful for resolving values for array indexes.

```text
{{#each people}}
   {{.}} lives in {{lookup ../cities @index}}
{{/each}}
```


It can also be used to lookup properties of object based on data from the input. The following is a more complex example that uses `lookup` in a sub-expression to change the evaluation context to another object based on a property-value.

```text
{{#each persons as | person |}}
    {{name}} lives in {{#with (lookup ../cities [resident-in])~}}
      {{name}} ({{country}})
    {{/with}}
{{/each}}
```

