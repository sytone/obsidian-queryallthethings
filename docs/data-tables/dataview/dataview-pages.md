---
order: 24

parent: Data Tables
title: Dataview Pages
---
# Dataview Pages (dataview_pages)

This is similar to calling the dv.pages() function in Dataview. Each pages that is returned by this table has the fields as top level properties. So if you have `myfield:: fred` on the page then there will be a colum called myfield available for you to query against. Also at the top level you have tags and aliases. To get to the file details you need to drop into the `file` object. So to access the file path property you use file->path.

The JSON blob below is an example representation of what each page/row in the data set looks like and what you can use to query against in the SQL query. The markdown content this is derived from is also below.

```markdown
---
created: 2023-07-30T16:47:59-07:00
modified: 2023-07-30T16:47:59-07:00
aliases:
tags: inbox
---

DataviewFieldString:: What is the meaning of life?
DataviewFieldNumber:: 42
DataviewFieldBoolean:: true
DataviewFieldDate:: 2023-08-02

Outlink: [[Dashboard|Home]]

- List Item One
- List Item Two

- [ ] Task Item one
- [x] Task Item two
```

```text
{
    "file": {
      "path": "0 Inbox/Dataview Example.md",
      "folder": "0 Inbox",
      "name": "Dataview Example",
      "link": {
        "path": "0 Inbox/Dataview Example.md",
        "embed": false,
        "type": "file"
      },
      "outlinks": {
        "values": [
          {
            "path": "Dashboard.md",
            "type": "file",
            "display": "Home",
            "embed": false
          }
        ],
        "length": 1
      },
      "inlinks": {
        "values": [
          {
            "path": "Dashboard.md",
            "embed": false,
            "type": "file"
          }
        ],
        "length": 1
      },
      "etags": {
        "values": [
          "#inbox"
        ],
        "length": 1
      },
      "tags": {
        "values": [
          "#inbox"
        ],
        "length": 1
      },
      "aliases": {
        "values": [],
        "length": 0
      },
      "lists": {
        "values": [
          {
            "symbol": "-",
            "link": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "section": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "text": "List Item One",
            "tags": [],
            "line": 14,
            "lineCount": 1,
            "list": 14,
            "outlinks": [],
            "path": "0 Inbox/Dataview Example.md",
            "children": [],
            "task": false,
            "annotated": false,
            "position": {
              "start": {
                "line": 14,
                "col": 0,
                "offset": 266
              },
              "end": {
                "line": 14,
                "col": 15,
                "offset": 281
              }
            },
            "subtasks": [],
            "real": false,
            "header": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            }
          },
          {
            "symbol": "-",
            "link": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "section": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "text": "List Item Two\n",
            "tags": [],
            "line": 15,
            "lineCount": 2,
            "list": 14,
            "outlinks": [],
            "path": "0 Inbox/Dataview Example.md",
            "children": [],
            "task": false,
            "annotated": false,
            "position": {
              "start": {
                "line": 15,
                "col": 0,
                "offset": 282
              },
              "end": {
                "line": 16,
                "col": 0,
                "offset": 298
              }
            },
            "subtasks": [],
            "real": false,
            "header": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            }
          },
          {
            "symbol": "-",
            "link": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "section": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "text": "Task Item one",
            "tags": [],
            "line": 17,
            "lineCount": 1,
            "list": 14,
            "outlinks": [],
            "path": "0 Inbox/Dataview Example.md",
            "children": [],
            "task": true,
            "annotated": false,
            "position": {
              "start": {
                "line": 17,
                "col": 0,
                "offset": 299
              },
              "end": {
                "line": 17,
                "col": 19,
                "offset": 318
              }
            },
            "subtasks": [],
            "real": true,
            "header": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "status": " ",
            "checked": false,
            "completed": false,
            "fullyCompleted": false
          },
          {
            "symbol": "-",
            "link": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "section": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "text": "Task Item two",
            "tags": [],
            "line": 18,
            "lineCount": 1,
            "list": 14,
            "outlinks": [],
            "path": "0 Inbox/Dataview Example.md",
            "children": [],
            "task": true,
            "annotated": false,
            "position": {
              "start": {
                "line": 18,
                "col": 0,
                "offset": 319
              },
              "end": {
                "line": 18,
                "col": 19,
                "offset": 338
              }
            },
            "subtasks": [],
            "real": true,
            "header": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "status": "x",
            "checked": true,
            "completed": true,
            "fullyCompleted": true
          }
        ],
        "length": 4
      },
      "tasks": {
        "values": [
          {
            "symbol": "-",
            "link": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "section": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "text": "Task Item one",
            "tags": [],
            "line": 17,
            "lineCount": 1,
            "list": 14,
            "outlinks": [],
            "path": "0 Inbox/Dataview Example.md",
            "children": [],
            "task": true,
            "annotated": false,
            "position": {
              "start": {
                "line": 17,
                "col": 0,
                "offset": 299
              },
              "end": {
                "line": 17,
                "col": 19,
                "offset": 318
              }
            },
            "subtasks": [],
            "real": true,
            "header": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "status": " ",
            "checked": false,
            "completed": false,
            "fullyCompleted": false
          },
          {
            "symbol": "-",
            "link": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "section": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "text": "Task Item two",
            "tags": [],
            "line": 18,
            "lineCount": 1,
            "list": 14,
            "outlinks": [],
            "path": "0 Inbox/Dataview Example.md",
            "children": [],
            "task": true,
            "annotated": false,
            "position": {
              "start": {
                "line": 18,
                "col": 0,
                "offset": 319
              },
              "end": {
                "line": 18,
                "col": 19,
                "offset": 338
              }
            },
            "subtasks": [],
            "real": true,
            "header": {
              "path": "0 Inbox/Dataview Example.md",
              "type": "file",
              "embed": false
            },
            "status": "x",
            "checked": true,
            "completed": true,
            "fullyCompleted": true
          }
        ],
        "length": 2
      },
      "ctime": "2023-08-02T08:00:02.352-07:00",
      "cday": "2023-08-02T00:00:00.000-07:00",
      "mtime": "2023-08-02T08:02:51.957-07:00",
      "mday": "2023-08-02T00:00:00.000-07:00",
      "size": 595,
      "starred": false,
      "frontmatter": {
        "created": "2023-07-30T16:47:59-07:00",
        "modified": "2023-07-30T16:47:59-07:00",
        "aliases": null,
        "tags": "inbox"
      },
      "ext": "md"
    },
    "created": "2023-07-30T16:47:59.000-07:00",
    "modified": "2023-07-30T16:47:59.000-07:00",
    "aliases": null,
    "tags": "inbox",
    "DataviewFieldString": "What is the meaning of life?",
    "DataviewFieldNumber": 42,
    "DataviewFieldBoolean": true,
    "DataviewFieldDate": "2023-08-02T00:00:00.000-07:00",
    "dataviewfieldstring": "What is the meaning of life?",
    "dataviewfieldnumber": 42,
    "dataviewfieldboolean": true,
    "dataviewfielddate": "2023-08-02T00:00:00.000-07:00"
  }

```
