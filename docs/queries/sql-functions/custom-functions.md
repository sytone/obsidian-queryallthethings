---

title: Custom Functions
order: 7
nav_exclude: true
---

# Custom Functions

If you have CustomJS enabled you can add custom functions to be available in the SQL queries. The example below uses the class found in [[customjs/custom-functions.js]]. To reference a function in your query you need to add a directive to the code block telling it what functions to make available. It will then register the CustomJS function in the referenced class.

The format of the directive is: `customjs: ClassName FunctionName`

The example below uses this class registered in CustomJS

```javascript
class MyTaskFunctions {
    SuperImportant(status) {
        return status === '!';
    }
}
```

It is then made available in the query via the `customjs` directive specifying the class name and then the function name. It is `customjs MyTaskFunctions SuperImportant` for this example.

When called from the query the status object is passed to the function as a property allowing the function to return true if the indicator value is equal to `!`

 ```qatt
 query: SELECT * FROM tasks WHERE SuperImportant(status)
 customJSForSql: ['MyTaskFunctions SuperImportant']
 ```
