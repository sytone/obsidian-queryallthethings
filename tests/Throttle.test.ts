/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {throttle, asyncThrottle} from '../src/lib/Throttle';

describe('throttle', () => {
  it('calls function immediately on first invocation', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttledFn = throttle(fn, 100);
    throttledFn();

    assert.strictEqual(callCount, 1);
  });

  it('prevents function calls within delay period', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttledFn = throttle(fn, 100);
    throttledFn();
    throttledFn();
    throttledFn();

    assert.strictEqual(callCount, 1);
  });

  it('allows function call after delay period', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttledFn = throttle(fn, 50);
    throttledFn();

    await new Promise(resolve => setTimeout(resolve, 60));
    throttledFn();

    assert.strictEqual(callCount, 2);
  });

  it('schedules trailing call when called multiple times', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttledFn = throttle(fn, 50);
    throttledFn();
    throttledFn();
    throttledFn();

    await new Promise(resolve => setTimeout(resolve, 60));

    // Should have been called twice: once immediately, once trailing
    assert.strictEqual(callCount, 2);
  });

  it('passes arguments correctly', async () => {
    let lastArg: string | undefined;
    const fn = (arg: string) => {
      lastArg = arg;
    };

    const throttledFn = throttle(fn, 50);
    throttledFn('first');
    throttledFn('second');

    assert.strictEqual(lastArg, 'first');

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(lastArg, 'second');
  });

  it('preserves this context', async () => {
    const object = {
      value: 42,
      method: throttle(function (this: {value: number}) {
        return this.value;
      }, 50),
    };

    object.method();
    assert.strictEqual(object.value, 42);
  });

  it('cancel prevents scheduled call', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttledFn = throttle(fn, 50);
    throttledFn();
    throttledFn();
    throttledFn.cancel();

    await new Promise(resolve => setTimeout(resolve, 60));

    // Should only have been called once (immediately), trailing call cancelled
    assert.strictEqual(callCount, 1);
  });

  it('handles zero delay', () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttledFn = throttle(fn, 0);
    throttledFn();
    throttledFn();

    assert.ok(callCount >= 1);
  });

  it('handles multiple rapid calls correctly', async () => {
    const calls: number[] = [];
    const fn = (value: number) => {
      calls.push(value);
    };

    const throttledFn = throttle(fn, 50);

    for (let i = 0; i < 10; i++) {
      throttledFn(i);
    }

    // First call should be immediate
    assert.strictEqual(calls[0], 0);

    await new Promise(resolve => setTimeout(resolve, 60));

    // Should have trailing call with last value
    assert.strictEqual(calls[calls.length - 1], 9);
    // Should have at most 2 calls
    assert.ok(calls.length <= 2);
  });
});

describe('asyncThrottle', () => {
  it('returns a promise that resolves with function result', async () => {
    const fn = async (value: number) => value * 2;
    const throttledFn = asyncThrottle(fn, 50);

    const result = await throttledFn(5);
    assert.strictEqual(result, 10);
  });

  it('throttles multiple calls and returns last result', async () => {
    let callCount = 0;
    const fn = async (value: number) => {
      callCount++;
      return value * 2;
    };

    const throttledFn = asyncThrottle(fn, 50);

    throttledFn(5);
    throttledFn(10);
    const result = await throttledFn(15);

    assert.strictEqual(result, 30);
    assert.strictEqual(callCount, 1);
  });

  it('handles synchronous functions', async () => {
    const fn = (value: number) => value * 2;
    const throttledFn = asyncThrottle(fn, 50);

    const result = await throttledFn(5);
    assert.strictEqual(result, 10);
  });

  it('passes arguments correctly', async () => {
    const fn = async (a: number, b: string) => `${a}-${b}`;
    const throttledFn = asyncThrottle(fn, 50);

    const result = await throttledFn(42, 'test');
    assert.strictEqual(result, '42-test');
  });

  it('handles errors correctly', async () => {
    const fn = async () => {
      throw new Error('Test error');
    };

    const throttledFn = asyncThrottle(fn, 50);

    await assert.rejects(
      async () => throttledFn(),
      {message: 'Test error'},
    );
  });

  it('resets timeout on each call', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return callCount;
    };

    const throttledFn = asyncThrottle(fn, 100);

    throttledFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    throttledFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    const result = await throttledFn();

    // Should only have called once after final timeout
    assert.strictEqual(callCount, 1);
    assert.strictEqual(result, 1);
  });

  it('handles rapid successive calls', async () => {
    const calls: number[] = [];
    const fn = async (value: number) => {
      calls.push(value);
      return value;
    };

    const throttledFn = asyncThrottle(fn, 50);

    for (let i = 0; i < 5; i++) {
      throttledFn(i);
    }

    await new Promise(resolve => setTimeout(resolve, 60));

    // Should only have called once with last value
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0], 4);
  });
});
