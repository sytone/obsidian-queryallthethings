export function asyncThrottle<T extends (...args: any[]) => any>(
  func: T,
  timeout: number,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let t: ReturnType<typeof setTimeout> | undefined;

  // eslint-disable-next-line @typescript-eslint/promise-function-async, func-names
  return function replacement(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    return new Promise<Awaited<ReturnType<T>>>(resolve => {
      if (t) {
        clearTimeout(t);
      }

      t = setTimeout(() => {
        resolve(func(...args)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      }, timeout);
    });
  };
}

export interface IThrottledFunction<T extends (...args: any[]) => any> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Throttle function that limits the rate at which a function can be called.
 *
 * @template T - The type of the function being throttled.
 * @param {T} func - The function to be throttled.
 * @param {number} delay - The delay in milliseconds between function calls.
 * @returns {IThrottledFunction<T>} - The throttled function.
 *
 * @example
 * function handleScroll(event: Event) {
 *   console.log('Scrolled');
 * }
 *
 * const throttledScroll = throttle(handleScroll, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 *
 * // To cancel the throttled function:
 * // throttledScroll.cancel();
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): IThrottledFunction<T> {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const throttledFunc: IThrottledFunction<T> = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      func.apply(this, args);
      lastCall = now;
    } else {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func.apply(this, args);
        lastCall = Date.now();
        timeout = undefined;
      }, delay - (now - lastCall));
    }
  };

  throttledFunc.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  return throttledFunc;
}
