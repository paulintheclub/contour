import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth';
import { prisma } from '@/lib/prisma';

export async function createContext() {
  const session = await getServerSession(authOptions);

  return {
    session,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

