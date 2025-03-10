import { useEffect, useRef, useState } from 'react';

export default function useLocalAutosave(
  key: string,
  data: string,
): { autosave: boolean; setAutosave: (value: boolean) => void } {
  const [autosave, setAutosave] = useState(false);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autosave) {
        // Save data to local storage
        localStorage.setItem(key, dataRef.current);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key is not a dependency
  }, [autosave]);

  return { autosave, setAutosave };
}
