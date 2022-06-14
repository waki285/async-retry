interface RetryOptions {
  retries?: number;
  onRetry?<T>(error: unknown): T;
}

type Bail = (err: unknown) => void;

const retry = async <R,>(fn: <T,>(bail: Bail) => Promise<R>, { retries = 10, onRetry }: RetryOptions = {}): Promise<R> => {
  let bailed: boolean;
  const bail = (err: unknown) => {
    bailed = true;
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
      if (bailed) throw err;
      if (onRetry) {
        return onRetry(err);
      }
      return tempFunc(retryCount + 1);
    }
  }
  return await tempFunc(0);
};

export default retry;