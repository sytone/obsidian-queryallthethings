import alasql from 'alasql';

/*
// >> id='alasql-function-arrayfrom' options='file=sql-functions/arrayfrom.md'
title: arrayfrom(value)
---
The `arrayfrom` function allows the user to map a item to an array, for example a Map via mapname->values()

// << alasql-function-arrayfrom
*/
export function registerFunctionArrayFrom(): void {
  alasql.fn.arrayFrom = function (value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return Array.from(value);
  };
}