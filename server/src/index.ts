import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import cors from '@fastify/cors';
import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from '@trpc/server/adapters/fastify';
import { getFastifyPlugin } from 'trpc-playground/handlers/fastify';
import fastify from 'fastify';
import { mergeRouters, middleware, publicProcedure, router } from './lib/trpc';
import { assoc } from 'ramda';
import { firebaseAuth } from './lib/firebase';
import routers from './routers';

const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  const base = {
    req,
    res,
  };
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return assoc('user', null, base);
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return assoc('user', null, base);
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    return assoc('user', decoded.sub, base);
  } catch (error) {
    console.error(error);
    return assoc('user', null, base);
  }
};

const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return next({
    ctx: ctx,
  });
});

const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  try {
    const user = await firebaseAuth.getUser(ctx.user);
    if (!user.customClaims || user.customClaims.role !== 'admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }
    return next({
      ctx: ctx,
    });
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
});

export const privateProcedure = publicProcedure.use(isAuthenticated);
export const adminProcedure = publicProcedure.use(isAdmin);

const appRouter = router({
  greet: publicProcedure.input(z.string()).query((req) => {
    console.log(req.ctx.user);
    return {
      message: `Hello ${req.input}`,
    };
  }),
  guarded: privateProcedure.query(() => {
    return {
      message: 'You are authenticated',
    };
  }),
  admin: adminProcedure.query(() => {
    return {
      message: 'You are an admin',
    };
  }),
});

const mergedRouter = mergeRouters(appRouter, routers);

const API_ENDPOINT = '/trpc';
const PLAYGROUND_ENDPOINT = '/playground';

(async () => {
  const server = fastify({
    maxParamLength: 5000,
  });

  server.register(cors);
  server.register(fastifyTRPCPlugin, {
    prefix: API_ENDPOINT,
    trpcOptions: { router: mergedRouter, createContext },
  });
  const plugin = await getFastifyPlugin({
    playgroundEndpoint: PLAYGROUND_ENDPOINT,
    router: mergedRouter,
    trpcApiEndpoint: API_ENDPOINT,
  });
  server.register(plugin, {
    prefix: PLAYGROUND_ENDPOINT,
  });
  try {
    const address = await server.listen({
      port: 5000,
    });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();

export type AppRouter = typeof appRouter;
