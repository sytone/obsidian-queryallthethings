---
order: 6

title: Settings
---
# {{ $frontmatter.title }}

The plugin has multiple settings, there are descriptions in the settings to help you out and some more details here.

## General Settings

### On Start SQL Queries

If you want to create tables and set data so your queries can use it at a later time without having to duplicate the queries you can add them in this setting. These will be executed when the plugin is loaded after the data tables have been initialized.

Here you can make tables and insert data if needed for referencing later.

## Rendering Settings

### Default Post Render Format

Once the template has finished rendering the final output needs to be HTML. If the template returns markdown then it needs to be converted, this settings allows you to select the default processor so you do not have to set it in each codeblock.

The options are:

- Obsidian Markdown - Use the inbuilt markdown rendering, this is async and you may notice rendering issues.
- Micromark - A external rendering engine that supports most of the Obsidian and GitHub markdown formatting.
- None - Nothing, all output is expected to be HTML unless the code block has configuration specifying otherwise.

## Loaders

The following loaders will import data from your vault as well as re-importing the data if a change is detected. If this happens a signal is sent to the current pages and any qatt codeblock will be refreshed.

There is limited support for web based data, if you use this option it will only import the data on the first load of Obsidian and will expect the endpoint to be unauthenticated.

To use this option on a new line in one of the loader setting add the following replacing the options with your versions.

`WEB|{Table Name}|{Url to data}`

For example if you had a endpoint that returns JSON you would add this to the settings for the JSON loader. It would make a table called `test_posts` and then return the content from `https://jsonplaceholder.typicode.com/posts`. You can then select data from the `test_posts` table.

`WEB|test_posts|https://jsonplaceholder.typicode.com/posts`

## CSV Loader Settings

### CSV to load on start

Add the files you want added on load, one per line. The table name will be the name of the file minus the extension.

You can use markdown files so you can see and edit in the Obsidian UI, when referencing the file if you have a page in Obsidian  `refdata/places_to_visit` you would enter `refdata/places_to_visit.md` in the settings box.

For this example file, a table called `places_to_visit` will be created and then you can query it using `SELECT TOP 1 * FROM places_to_visit WHERE country = 'Egypt`.

The CSV file should be well formatted, if there are issues you can look in the console log as on load it outputs the tables being loaded and any errors if found along with the line number.

## Markdown Table Loader Settings

### Markdown Table to load on start

Add the files you want added on load, one per line. The table name will be the name of the file minus the extension. Only a markdown table should exist on the page.

This is expecting just a markdown table, nothing before the table or after it. It will ignore empty lines.

## Json Loader Settings

### Json to load on start

Add the files you want added on load, one per line. The table name will be the name of the file minus the extension. Only JSON content should be in the file.

The content should be an array structure with object in it. If it is an object with an array you will only have one row in the table for that object.
