import { AuthenticationContext } from '@/components/heimdall';
import firebase from '@/configurations/firebase';
import trpc from '@/libs/trpc';
import { Button, Text } from '@mantine/core';
import { getAuth } from 'firebase/auth';
import { useContext } from 'react';

export default function () {
  const UseAuthReturn = useContext(AuthenticationContext);
  const { data, isLoading } = trpc.guarded.useQuery();
  if (!UseAuthReturn) {
    throw new Error('no context');
  }

  const [, send] = UseAuthReturn;
  const onLogout = () => {
    const auth = getAuth(firebase);
    auth
      .signOut()
      .then(() => {
        send('UNAUTHENTICATED');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <Text>Dashboard</Text>
      {isLoading && <Text>Loading...</Text>}
      {data && <Text>{data.message}</Text>}
      <Button color={'red'} onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
}
