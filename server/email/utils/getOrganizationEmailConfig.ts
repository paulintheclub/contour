import { prisma } from '@/lib/prisma';
import { decryptPassword } from './encryption';
import { EmailConfig } from '../types/email.types';

/**
 * Получить email конфигурацию организации из БД
 */
export async function getOrganizationEmailConfig(
  organizationId: string
): Promise<EmailConfig | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      emailUser: true,
      emailPassword: true,
      emailHost: true,
      emailPort: true,
      emailEnabled: true,
    },
  });

  if (!org || !org.emailEnabled || !org.emailUser || !org.emailPassword) {
    return null;
  }

  // Расшифровываем пароль
  const decryptedPassword = decryptPassword(org.emailPassword);

  if (!decryptedPassword) {
    console.error(`Failed to decrypt email password for organization ${organizationId}`);
    return null;
  }

  return {
    user: org.emailUser,
    password: decryptedPassword,
    host: org.emailHost || 'imap.gmail.com',
    port: org.emailPort || 993,
    tls: true,
  };
}

