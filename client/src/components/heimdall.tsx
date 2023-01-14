import firebase from '@/configurations/firebase';
import { getAuth } from 'firebase/auth';
import authenticationMachine from '@/machines/authentication-machine';
import { useMachine } from '@xstate/react';
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { InterpreterFrom, Prop, StateFrom } from 'xstate';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';

export const AuthenticationContext = createContext<
  | [
      StateFrom<typeof authenticationMachine>,
      Prop<InterpreterFrom<typeof authenticationMachine>, 'send'>,
    ]
  | null
>(null);

const AuthenticationProvider = (p: PropsWithChildren) => {
  const [state, send, intepret] = useMachine(authenticationMachine);
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const auth = getAuth(firebase);
    const sub = auth.onAuthStateChanged((user) => {
      if (user) {
        send('AUTHENTICATED');
      } else {
        send('UNAUTHENTICATED');
      }
    });
    return () => sub();
  }, [send]);

  useEffect(() => {
    const sub = intepret.subscribe((state) => {
      if (
        state.matches('authenticated') &&
        matchRoutes(
          [
            {
              path: '/login',
            },
          ],
          loc.pathname,
        )
      ) {
        console.log('authenticated');
        navigate('/dashboard');
      } else if (
        state.matches('anonymous') &&
        matchRoutes(
          [
            { path: '/dashboard' },
            {
              path: '/dashboard/*',
            },
          ],
          loc.pathname,
        )
      ) {
        console.log('unauthenticated');
        navigate('/login');
      } else if (
        matchRoutes([{ path: '/' }], loc.pathname) &&
        !state.matches('clean')
      ) {
        navigate(state.matches('authenticated') ? '/dashboard' : '/login');
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [intepret, navigate]);

  return (
    <AuthenticationContext.Provider value={[state, send]}>
      {state.matches('clean') ? null : p.children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationProvider;
