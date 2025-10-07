import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Защищенная процедура (требует авторизации)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Необходима авторизация' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Процедура только для суперадминистраторов
export const superAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session.user.isSuperAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
  }
  return next({ ctx });
});

// Процедура для администраторов организации
export const orgAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session.user.organizationId || ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
  }
  return next({ ctx });
});

