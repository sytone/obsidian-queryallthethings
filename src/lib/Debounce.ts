// Sourced from https://github.com/chodorowicz/ts-debounce/blob/master/src/index.ts
// Avoiding extra libraries at this point.

export interface IOptions<Result> {
  isImmediate?: boolean;
  maxWait?: number;
  callback?: (data: Result) => void;
}

export interface IDebouncedFunction<
  Args extends any[],
  F extends (...args: Args) => any,
> {
  (this: ThisParameterType<F>, ...args: Args & Parameters<F>): Promise<
  ReturnType<F>
  >;
  cancel: (reason?: any) => void;
}

interface IDebouncedPromise<FunctionReturn> {
  resolve: (result: FunctionReturn) => void;
  reject: (reason?: any) => void;
}

export function debounce<Args extends any[], F extends (...args: Args) => any>(
  func: F,
  waitMilliseconds = 50,
  options: IOptions<ReturnType<F>> = {},
): IDebouncedFunction<Args, F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const isImmediate = options.isImmediate ?? false;
  const callback = options.callback ?? false;
  const maxWait = options.maxWait;
  let lastInvokeTime = Date.now();

  // eslint-disable-next-line @typescript-eslint/array-type
  let promises: IDebouncedPromise<ReturnType<F>>[] = [];

  function nextInvokeTimeout() {
    if (maxWait !== undefined) {
      const timeSinceLastInvocation = Date.now() - lastInvokeTime;

      if (timeSinceLastInvocation + waitMilliseconds >= maxWait) {
        return maxWait - timeSinceLastInvocation;
      }
    }

    return waitMilliseconds;
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const debouncedFunction = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const context = this;
    return new Promise<ReturnType<F>>((resolve, reject) => {
      const invokeFunction = function () {
        timeoutId = undefined;
        lastInvokeTime = Date.now();
        if (!isImmediate) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const result = func.apply(context, args);
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unsafe-argument
          callback && callback(result);
          // eslint-disable-next-line unicorn/no-array-for-each, @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-unsafe-argument
          promises.forEach(({resolve}) => resolve(result));
          promises = [];
        }
      };

      const shouldCallNow = isImmediate && timeoutId === undefined;

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(invokeFunction, nextInvokeTimeout());

      if (shouldCallNow) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = func.apply(context, args);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unsafe-argument
        callback && callback(result);
        // eslint-disable-next-line no-promise-executor-return, @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-unsafe-argument
        return resolve(result);
      }

      promises.push({resolve, reject});
    });
  };

  debouncedFunction.cancel = function (reason?: any) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // eslint-disable-next-line unicorn/no-array-for-each, @typescript-eslint/no-confusing-void-expression
    promises.forEach(({reject}) => reject(reason));
    promises = [];
  };

  return debouncedFunction;
}
