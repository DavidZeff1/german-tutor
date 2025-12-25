import { useState, useEffect } from "react";

export default function useApiKey() {
  const [apiKey, setApiKey] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("anthropic-api-key");
    if (saved) setApiKey(saved);
    setIsLoaded(true);
  }, []);

  const saveApiKey = (key) => {
    localStorage.setItem("anthropic-api-key", key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem("anthropic-api-key");
    setApiKey("");
  };

  return { apiKey, saveApiKey, clearApiKey, isLoaded };
}
