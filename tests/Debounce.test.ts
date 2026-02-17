/* eslint-disable @typescript-eslint/no-floating-promises */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {debounce} from '../src/lib/Debounce';

describe('debounce', () => {
  it('delays function execution', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 50);
    debouncedFn();

    assert.strictEqual(callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callCount, 1);
  });

  it('only calls function once for multiple rapid calls', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 50);
    debouncedFn();
    debouncedFn();
    debouncedFn();

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callCount, 1);
  });

  it('returns a promise that resolves with function result', async () => {
    const fn = (value: number) => value * 2;
    const debouncedFn = debounce(fn, 50);

    const result = await debouncedFn(5);
    assert.strictEqual(result, 10);
  });

  it('passes arguments correctly', async () => {
    const fn = (a: number, b: string) => `${a}-${b}`;
    const debouncedFn = debounce(fn, 50);

    const result = await debouncedFn(42, 'test');
    assert.strictEqual(result, '42-test');
  });

  it('handles async functions', async () => {
    const fn = async (value: number) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return value * 2;
    };

    const debouncedFn = debounce(fn, 50);
    const result = await debouncedFn(5);
    assert.strictEqual(result, 10);
  });

  it('resets timer on each call within wait period', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    debouncedFn();

    assert.strictEqual(callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 110));
    assert.strictEqual(callCount, 1);
  });

  it('with isImmediate option calls function immediately', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 50, {isImmediate: true});
    await debouncedFn();

    assert.strictEqual(callCount, 1);
  });

  it('with isImmediate option prevents subsequent calls until wait period', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 50, {isImmediate: true});
    await debouncedFn();
    debouncedFn();
    debouncedFn();

    assert.strictEqual(callCount, 1);

    await new Promise(resolve => setTimeout(resolve, 60));
    await debouncedFn();
    assert.strictEqual(callCount, 2);
  });

  it('with callback option calls callback with result', async () => {
    let callbackResult: number | undefined;
    const fn = (value: number) => value * 2;
    const callback = (result: number) => {
      callbackResult = result;
    };

    const debouncedFn = debounce(fn, 50, {callback});
    await debouncedFn(5);

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callbackResult, 10);
  });

  it('with maxWait option enforces maximum wait time', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 100, {maxWait: 150});

    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 50));
    debouncedFn();

    // MaxWait should trigger after 150ms even with continuous calls
    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callCount, 1);
  });

  it('cancel prevents pending function call', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 50);
    const promise = debouncedFn();
    debouncedFn.cancel();

    // Catch the rejection to prevent unhandled promise rejection
    await promise.catch(() => {
      // Expected to be rejected
    });

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callCount, 0);
  });

  it('cancel rejects all pending promises', async () => {
    const fn = () => 'result';
    const debouncedFn = debounce(fn, 50);

    const promise1 = debouncedFn();
    const promise2 = debouncedFn();

    debouncedFn.cancel('Cancelled');

    // Properly handle the rejections
    let error1: any;
    let error2: any;
    try {
      await promise1;
    } catch (error) {
      error1 = error;
    }

    try {
      await promise2;
    } catch (error) {
      error2 = error;
    }

    assert.strictEqual(error1, 'Cancelled');
    assert.strictEqual(error2, 'Cancelled');
  });

  it('preserves this context', async () => {
    const object = {
      value: 42,
      method: debounce(function (this: {value: number}) {
        return this.value;
      }, 50),
    };

    const result = await object.method();
    assert.strictEqual(result, 42);
  });

  it('handles zero wait time', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debouncedFn = debounce(fn, 0);
    await debouncedFn();

    // With 0 wait, should call on next tick
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.strictEqual(callCount, 1);
  });

  it('resolves all promises with same result', async () => {
    const fn = (value: number) => value * 2;
    const debouncedFn = debounce(fn, 50);

    const promise1 = debouncedFn(5);
    const promise2 = debouncedFn(10);
    const promise3 = debouncedFn(15);

    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

    // All should resolve to the last call's result
    assert.strictEqual(result1, 30);
    assert.strictEqual(result2, 30);
    assert.strictEqual(result3, 30);
  });

  it('handles rapid successive calls correctly', async () => {
    const calls: number[] = [];
    const fn = (value: number) => {
      calls.push(value);
      return value;
    };

    const debouncedFn = debounce(fn, 50);

    for (let i = 0; i < 10; i++) {
      debouncedFn(i);
    }

    await new Promise(resolve => setTimeout(resolve, 60));

    // Should only have called once with the last value
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0], 9);
  });
});
