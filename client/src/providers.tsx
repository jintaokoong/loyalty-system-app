import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { getAuth } from 'firebase/auth';
import { PropsWithChildren } from 'react';
import Heimdall from './components/heimdall';
import firebase from './configurations/firebase';
import trpc from './libs/trpc';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:5000/trpc',
      headers: async () => {
        try {
          const auth = getAuth(firebase);
          const currentUser = auth.currentUser;
          if (!currentUser) {
            return {};
          }
          const token = await currentUser.getIdToken();
          return {
            Authorization: `Bearer ${token}`,
          };
        } catch (error) {
          console.error(error);
          return {};
        }
      },
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
