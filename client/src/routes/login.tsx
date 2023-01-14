import { AuthenticationContext } from '@/components/heimdall';
import firebase from '@/configurations/firebase';
import {
  Box,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useContext, useState } from 'react';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function () {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { getInputProps, onSubmit } = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  });
  const UseAuthReturn = useContext(AuthenticationContext);
  if (!UseAuthReturn) {
    throw new Error('no context');
  }
  const [, send] = UseAuthReturn;

  const onAuthenticate = (values: z.infer<typeof loginSchema>) => {
    const auth = getAuth(firebase);
    setIsSigningIn(true);
    signInWithEmailAndPassword(auth, values.username, values.password)
      .then((creds) => {
        send({
          type: 'AUTHENTICATED',
          user: creds.user,
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  };

  return (
    <Box
      component="main"
      sx={(t) => ({
        display: 'grid',
        height: '100vh',
        placeItems: 'center',
      })}
    >
      <Paper
        component="form"
        withBorder={true}
        p={'md'}
        sx={(t) => ({
          display: 'flex',
          flexDirection: 'column',
          gap: t.spacing.md,
          minWidth: 350,
        })}
        onSubmit={onSubmit(onAuthenticate)}
      >
        <Text mb={'xl'}>Sign in to your account!</Text>
        <TextInput label={'Username'} {...getInputProps('username')} />
        <PasswordInput label={'Password'} {...getInputProps('password')} />
        <Button loading={isSigningIn} type="submit">
          Sign in
        </Button>
      </Paper>
    </Box>
  );
}
