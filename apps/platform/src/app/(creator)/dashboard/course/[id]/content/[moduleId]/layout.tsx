import type { ReactNode } from 'react';
import React from 'react';
import Sidebar from './_components/Sidebar';
import SaveIndicatorProvider from '@/providers/SaveIndicatorProvider';
import Header from '@/app/(creator)/dashboard/_components/Header';

export default function ModuleContentLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-full flex-col">
      <Header
        subtitle="Here’s an overview of your bootcamps and active learners"
        title="Content Library"
      />
      <div className="flex h-full pt-4">
        <SaveIndicatorProvider>
          <Sidebar />
          {children}
        </SaveIndicatorProvider>
      </div>
    </div>
  );
}
