// Runtime safety utilities to prevent undefined call errors

export function safeFunctionCall<T extends (...args: any[]) => any>(
  fn: T | undefined | null,
  fallback: ReturnType<T>,
  ...args: Parameters<T>
): ReturnType<T> {
  try {
    if (typeof fn === 'function') {
      return fn(...args);
    }
    return fallback;
  } catch (error) {
    console.warn("Error in safe function call:", error);
    return fallback;
  }
}

export function safeAsyncFunctionCall<T extends (...args: any[]) => Promise<any>>(
  fn: T | undefined | null,
  fallback: Awaited<ReturnType<T>>,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
  try {
    if (typeof fn === 'function') {
      return fn(...args);
    }
    return Promise.resolve(fallback);
  } catch (error) {
    console.warn("Error in safe async function call:", error);
    return Promise.resolve(fallback);
  }
}

export function safeObjectAccess<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return fallback;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : fallback;
  } catch (error) {
    console.warn("Error in safe object access:", error);
    return fallback;
  }
}

export function safeArrayAccess<T>(
  arr: any[] | undefined | null,
  index: number,
  fallback: T
): T {
  try {
    if (Array.isArray(arr) && index >= 0 && index < arr.length) {
      return arr[index];
    }
    return fallback;
  } catch (error) {
    console.warn("Error in safe array access:", error);
    return fallback;
  }
}

export function safeStringify(obj: any, fallback: string = "{}"): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn("Error in safe stringify:", error);
    return fallback;
  }
}

export function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn("Error in safe parse:", error);
    return fallback;
  }
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
  
  window.addEventListener('error', (event) => {
    console.warn('Global error:', event.error);
  });
}
