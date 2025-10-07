import { router, superAdminProcedure, protectedProcedure } from '../init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { encryptPassword, decryptPassword } from '../../email/utils/encryption';

export const organizationRouter = router({
  // Получить все организации (только суперадмин)
  getAll: superAdminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.organization.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            users: true,
            tours: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  // Получить организацию по ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.prisma.organization.findUnique({
        where: { id: input.id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

      if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Организация не найдена' });
      }

      // Проверка доступа: суперадмин или пользователь этой организации
      if (
        !ctx.session.user.isSuperAdmin &&
        ctx.session.user.organizationId !== org.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещен' });
      }

      // Расшифровываем пароль только для суперадмина
      const orgData = { ...org };
      if (ctx.session.user.isSuperAdmin && org.emailPassword) {
        (orgData as any).emailPasswordDecrypted = decryptPassword(org.emailPassword);
      }

      return orgData;
    }),

  // Создать организацию (только суперадмин)
  create: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Название обязательно'),
        logo: z.string().optional(),
        emailUser: z.string().email('Неверный формат email').optional(),
        emailPassword: z.string().optional(),
        emailHost: z.string().optional(),
        emailPort: z.number().int().positive().optional(),
        emailEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { emailPassword, ...restInput } = input;
      
      // Шифруем пароль, если он предоставлен
      const encryptedPassword = emailPassword ? encryptPassword(emailPassword) : undefined;

      return await ctx.prisma.organization.create({
        data: {
          name: restInput.name,
          logo: restInput.logo,
          emailUser: restInput.emailUser,
          emailPassword: encryptedPassword,
          emailHost: restInput.emailHost || 'imap.gmail.com',
          emailPort: restInput.emailPort || 993,
          emailEnabled: restInput.emailEnabled || false,
        },
      });
    }),

  // Обновить организацию (только суперадмин)
  update: superAdminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Название обязательно').optional(),
        logo: z.string().optional(),
        emailUser: z.string().email('Неверный формат email').optional().nullable(),
        emailPassword: z.string().optional().nullable(),
        emailHost: z.string().optional().nullable(),
        emailPort: z.number().int().positive().optional().nullable(),
        emailEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, emailPassword, ...restInput } = input;

      // Подготовка данных для обновления
      const updateData: any = { ...restInput };

      // Шифруем пароль, если он предоставлен и не пустой
      if (emailPassword !== undefined) {
        if (emailPassword === null || emailPassword === '') {
          updateData.emailPassword = null;
        } else {
          updateData.emailPassword = encryptPassword(emailPassword);
        }
      }

      return await ctx.prisma.organization.update({
        where: { id },
        data: updateData,
      });
    }),

  // Удалить организацию (только суперадмин)
  delete: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.organization.delete({
        where: { id: input.id },
      });
    }),
});

