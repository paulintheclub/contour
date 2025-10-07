'use client';

import { trpc } from '@/lib/trpc/Provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageUploadField } from '@/components/reusable/image-upload-field';

export function CreateOrganizationForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailHost, setEmailHost] = useState('imap.gmail.com');
  const [emailPort, setEmailPort] = useState(993);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [error, setError] = useState('');

  const createMutation = trpc.organization.create.useMutation({
    onSuccess: () => {
      router.push('/super-admin/organizations');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Название обязательно');
      return;
    }

    createMutation.mutate({ 
      name: name.trim(),
      logo: logo || undefined,
      emailUser: emailUser.trim() || undefined,
      emailPassword: emailPassword || undefined,
      emailHost: emailHost.trim() || undefined,
      emailPort: emailPort || undefined,
      emailEnabled,
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Создать организацию
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Введите название новой организации
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Название организации *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              disabled={createMutation.isPending}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="Например: Туристическое агентство"
            />
          </div>

          <ImageUploadField
            label="Логотип организации"
            value={logo}
            onChange={(value) => setLogo(value as string)}
            multiple={false}
            mandatory={false}
          />

          {/* Email настройки */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Email интеграция (опционально)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Настройте IMAP подключение для автоматической обработки бронирований из email
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="emailEnabled"
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  disabled={createMutation.isPending}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="emailEnabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Включить email интеграцию
                </label>
              </div>

              {emailEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-indigo-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email адрес
                    </label>
                    <input
                      type="email"
                      value={emailUser}
                      onChange={(e) => setEmailUser(e.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="bookings@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      App Password
                    </label>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="16-значный App Password"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Для Gmail: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Создать App Password</a>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        IMAP Host
                      </label>
                      <input
                        type="text"
                        value={emailHost}
                        onChange={(e) => setEmailHost(e.target.value)}
                        disabled={createMutation.isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        value={emailPort}
                        onChange={(e) => setEmailPort(parseInt(e.target.value) || 993)}
                        disabled={createMutation.isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
            >
              {createMutation.isPending ? 'Создание...' : 'Создать организацию'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
              className="sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

