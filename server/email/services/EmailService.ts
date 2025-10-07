import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { EmailConfig, ParsedEmail } from '../types/email.types';

export class EmailService {
  private imap: Imap;
  private isConnected: boolean = false;

  constructor(config: EmailConfig) {
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: config.tlsOptions || { rejectUnauthorized: false },
    });

    // Обработка событий
    this.imap.once('ready', () => {
      console.log('✅ IMAP подключение установлено');
      this.isConnected = true;
    });

    this.imap.once('error', (err: Error) => {
      console.error('❌ IMAP ошибка:', err.message);
      this.isConnected = false;
    });

    this.imap.once('end', () => {
      console.log('🔌 IMAP подключение закрыто');
      this.isConnected = false;
    });
  }

  /**
   * Подключиться к IMAP серверу
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.imap.once('ready', () => resolve());
      this.imap.once('error', (err: Error) => reject(err));
      this.imap.connect();
    });
  }

  /**
   * Отключиться от IMAP сервера
   */
  disconnect(): void {
    if (this.isConnected) {
      this.imap.end();
    }
  }

  /**
   * Открыть почтовый ящик (по умолчанию INBOX)
   */
  private async openMailbox(boxName: string = 'INBOX'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(boxName, false, (err, box) => {
        if (err) {
          reject(err);
        } else {
          console.log(`📬 Открыт ящик: ${boxName} (${box.messages.total} писем)`);
          resolve();
        }
      });
    });
  }

  /**
   * Получить непрочитанные письма
   */
  async fetchUnreadEmails(limit: number = 10): Promise<ParsedEmail[]> {
    try {
      await this.connect();
      await this.openMailbox();

      return new Promise((resolve, reject) => {
        const emails: ParsedEmail[] = [];

        // Поиск непрочитанных писем
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log('📭 Нет непрочитанных писем');
            resolve([]);
            return;
          }

          console.log(`📨 Найдено непрочитанных писем: ${results.length}`);

          // Ограничиваем количество
          const limitedResults = results.slice(0, limit);

          const fetch = this.imap.fetch(limitedResults, {
            bodies: '',
            struct: true,
          });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Ошибка парсинга письма:', err);
                  return;
                }

                const email = this.convertToParseEmail(parsed);
                emails.push(email);
              });
            });
          });

          fetch.once('error', (err) => {
            reject(err);
          });

          fetch.once('end', () => {
            console.log(`✅ Обработано писем: ${emails.length}`);
            resolve(emails);
          });
        });
      });
    } catch (error) {
      console.error('Ошибка при получении писем:', error);
      throw error;
    }
  }

  /**
   * Пометить письмо как прочитанное
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.openMailbox();

      return new Promise((resolve, reject) => {
        // Поиск по Message-ID
        this.imap.search([['HEADER', 'MESSAGE-ID', messageId]], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log(`⚠️ Письмо с ID ${messageId} не найдено`);
            resolve();
            return;
          }

          // Пометить как прочитанное
          this.imap.addFlags(results, ['\\Seen'], (flagErr) => {
            if (flagErr) {
              reject(flagErr);
            } else {
              console.log(`✅ Письмо ${messageId} помечено как прочитанное`);
              resolve();
            }
          });
        });
      });
    } catch (error) {
      console.error('Ошибка при пометке письма:', error);
      throw error;
    }
  }

  /**
   * Получить все письма за период (для тестирования)
   */
  async fetchAllEmails(limit: number = 5): Promise<ParsedEmail[]> {
    try {
      await this.connect();
      await this.openMailbox();

      return new Promise((resolve, reject) => {
        const emails: ParsedEmail[] = [];

        // Получить последние N писем
        this.imap.search(['ALL'], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log('📭 Нет писем');
            resolve([]);
            return;
          }

          console.log(`📨 Всего писем: ${results.length}`);

          // Берем последние N писем
          const limitedResults = results.slice(-limit);

          const fetch = this.imap.fetch(limitedResults, {
            bodies: '',
            struct: true,
          });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Ошибка парсинга письма:', err);
                  return;
                }

                const email = this.convertToParseEmail(parsed);
                emails.push(email);
              });
            });
          });

          fetch.once('error', (err) => {
            reject(err);
          });

          fetch.once('end', () => {
            console.log(`✅ Обработано писем: ${emails.length}`);
            resolve(emails);
          });
        });
      });
    } catch (error) {
      console.error('Ошибка при получении писем:', error);
      throw error;
    }
  }

  /**
   * Конвертация ParsedMail в наш формат
   */
  private convertToParseEmail(parsed: ParsedMail): ParsedEmail {
    return {
      messageId: parsed.messageId || '',
      from: parsed.from?.text || '',
      to: parsed.to?.text,
      subject: parsed.subject || '',
      text: parsed.text || '',
      html: parsed.html || '',
      date: parsed.date || new Date(),
      headers: parsed.headers,
    };
  }

  /**
   * Тест подключения
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.openMailbox();
      this.disconnect();
      return true;
    } catch (error) {
      console.error('Ошибка тестирования:', error);
      return false;
    }
  }
}

