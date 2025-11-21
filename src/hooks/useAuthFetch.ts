"use client";
import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

export const useAuthFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async <T>(
    url: string,
    options?: RequestInit
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Xatolik yuz berdi");
      }

      const data = await response.json();
      setLoading(false);
      return data as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Xatolik";
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  return { fetchData, loading, error, setError };
};
