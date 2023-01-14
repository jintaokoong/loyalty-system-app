import { AuthenticationContext } from '@/components/heimdall';
import firebase from '@/configurations/firebase';
import trpc from '@/libs/trpc';
import { Button, Text } from '@mantine/core';
import { getAuth } from 'firebase/auth';
import { useContext } from 'react';

const AdminComponent = () => {
  const { data, isLoading, error } = trpc.admin.useQuery();
  return (
    <>
      {isLoading && <Text>Loading...</Text>}
      {data && <Text>{data.message}</Text>}
      {error && <Text color={'red'}>{error.message}</Text>}
    </>
  );
};

export default function () {
  const UseAuthReturn = useContext(AuthenticationContext);
  const { data, isLoading } = trpc.guarded.useQuery(undefined);
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
      <AdminComponent />
      <Button color={'red'} onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
}
