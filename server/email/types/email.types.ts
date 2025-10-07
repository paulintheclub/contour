// Типы для работы с email

export interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
}

export interface ParsedEmail {
  messageId: string;
  from: string;
  to?: string;
  subject: string;
  text: string;
  html: string;
  date: Date;
  headers: any;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

