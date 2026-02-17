/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {Mutex} from '../src/lib/Mutex';

describe('Mutex', () => {
  it('allows single operation to acquire lock', async () => {
    const mutex = new Mutex();
    const release = await mutex.acquire();

    assert.ok(typeof release === 'function');
    release();
  });

  it('queues multiple operations', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    const release1 = await mutex.acquire();
    order.push(1);

    // Start second acquire (will be queued)
    const promise2 = mutex.acquire().then(release => {
      order.push(2);
      return release;
    });

    // Start third acquire (will be queued)
    const promise3 = mutex.acquire().then(release => {
      order.push(3);
      return release;
    });

    // Only first should have executed
    assert.deepStrictEqual(order, [1]);

    release1();
    const release2 = await promise2;

    // Now second should have executed
    assert.deepStrictEqual(order, [1, 2]);

    release2();
    const release3 = await promise3;

    // Now third should have executed
    assert.deepStrictEqual(order, [1, 2, 3]);

    release3();
  });

  it('runExclusive executes function exclusively', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    const result = await mutex.runExclusive(async () => {
      order.push(1);
      await new Promise(resolve => setTimeout(resolve, 10));
      order.push(2);
      return 'result';
    });

    assert.strictEqual(result, 'result');
    assert.deepStrictEqual(order, [1, 2]);
  });

  it('runExclusive queues concurrent calls', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    const promise1 = mutex.runExclusive(async () => {
      order.push(1);
      await new Promise(resolve => setTimeout(resolve, 50));
      order.push(2);
      return 'first';
    });

    const promise2 = mutex.runExclusive(async () => {
      order.push(3);
      await new Promise(resolve => setTimeout(resolve, 50));
      order.push(4);
      return 'second';
    });

    const promise3 = mutex.runExclusive(async () => {
      order.push(5);
      return 'third';
    });

    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

    assert.strictEqual(result1, 'first');
    assert.strictEqual(result2, 'second');
    assert.strictEqual(result3, 'third');

    // Operations should execute in order, not interleaved
    assert.deepStrictEqual(order, [1, 2, 3, 4, 5]);
  });

  it('runExclusive releases lock on success', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    await mutex.runExclusive(async () => {
      order.push(1);
    });

    await mutex.runExclusive(async () => {
      order.push(2);
    });

    assert.deepStrictEqual(order, [1, 2]);
  });

  it('runExclusive releases lock on error', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    await assert.rejects(
      async () => mutex.runExclusive(async () => {
        order.push(1);
        throw new Error('Test error');
      }),
      {message: 'Test error'},
    );

    // Lock should be released even after error
    await mutex.runExclusive(async () => {
      order.push(2);
    });

    assert.deepStrictEqual(order, [1, 2]);
  });

  it('prevents race conditions on shared resource', async () => {
    const mutex = new Mutex();
    let counter = 0;

    const increment = async () => {
      await mutex.runExclusive(async () => {
        const temporary = counter;
        await new Promise(resolve => setTimeout(resolve, 10));
        counter = temporary + 1;
      });
    };

    // Run 10 concurrent increments
    await Promise.all(Array.from({length: 10}, increment));

    // Without mutex, this would likely be less than 10 due to race conditions
    assert.strictEqual(counter, 10);
  });

  it('handles synchronous runExclusive callbacks', async () => {
    const mutex = new Mutex();
    const result = await mutex.runExclusive(async () => 42);

    assert.strictEqual(result, 42);
  });

  it('maintains queue order with mixed acquire and runExclusive', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    // Start with acquire
    const release1 = await mutex.acquire();
    order.push(1);

    // Queue runExclusive
    const promise2 = mutex.runExclusive(async () => {
      order.push(2);
    });

    // Queue another acquire
    const promise3 = mutex.acquire().then(release => {
      order.push(3);
      return release;
    });

    assert.deepStrictEqual(order, [1]);

    release1();
    await promise2;

    assert.deepStrictEqual(order, [1, 2]);

    const release3 = await promise3;
    assert.deepStrictEqual(order, [1, 2, 3]);

    release3();
  });

  it('handles rapid acquire and release cycles', async () => {
    const mutex = new Mutex();
    const acquisitions: number[] = [];

    const acquireAndRelease = async (id: number) => {
      const release = await mutex.acquire();
      acquisitions.push(id);
      await new Promise(resolve => setTimeout(resolve, 5));
      release();
    };

    await Promise.all([
      acquireAndRelease(1),
      acquireAndRelease(2),
      acquireAndRelease(3),
      acquireAndRelease(4),
      acquireAndRelease(5),
    ]);

    // All acquisitions should complete
    assert.strictEqual(acquisitions.length, 5);
    // Each ID should appear exactly once
    assert.deepStrictEqual([...new Set(acquisitions)].sort(), [1, 2, 3, 4, 5]);
  });

  it('handles empty queue correctly', async () => {
    const mutex = new Mutex();

    const release1 = await mutex.acquire();
    release1();

    // Acquire again after release
    const release2 = await mutex.acquire();
    release2();

    // Should work without issues
    assert.ok(true);
  });

  it('allows reacquisition after release', async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    const release1 = await mutex.acquire();
    order.push(1);
    release1();

    const release2 = await mutex.acquire();
    order.push(2);
    release2();

    assert.deepStrictEqual(order, [1, 2]);
  });

  it('runExclusive returns correct value type', async () => {
    const mutex = new Mutex();

    const stringResult = await mutex.runExclusive(async () => 'hello');
    assert.strictEqual(stringResult, 'hello');

    const numberResult = await mutex.runExclusive(async () => 42);
    assert.strictEqual(numberResult, 42);

    const objectResult = await mutex.runExclusive(async () => ({key: 'value'}));
    assert.deepStrictEqual(objectResult, {key: 'value'});
  });

  it('handles concurrent runExclusive with different return types', async () => {
    const mutex = new Mutex();

    const [result1, result2, result3] = await Promise.all([
      mutex.runExclusive(async () => 'string'),
      mutex.runExclusive(async () => 123),
      mutex.runExclusive(async () => true),
    ]);

    assert.strictEqual(result1, 'string');
    assert.strictEqual(result2, 123);
    assert.strictEqual(result3, true);
  });
});
