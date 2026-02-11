---
order: 10
title: Troubleshooting
---

# {{ $frontmatter.title }}

This guide will help you troubleshoot common issues with Query All The Things (QATT).

## Enable Debug Mode

The easiest way to troubleshoot QATT queries is to enable Debug Mode:

1. Open Obsidian Settings
2. Navigate to Query All The Things settings
3. Under "General Settings", enable "Enable Debug Mode"
4. Return to your note with the query codeblock

When Debug Mode is enabled, each query codeblock will display detailed information including:
- **Execution status** - Whether the query is waiting, executing, or complete
- **Timing information** - How long each step takes
- **Error details** - Specific error messages and stack traces
- **Query results** - Number of results returned
- **Render information** - Details about the template rendering

### Example Debug Output

With Debug Mode enabled, you'll see messages like:

```
Status: Initializing
Starting query execution...
Time: 5ms | Render ID: :path/to/file.md

Status: Executing Query
Query engine: alasql
Time: 15ms | Render ID: :path/to/file.md

Status: Query Complete
Retrieved 10 result(s)
Time: 45ms | Render ID: :path/to/file.md

Status: Complete
Query executed and rendered successfully. Post-render format: markdown
Time: 120ms | Render ID: :path/to/file.md
```

## Per-Query Debug Mode

You can also enable debug mode for individual queries by adding `logLevel: debug` to your codeblock:

````markdown
```qatt
logLevel: debug
query: |
  SELECT TOP 5 * FROM obsidian_notes
template: |
  {{#each result}}
  - [[{{path}}|{{basename}}]]
  {{/each}}
```
````

## Common Issues

### Query Returns No Results

**Symptoms:** The query executes but shows an empty result

**Debug Steps:**
1. Enable Debug Mode to verify the query is executing
2. Check the debug output for "Retrieved X result(s)"
3. Test your query in the console:
   - Open Obsidian Developer Tools (Ctrl+Shift+I or Cmd+Option+I)
   - Run the command "Query All The Things: Report the metrics for the plugin to the console"
   - Or test the query manually in the console

**Common Causes:**
- Wrong table name - The correct table name is `obsidian_notes`. Common mistakes include using `obsidian_markdown_notes` (which is a legacy table that may not be populated) or `notes` (which doesn't exist). Always refer to the documentation for the correct table names.
- Missing data - the notes cache may not be loaded yet
- Incorrect WHERE conditions

### Query Not Executing

**Symptoms:** Nothing appears in the codeblock, no error messages

**Debug Steps:**
1. Enable Debug Mode
2. Look for the "Status: Waiting" message
3. Check what data is still loading

**Common Causes:**
- Dataview plugin is not installed (for dataview-backed tables)
- Notes cache is still loading (especially on large vaults)
- YAML syntax error in the codeblock configuration

**Solutions:**
- Wait for the "Status: Initializing" message to appear
- Check browser console (Ctrl+Shift+I or Cmd+Option+I) for error messages
- Verify YAML syntax - indentation matters!

### Syntax Error in Query

**Symptoms:** Error message appears in the codeblock

**Debug Steps:**
1. Check the error message for the specific issue
2. Verify SQL syntax
3. Test simpler queries first

**Common Causes:**
- Missing quotes around string values
- Incorrect table or column names
- SQL syntax errors

**Example:**
```sql
-- Wrong - missing quotes
SELECT * FROM obsidian_notes WHERE basename = MyNote

-- Correct
SELECT * FROM obsidian_notes WHERE basename = 'MyNote'
```

### Template Not Rendering

**Symptoms:** Query executes but template doesn't render properly

**Debug Steps:**
1. Enable Debug Mode
2. Check "Render Complete" message
3. Verify the template syntax

**Common Causes:**
- Handlebars syntax errors
- Wrong property names in the template
- Missing `result` in template loops

**Example:**
````markdown
```qatt
query: |
  SELECT basename FROM obsidian_notes LIMIT 5
template: |
  {{#each result}}
  - {{basename}}
  {{/each}}
```
````

## Using Console Commands

QATT provides several console commands for debugging:

1. **View Internal Events:**
   - Command Palette → "Query All The Things: Will push all the internal events to the console for debugging"

2. **View Tasks:**
   - Command Palette → "Query All The Things: Will push all the internal obsidian_markdown_tasks table to the console"

3. **View Available Tables:**
   - Command Palette → "Query All The Things: Dump the in memory tables known by Alasql to the editor"

4. **View Metrics:**
   - Command Palette → "Query All The Things: Report the metrics for the plugin to the console"

5. **Force Refresh:**
   - Command Palette → "Query All The Things: Force a refresh of all blocks for QATT"
   - Command Palette → "Query All The Things: Force the notes cache to be reloaded"

## Checking Browser Console

Advanced troubleshooting often requires checking the browser console:

1. Open Developer Tools (Ctrl+Shift+I on Windows/Linux, Cmd+Option+I on Mac)
2. Go to the Console tab
3. Look for messages prefixed with `[QATT Debug]` or timestamped QATT messages
4. Error messages will appear in red

## Getting Help

If you're still having issues:

1. Enable Debug Mode and take a screenshot of the debug output
2. Check the browser console for error messages
3. Create an issue on [GitHub](https://github.com/sytone/obsidian-queryallthethings/issues) with:
   - Your query codeblock (sanitize any private data)
   - The debug output or error messages
   - Your Obsidian version
   - QATT plugin version

## Performance Issues

If queries are running slowly:

1. Check the debug timing information to see which step is slow
2. Consider using indexes or limiting result sets
3. Avoid querying large amounts of data unnecessarily
4. Use the `TOP` clause to limit results: `SELECT TOP 100 * FROM obsidian_notes`

## Known Limitations

- QATT depends on Obsidian's metadata cache being loaded
- Large vaults (thousands of notes) may take time to cache on startup
- Dataview-backed tables require the Dataview plugin to be installed
- CustomJS features require the CustomJS plugin to be installed
