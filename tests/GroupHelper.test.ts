/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {group} from '../src/Render/HandlebarsHelpers/Group';
import Handlebars, {type HelperOptions} from 'handlebars';

describe('group helper', () => {
  it('groups items by simple property', () => {
    const items = [
      {name: 'Alice', team: 'A'},
      {name: 'Bob', team: 'B'},
      {name: 'Charlie', team: 'A'},
    ];

    let result = '';
    const options = {
      fn: (context: any) => {
        result += `Team ${context.value as string}: ${context.items.length as string} members;`;
        return '';
      },
      inverse: () => 'No items',
      hash: {by: 'team'},
    } as unknown as HelperOptions;

    group(items, options);

    assert.ok(result.includes('Team A: 2 members'));
    assert.ok(result.includes('Team B: 1 members'));
  });

  it('groups items by nested property', () => {
    const items = [
      {name: 'Alice', address: {city: 'NYC'}},
      {name: 'Bob', address: {city: 'LA'}},
      {name: 'Charlie', address: {city: 'NYC'}},
    ];

    let callCount = 0;
    const options = {
      fn: (context: any) => {
        callCount++;
        return '';
      },
      inverse: () => 'No items',
      hash: {by: 'address.city'},
    } as unknown as HelperOptions;

    group(items, options);

    // Should group into 2 cities
    assert.strictEqual(callCount, 2);
  });

  it('returns inverse when list is empty', () => {
    const items: any[] = [];

    const options = {
      fn: () => 'Found items',
      inverse: () => 'No items found',
      hash: {by: 'team'},
    } as unknown as HelperOptions;

    const result = group(items, options);

    assert.strictEqual(result, 'No items found');
  });

  it('returns inverse when list is null', () => {
    const items = null;

    const options = {
      fn: () => 'Found items',
      inverse: () => 'No items',
      hash: {by: 'team'},
    } as unknown as HelperOptions;

    const result = group(items, options);

    assert.strictEqual(result, 'No items');
  });

  it('returns inverse when groupByProperty is not provided', () => {
    const items = [{name: 'Alice'}];

    const options = {
      fn: () => 'Found items',
      inverse: () => 'Missing property',
      hash: {},
    } as unknown as HelperOptions;

    const result = group(items, options);

    assert.strictEqual(result, 'Missing property');
  });

  it('preserves group order based on first appearance', () => {
    const items = [
      {value: 1, group: 'C'},
      {value: 2, group: 'A'},
      {value: 3, group: 'B'},
      {value: 4, group: 'A'},
      {value: 5, group: 'C'},
    ];

    const groups: string[] = [];
    const options = {
      fn: (context: any) => {
        groups.push(context.value as string);
        return '';
      },
      inverse: () => '',
      hash: {by: 'group'},
    } as unknown as HelperOptions;

    group(items, options);

    // Groups should appear in order: C, A, B
    assert.deepStrictEqual(groups, ['C', 'A', 'B']);
  });

  it('groups items correctly with same property value', () => {
    const items = [
      {id: 1, status: 'active'},
      {id: 2, status: 'active'},
      {id: 3, status: 'active'},
    ];

    const options = {
      fn: (context: any) => {
        assert.strictEqual(context.value, 'active');
        assert.strictEqual(context.items.length, 3);
        return '';
      },
      inverse: () => '',
      hash: {by: 'status'},
    } as unknown as HelperOptions;

    group(items, options);
  });

  it('handles items with undefined property values', () => {
    const items = [
      {name: 'Alice', team: 'A'},
      {name: 'Bob'},
      {name: 'Charlie', team: 'A'},
    ];

    const groups: any[] = [];
    const options = {
      fn: (context: any) => {
        groups.push({value: context.value, count: context.items.length});
        return '';
      },
      inverse: () => '',
      hash: {by: 'team'},
    } as unknown as HelperOptions;

    group(items, options);

    assert.strictEqual(groups.length, 2);
    const aGroup = groups.find((g: any) => g.value === 'A');
    const undefinedGroup = groups.find((g: any) => g.value === undefined);

    assert.strictEqual(aGroup?.count, 2);
    assert.strictEqual(undefinedGroup?.count, 1);
  });

  it('handles deeply nested properties', () => {
    const items = [
      {data: {meta: {category: 'tech'}}},
      {data: {meta: {category: 'sports'}}},
      {data: {meta: {category: 'tech'}}},
    ];

    let groupCount = 0;
    const options = {
      fn: () => {
        groupCount++;
        return '';
      },
      inverse: () => '',
      hash: {by: 'data.meta.category'},
    } as unknown as HelperOptions;

    group(items, options);

    assert.strictEqual(groupCount, 2);
  });

  it('handles null values in nested property path', () => {
    const items = [
      {data: {meta: {category: 'tech'}}},
      {data: null},
      {data: {meta: {category: 'tech'}}},
    ];

    let groupCount = 0;
    const options = {
      fn: () => {
        groupCount++;
        return '';
      },
      inverse: () => '',
      hash: {by: 'data.meta.category'},
    } as unknown as HelperOptions;

    group(items, options);

    // Should have 2 groups: 'tech' and undefined
    assert.strictEqual(groupCount, 2);
  });

  it('works with Handlebars template', () => {
    Handlebars.registerHelper('group', group);

    const template = Handlebars.compile(`
      {{#group items by="category"}}
        Category: {{value}}
        {{#each items}}
          - {{name}}
        {{/each}}
      {{/group}}
    `);

    const data = {
      items: [
        {name: 'Apple', category: 'Fruit'},
        {name: 'Carrot', category: 'Vegetable'},
        {name: 'Banana', category: 'Fruit'},
      ],
    };

    const result = template(data);

    assert.ok(result.includes('Category: Fruit'));
    assert.ok(result.includes('Category: Vegetable'));
    assert.ok(result.includes('- Apple'));
    assert.ok(result.includes('- Banana'));
    assert.ok(result.includes('- Carrot'));
  });

  it('handles numeric group values', () => {
    const items = [
      {value: 1, priority: 1},
      {value: 2, priority: 2},
      {value: 3, priority: 1},
    ];

    const groups: any[] = [];
    const options = {
      fn: (context: any) => {
        groups.push({value: context.value, count: context.items.length});
        return '';
      },
      inverse: () => '',
      hash: {by: 'priority'},
    } as unknown as HelperOptions;

    group(items, options);

    assert.strictEqual(groups.length, 2);
    const priority1 = groups.find((g: any) => g.value === 1);
    const priority2 = groups.find((g: any) => g.value === 2);

    assert.strictEqual(priority1?.count, 2);
    assert.strictEqual(priority2?.count, 1);
  });

  it('provides access to grouped items', () => {
    const items = [
      {name: 'Alice', age: 30},
      {name: 'Bob', age: 25},
      {name: 'Charlie', age: 30},
    ];

    const groupedData: any[] = [];
    const options = {
      fn: (context: any) => {
        groupedData.push({
          age: context.value,
          people: context.items.map((item: any) => item.name),
        });
        return '';
      },
      inverse: () => '',
      hash: {by: 'age'},
    } as unknown as HelperOptions;

    group(items, options);

    const age30Group = groupedData.find((g: any) => g.age === 30);
    const age25Group = groupedData.find((g: any) => g.age === 25);

    assert.deepStrictEqual(age30Group?.people, ['Alice', 'Charlie']);
    assert.deepStrictEqual(age25Group?.people, ['Bob']);
  });

  it('handles empty string as property value', () => {
    const items = [
      {name: 'Item1', category: ''},
      {name: 'Item2', category: 'A'},
      {name: 'Item3', category: ''},
    ];

    const groups: any[] = [];
    const options = {
      fn: (context: any) => {
        groups.push({value: context.value, count: context.items.length});
        return '';
      },
      inverse: () => '',
      hash: {by: 'category'},
    } as unknown as HelperOptions;

    group(items, options);

    const emptyGroup = groups.find((g: any) => g.value === '');
    const aGroup = groups.find((g: any) => g.value === 'A');

    assert.strictEqual(emptyGroup?.count, 2);
    assert.strictEqual(aGroup?.count, 1);
  });
});
