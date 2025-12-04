'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  // eslint-disable-next-line react/hook-use-state -- The queryClient setter is not required
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ReactQueryProvider;
