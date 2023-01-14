import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import cors from '@fastify/cors';

const createContext = ({ req, res }: CreateFastifyContextOptions) => {
  console.log('invoked createContext');
  return {
    req,
    res,
    user: {
      id: '1',
      name: 'John Doe',
    },
  };
};

const t = initTRPC
  .context<
    CreateFastifyContextOptions & {
      user: {
        id: string;
        name: string;
      };
    }
  >()
  .create();

const router = t.router;
const publicProcedure = t.procedure;

const appRouter = router({
  greet: publicProcedure.input(z.string()).query((req) => {
    console.log(req.ctx.user);
    return {
      message: `Hello ${req.input}`,
    };
  }),
});

const server = fastify({
  maxParamLength: 5000,
});

server.register(cors);
server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

(async () => {
  try {
    await server.listen({
      port: 5000,
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();

export type AppRouter = typeof appRouter;
