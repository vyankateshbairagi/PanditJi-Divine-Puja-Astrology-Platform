// Frontend/src/hooks/useLoading.js
import { useState } from 'react';

export const useLoading = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (asyncFunction) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err.userMessage || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute, setError };
};

// Usage in components:
// const { loading, error, execute } = useLoading();
// const handleSubmit = async () => {
//   await execute(() => api.call());
// };