import { useEffect, useState } from 'react';

export function useFetch(fetcher, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetcher();
        if (active) setData(result);
      } catch (fetchError) {
        if (active) setError(fetchError);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [fetcher]);

  return { data, loading, error };
}
