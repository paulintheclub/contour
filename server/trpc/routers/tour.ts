import { router, protectedProcedure } from '../init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const tourRouter = router({
  // Получить все туры организации
  getByOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Проверка доступа
      if (
        !ctx.session.user.isSuperAdmin &&
        ctx.session.user.organizationId !== input.organizationId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
      }

      return await ctx.prisma.tour.findMany({
        where: { organizationId: input.organizationId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Получить тур по ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tour = await ctx.prisma.tour.findUnique({
        where: { id: input.id },
        include: { organization: true },
      });

      if (!tour) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Тур не найден' });
      }

      // Проверка доступа
      if (
        !ctx.session.user.isSuperAdmin &&
        ctx.session.user.organizationId !== tour.organizationId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
      }

      return tour;
    }),

  // Создать тур
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Название обязательно'),
        tourTag: z.string().min(1, 'Тег обязателен'),
        capacity: z.number().int().positive('Вместимость должна быть положительным числом'),
        listNames: z.array(z.string()).min(1, 'Нужен хотя бы один список'),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверка доступа - только администраторы и менеджеры организации
      if (!ctx.session.user.isSuperAdmin) {
        if (ctx.session.user.organizationId !== input.organizationId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
        if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'MANAGER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Только администраторы и менеджеры могут создавать туры',
          });
        }
      }

      return await ctx.prisma.tour.create({
        data: {
          name: input.name,
          tourTag: input.tourTag,
          capacity: input.capacity,
          listNames: input.listNames,
          organizationId: input.organizationId,
        },
      });
    }),

  // Обновить тур
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Название обязательно').optional(),
        tourTag: z.string().min(1, 'Тег обязателен').optional(),
        capacity: z.number().int().positive('Вместимость должна быть положительным числом').optional(),
        listNames: z.array(z.string()).min(1, 'Нужен хотя бы один список').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tour = await ctx.prisma.tour.findUnique({
        where: { id: input.id },
      });

      if (!tour) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Тур не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (ctx.session.user.organizationId !== tour.organizationId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
        if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'MANAGER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Только администраторы и менеджеры могут редактировать туры',
          });
        }
      }

      const { id, ...data } = input;

      return await ctx.prisma.tour.update({
        where: { id },
        data,
      });
    }),

  // Удалить тур
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tour = await ctx.prisma.tour.findUnique({
        where: { id: input.id },
      });

      if (!tour) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Тур не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (ctx.session.user.organizationId !== tour.organizationId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
        if (ctx.session.user.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Только администраторы могут удалять туры',
          });
        }
      }

      return await ctx.prisma.tour.delete({
        where: { id: input.id },
      });
    }),
});

