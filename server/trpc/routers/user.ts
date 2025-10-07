import { router, superAdminProcedure, protectedProcedure, orgAdminProcedure } from '../init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/app/generated/prisma';

export const userRouter = router({
  // Получить текущего пользователя
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        organization: true,
      },
    });
  }),

  // Получить всех пользователей организации (с фильтрацией по роли)
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

      // Определяем фильтр в зависимости от роли пользователя
      let roleFilter: any = {};
      
      if (!ctx.session.user.isSuperAdmin) {
        const userRole = ctx.session.user.role;
        
        if (userRole === 'ADMIN') {
          // Админ видит всех
          roleFilter = {};
        } else if (userRole === 'MANAGER') {
          // Менеджер видит только менеджеров и гидов (не видит админов)
          roleFilter = {
            role: {
              in: ['MANAGER', 'GUIDE'],
            },
          };
        } else if (userRole === 'GUIDE') {
          // Гид видит только гидов
          roleFilter = {
            role: 'GUIDE',
          };
        }
      }

      return await ctx.prisma.user.findMany({
        where: { 
          organizationId: input.organizationId,
          ...roleFilter,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  // Создать пользователя в организации (суперадмин или админ организации)
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Неверный формат email'),
        name: z.string().min(1, 'Имя обязательно'),
        password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
        organizationId: z.string(),
        role: z.enum(['ADMIN', 'MANAGER', 'GUIDE']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        // Если не суперадмин, проверяем, что это админ организации
        if (
          ctx.session.user.organizationId !== input.organizationId ||
          ctx.session.user.role !== 'ADMIN'
        ) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
      }

      // Проверка, что организация существует
      const org = await ctx.prisma.organization.findUnique({
        where: { id: input.organizationId },
      });

      if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Организация не найдена' });
      }

      // Проверка, что пользователь с таким email не существует
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Пользователь с таким email уже существует',
        });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(input.password, 10);

      return await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
          organizationId: input.organizationId,
          role: input.role as UserRole,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
        },
      });
    }),

  // Обновить пользователя
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(['ADMIN', 'MANAGER', 'GUIDE']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Пользователь не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (
          user.organizationId !== ctx.session.user.organizationId ||
          ctx.session.user.role !== 'ADMIN'
        ) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
      }

      // Проверка уникальности email при изменении
      if (input.email && input.email !== user.email) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Пользователь с таким email уже существует',
          });
        }
      }

      const { id, ...data } = input;

      return await ctx.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    }),

  // Изменить пароль пользователя
  updatePassword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Пользователь не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (
          user.organizationId !== ctx.session.user.organizationId ||
          ctx.session.user.role !== 'ADMIN'
        ) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(input.password, 10);

      await ctx.prisma.user.update({
        where: { id: input.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  // Удалить пользователя
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Пользователь не найден' });
      }

      // Проверка доступа
      if (!ctx.session.user.isSuperAdmin) {
        if (
          user.organizationId !== ctx.session.user.organizationId ||
          ctx.session.user.role !== 'ADMIN'
        ) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
        }
      }

      // Нельзя удалить себя
      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Нельзя удалить свой аккаунт',
        });
      }

      return await ctx.prisma.user.delete({
        where: { id: input.id },
      });
    }),
});

