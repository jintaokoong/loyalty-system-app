import prisma from '../lib/prisma';
import { TRPCError } from '@trpc/server';
import { firebaseAuth } from '../lib/firebase';
import { publicProcedure, router } from '../lib/trpc';
import { z } from 'zod';

const publicRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(0),
      }),
    )
    .mutation(async (req) => {
      const { email, password } = req.input;
      const level = await prisma.membershipLevel.findFirst({
        orderBy: {
          priority: 'asc',
        },
      });
      if (!level) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Server not configured properly, membership levels missing',
        });
      }
      const user = await firebaseAuth.createUser({
        email: email,
        password: password,
      });
      try {
        const created = await prisma.user.create({
          data: {
            email: email,
            fid: user.uid,
            membershipLevelId: level.id,
          },
        });
        return created;
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          await firebaseAuth.deleteUser(user.uid); // rollback
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),
});

export default publicRouter;
