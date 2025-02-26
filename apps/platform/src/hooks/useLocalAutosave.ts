import { useEffect, useRef, useState } from 'react';

export default function useLocalAutosave(key: string, data: string) {
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
        console.log('Autosaved:', dataRef.current);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [autosave]);

  return { autosave, setAutosave };
}
