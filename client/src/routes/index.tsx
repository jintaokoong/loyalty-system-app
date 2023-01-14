import trpc from '@/libs/trpc';
import { Button } from '@mantine/core';

export default function Index() {
  const { data, isLoading } = trpc.greet.useQuery('world');
  return <div>{isLoading ? '...' : data?.message}</div>;
}
