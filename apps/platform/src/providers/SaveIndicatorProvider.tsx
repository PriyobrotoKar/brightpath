'use client';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

interface SaveIndicatorContextType {
  isSaving: Record<string, boolean>;
  setIsSaving: Dispatch<SetStateAction<Record<string, boolean>>>;
}

const SaveIndicatorContext = createContext<SaveIndicatorContextType | null>(
  null,
);

export default function SaveIndicatorProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  return (
    <SaveIndicatorContext.Provider value={{ isSaving, setIsSaving }}>
      {children}
    </SaveIndicatorContext.Provider>
  );
}

export function useSaveIndicator(lessonId: string | undefined): {
  isSaving: boolean;
  setIsSaving: (value: boolean) => void;
} {
  const context = useContext(SaveIndicatorContext);

  if (!context) {
    throw new Error(
      'useSaveIndicator must be used within a SaveIndicatorProvider',
    );
  }

  if (!lessonId) {
    return {
      isSaving: false,
      setIsSaving: () => {},
    };
  }

  const { isSaving, setIsSaving } = context;

  const isSavingForLesson = isSaving[lessonId] ?? false;

  const setIsSavingForLesson = (value: boolean): void => {
    setIsSaving((prev) => ({ ...prev, [lessonId]: value }));
  };

  return {
    isSaving: isSavingForLesson,
    setIsSaving: setIsSavingForLesson,
  };
}
