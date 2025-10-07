import { UserRole } from '@/app/generated/prisma';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isSuperAdmin: boolean;
      organizationId?: string | null;
      role?: UserRole | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    isSuperAdmin: boolean;
    organizationId?: string | null;
    role?: UserRole | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isSuperAdmin: boolean;
    organizationId?: string | null;
    role?: UserRole | null;
  }
}

