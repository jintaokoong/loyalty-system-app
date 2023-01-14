import dotenv from 'dotenv';
import env from 'env-var';

import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

export const firebase = initializeApp({
  credential: credential.cert({
    clientEmail: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),
    privateKey: env.get('FIREBASE_PRIVATE_KEY').required().asString(),
    projectId: env.get('FIREBASE_PROJECT_ID').required().asString(),
  }),
});

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

import cors from '@fastify/cors';
import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from '@trpc/server/adapters/fastify';
import fastify from 'fastify';

type ContextReturn = {
  user: string | null;
};

const auth = getAuth(firebase);

const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  console.log('invoked createContext');
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return { req, res, user: null };
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return { req, res, user: null };
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return {
      req,
      res,
      user: decoded.sub,
    };
  } catch (error) {
    console.error(error);
    return {
      req,
      res,
      user: null,
    };
  }
};

const t = initTRPC
  .context<CreateFastifyContextOptions & ContextReturn>()
  .create();

const router = t.router;
const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return next({
    ctx: ctx,
  });
});

const privateProcedure = t.procedure.use(isAuthenticated);

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
