interface RetryOptions {
  retries?: number;
  onRetry?<T>(error: unknown): T;
}

type Bail = (err: unknown) => void;

const retry = async <R,>(fn: <T,>(bail: Bail) => Promise<R>, { retries = 10, onRetry }: RetryOptions = {}): Promise<R> => {
  const bail = (err: unknown) => {
    throw err;
  }
  const tempFunc = async (retryCount: number): Promise<R> => {
    if (retryCount >= retries) {
      return bail(new Error(`Retry count exceeded ${retries}`));
    }
    try {
      const result = await fn(bail);
      return result;
    } catch (err) {
      if (onRetry) {
        return onRetry(err);
      }
      return tempFunc(retryCount + 1);
    }
  }
  return await tempFunc(0);
};

retry(async (bail) => 1, { retries: 1 });

export default retry;