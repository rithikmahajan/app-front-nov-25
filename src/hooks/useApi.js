const { useState, useCallback } = require("react");

export default function useApi(baseURL = "http://localhost:8001") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  return { request, loading, error };
}

// ! code below is how you will call an api

// await request("/api/login", { 
//   method: "POST", 
//   body: JSON.stringify({ email, password }) 
// });
