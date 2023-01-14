import { lazy, Suspense } from 'react';
import { type RouteObject } from 'react-router-dom';
import Dashboard from './routes/dashboard';
import Login from './routes/login';

const Index = lazy(() => import('@/routes/index'));
const Notfound = lazy(() => import('@/routes/404'));

export const routes: Array<RouteObject> = [
  {
    index: true,
    element: (
      <Suspense>
        <Index />
      </Suspense>
    ),
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
  {
    path: '*',
    element: (
      <Suspense>
        <Notfound />
      </Suspense>
    ),
  },
];

export default routes;
