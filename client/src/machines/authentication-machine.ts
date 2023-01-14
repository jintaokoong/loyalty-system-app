import { User } from 'firebase/auth';
import { createMachine } from 'xstate';

type AuthenticationContext = {
  user: User | null;
};

type AuthenticatedEvent = {
  type: 'AUTHENTICATED';
  user: User;
};

type UnauthenticatedEvent = {
  type: 'UNAUTHENTICATED';
};

type AuthenticationEvent = AuthenticatedEvent | UnauthenticatedEvent;

export default /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbIED2OAtALbKGb45gB0hANmMjgMQCqAcgEEeAFQASAUT7CAkgGEBw8QBEA2gAYAuolAAHUrHxkc2kAA9EARgBsAFgA0IAJ6IATAFYXTAOxuAvr4c0LFwCYiNqWnpGFnZOLiExSRl5RVVNEz0DIxNzBGt7J0QADi8mNSKAZirqmqr-QIxsPCISfHIIugZmIKbQkkheQREJKTkFZXUtJBBMwzbjady3CtKbFwsStwdnPIqXepAekJbwmk7oznJHKlJUWHjhpLHUyYz9OfIcxDc3AE4mNw2KybbbFCwA-wBEA4UgQOAmI7NMLzDpRMBvLLzL4IChWUE4qwHRF9U6RLoxDgLXTvbKLRBrfG-GxExrHZHtM5opiXHDXW7waazWmgXI+NRMCw2NRWdz4iwVPxQ4knFGc8nKsKQDEfKlmRArKzeDY+fElAGVWqWyG+IA */
createMachine({
  id: 'authentication-machine',

  tsTypes: {} as import('./authentication-machine.typegen').Typegen0,

  context: {
    user: null,
  },
  schema: {
    context: {} as AuthenticationContext,
    events: {} as AuthenticationEvent,
  },

  states: {
    clean: {
      on: {
        UNAUTHENTICATED: 'anonymous',
        AUTHENTICATED: 'authenticated',
      },
    },

    anonymous: {
      on: {
        AUTHENTICATED: 'authenticated',
      },
    },
    authenticated: {
      on: {
        UNAUTHENTICATED: 'anonymous',
      },
    },
  },

  initial: 'clean',
});
