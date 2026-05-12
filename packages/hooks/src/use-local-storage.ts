import { useState, useEffect, useCallback } from "react";

const APP_STORAGE_KEY = import.meta.env.VITE_APP_NAME;

const getSavedValue = <T>(key: string, initialValue: T): T => {
  try {
    const localStorageValue = localStorage.getItem(key);
    if (localStorageValue !== null) {
      const savedValue = JSON.parse(localStorageValue);
      if (savedValue != null) return savedValue;
    }
  } catch {
    // corrupt value, fall through to initialValue
  }
  if (initialValue instanceof Function) return initialValue();
  return initialValue;
};

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const storageKey = `${APP_STORAGE_KEY}_${key}`;
  const [value, setValue] = useState<T | null>(() => {
    return getSavedValue<T>(storageKey, initialValue);
  });

  useEffect(() => {
    if (value == null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }
    window.dispatchEvent(
      new CustomEvent("storage", { detail: { key: storageKey, value } })
    );
  }, [value, storageKey]);

  const listener = useCallback(
    (e: CustomEvent) => {
      if (e.detail.key === storageKey) {
        setValue(e.detail.value ?? null);
      }
    },
    [storageKey]
  );

  useEffect(() => {
    window.addEventListener("storage", listener as EventListener);
    return () =>
      window.removeEventListener("storage", listener as EventListener);
  }, [listener]);

  return [value, setValue] as const;
};

export default useLocalStorage;
