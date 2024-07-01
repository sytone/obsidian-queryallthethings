---

parent: Examples / Tutorials
title: Dataview Fields
---
# {{ $frontmatter.title }}

The fields in Dataview are stored in a JavaScript Map. So if you have the following content and wanted to extract `author` you can use this example below.

## Example Markdown

```markdown
## The Raven

From [author:: Edgar Allan Poe], written in (published:: 1845)

Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
```

## Query to return the author field value

In this query we are using `fields->get('author')` to return the value in the Map the corresponds to the `author` key. This is the same as JavaScript, just replace the `.` in the normal JavaScript approach with the `->`.


````markdown
```qatt
postRenderFormat: html
query: |
  SELECT TOP 1 *,
  fields->get('author') AS Author
  from dataview_pages
  where path = '0 Inbox/Dataview Tags Example.md'
template: |
  <pre>{{stringify result}}</pre>
```
````


## Rendered Output

```markdown
<pre>[
  {
    "Author": "Edgar Allan Poe",
    "path": "0 Inbox/Dataview Tags Example.md",
    "fields": {},
    "frontmatter": {
      "created": "2023-07-30T16:47:59-07:00",
      "modified": "2023-07-30T16:47:59-07:00",
      "aliases": null,
      "tags": "inbox"
    },
    "tags": {},
    "aliases": {},
    "links": [],
    "lists": [],
    "ctime": "2023-07-31T10:52:50.925-07:00",
    "mtime": "2023-07-31T10:52:51.628-07:00",
    "size": 657
  }
]</pre>
```
