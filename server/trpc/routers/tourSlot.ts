import { router, protectedProcedure } from '../init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const tourSlotRouter = router({
  // Получить все слоты для тура
  getByTour: protectedProcedure
    .input(z.object({ tourId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.tourSlot.findMany({
        where: { tourId: input.tourId },
        include: {
          tour: {
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          },
          availableGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      });
    }),

  // Получить слоты по организации и дате
  getByOrganizationAndDate: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Проверка доступа
      if (
        !ctx.session.user.isSuperAdmin &&
        ctx.session.user.organizationId !== input.organizationId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
      }

      const whereClause: any = {
        tour: {
          organizationId: input.organizationId,
        },
      };

      // Фильтр по датам
      if (input.startDate || input.endDate) {
        whereClause.date = {};
        if (input.startDate) {
          whereClause.date.gte = input.startDate;
        }
        if (input.endDate) {
          whereClause.date.lte = input.endDate;
        }
      }

      return await ctx.prisma.tourSlot.findMany({
        where: whereClause,
        include: {
          tour: {
            select: {
              id: true,
              name: true,
              tourTag: true,
            },
          },
          availableGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      });
    }),

  // Получить слот по ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const slot = await ctx.prisma.tourSlot.findUnique({
        where: { id: input.id },
        include: {
          tour: {
            include: {
              organization: true,
            },
          },
          availableGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!slot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Слот не найден' });
      }

      // Проверка доступа
      if (
        !ctx.session.user.isSuperAdmin &&
        ctx.session.user.organizationId !== slot.tour.organizationId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
      }

      return slot;
    }),

  // Создать слот
  create: protectedProcedure
    .input(
      z.object({
        tourId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)'),
        time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени (HH:MM)'),
        language: z.string().min(1, 'Язык обязателен'),
        isPrivate: z.boolean().default(false),
        adults: z.number().int().min(0).default(0),
        childs: z.number().int().min(0).default(0),
        availableGuideIds: z.array(z.string()).optional(),
        assignedGuideIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем права доступа к туру
      const tour = await ctx.prisma.tour.findUnique({
        where: { id: input.tourId },
        select: { organizationId: true },
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
            message: 'Только администраторы и менеджеры могут создавать слоты',
          });
        }
      }

      const { availableGuideIds, assignedGuideIds, ...slotData } = input;

      return await ctx.prisma.tourSlot.create({
        data: {
          ...slotData,
          availableGuides: availableGuideIds
            ? { connect: availableGuideIds.map((id) => ({ id })) }
            : undefined,
          assignedGuides: assignedGuideIds
            ? { connect: assignedGuideIds.map((id) => ({ id })) }
            : undefined,
        },
        include: {
          tour: true,
          availableGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Обновить слот
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты').optional(),
        time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени').optional(),
        language: z.string().min(1).optional(),
        isPrivate: z.boolean().optional(),
        adults: z.number().int().min(0).optional(),
        childs: z.number().int().min(0).optional(),
        availableGuideIds: z.array(z.string()).optional(),
        assignedGuideIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slot = await ctx.prisma.tourSlot.findUnique({
        where: { id: input.id },
        include: {
          tour: {
            select: { organizationId: true },
          },
        },
      });

      if (!slot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Слот не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (ctx.session.user.organizationId !== slot.tour.organizationId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }

        const { availableGuideIds, assignedGuideIds, ...otherFields } = input;
        const isOnlyAvailabilityChange = 
          availableGuideIds !== undefined && 
          Object.keys(otherFields).length === 1; // только id

        // Гиды могут менять только свою доступность
        if (ctx.session.user.role === 'GUIDE') {
          if (!isOnlyAvailabilityChange) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Гиды могут изменять только свою доступность',
            });
          }
        } else if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'MANAGER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Только администраторы и менеджеры могут редактировать слоты',
          });
        }
      }

      const { id, availableGuideIds, assignedGuideIds, ...updateData } = input;

      return await ctx.prisma.tourSlot.update({
        where: { id },
        data: {
          ...updateData,
          availableGuides: availableGuideIds
            ? { set: availableGuideIds.map((id) => ({ id })) }
            : undefined,
          assignedGuides: assignedGuideIds
            ? { set: assignedGuideIds.map((id) => ({ id })) }
            : undefined,
        },
        include: {
          tour: true,
          availableGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedGuides: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Удалить слот
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const slot = await ctx.prisma.tourSlot.findUnique({
        where: { id: input.id },
        include: {
          tour: {
            select: { organizationId: true },
          },
        },
      });

      if (!slot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Слот не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (ctx.session.user.organizationId !== slot.tour.organizationId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
        if (ctx.session.user.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Только администраторы могут удалять слоты',
          });
        }
      }

      return await ctx.prisma.tourSlot.delete({
        where: { id: input.id },
      });
    }),
});

