import { useState, useEffect } from "react";

// Generic fetch hook: takes an async "fetcher" function and runs it
// inside useEffect whenever `deps` changes, tracking loading/error/data.
// Right now `fetcher` resolves mock data with an artificial delay; from
// Experiment 4 onward the same hook will be reused with fetcher functions
// that call the real Express + MongoDB REST API instead.
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cleanup guards against setting state after the component using
    // this hook has unmounted (e.g. navigating away mid-request).
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

// Wraps a plain value in a mock async call, simulating network latency
// so loading states are visible and testable before a real API exists.
export function mockApiCall(value, delay = 500) {
  return () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(value), delay);
    });
}
