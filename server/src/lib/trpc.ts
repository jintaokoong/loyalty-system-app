import { initTRPC } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

type ContextReturn = {
  user: string | null;
};

const t = initTRPC
  .context<CreateFastifyContextOptions & ContextReturn>()
  .create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
