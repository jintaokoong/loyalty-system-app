import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { PropsWithChildren } from 'react';
import Heimdall from './components/heimdall';
import trpc from './libs/trpc';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:5000/trpc',
    }),
  ],
});

export default function (p: PropsWithChildren) {
  return (
    <Heimdall>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <MantineProvider withGlobalStyles={true}>
            {p.children}
          </MantineProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </Heimdall>
  );
}
