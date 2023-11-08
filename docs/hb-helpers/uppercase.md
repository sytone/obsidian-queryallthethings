---
layout: default
parent: Handlebars Helpers
grand_parent: Templates
title: uppercase value
---
The `uppercase`\-helper will convert the entire string to uppercase.

{% raw %}

```handlebars
  {{{uppercase sentence}}}
```

{% endraw %}

when used with this context:

```json
{
  sentence: "This Is Some SENtence"
}
```

will result in:

```text
THIS IS SOME SENTENCE
```