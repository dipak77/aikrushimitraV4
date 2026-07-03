export class RetryPolicy {
  static async execute<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelayMs = 1000
  ): Promise<T> {
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (error: any) {
        attempt++;
        const status = error?.status || error?.statusCode;
        const isNetworkError = error instanceof TypeError || 
                               error?.message?.includes('fetch') || 
                               error?.message?.includes('network') || 
                               error?.message?.includes('timeout') || 
                               error?.message?.includes('Failed to fetch') ||
                               error?.message?.includes('FETCH_ERROR');
        const isRetryable = !status || status === 429 || status === 500 || status === 503 || isNetworkError;

        if (attempt >= maxRetries || !isRetryable) {
          throw error;
        }

        console.warn(`⚠️ RetryPolicy: Attempt ${attempt} failed with ${error.message}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw new Error('RetryPolicy failed after max retries.');
  }
}
