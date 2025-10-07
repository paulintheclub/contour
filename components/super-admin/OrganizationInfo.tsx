'use client';

import { useState } from 'react';
import { ImageUploadField } from '@/components/reusable/image-upload-field';
import Image from 'next/image';

interface OrganizationInfoProps {
  organization: {
    id: string;
    name: string;
    logo?: string | null;
    emailUser?: string | null;
    emailPassword?: string | null;
    emailPasswordDecrypted?: string; // Расшифрованный пароль для редактирования
    emailHost?: string | null;
    emailPort?: number | null;
    emailEnabled?: boolean;
  };
  onUpdate: (data: { 
    name?: string; 
    logo?: string;
    emailUser?: string | null;
    emailPassword?: string | null;
    emailHost?: string | null;
    emailPort?: number | null;
    emailEnabled?: boolean;
  }) => Promise<void>;
  isUpdating: boolean;
  error?: string;
}

export function OrganizationInfo({ organization, onUpdate, isUpdating, error }: OrganizationInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(organization.name);
  const [logo, setLogo] = useState(organization.logo || '');
  const [emailUser, setEmailUser] = useState(organization.emailUser || '');
  const [emailPassword, setEmailPassword] = useState(organization.emailPasswordDecrypted || '');
  const [emailHost, setEmailHost] = useState(organization.emailHost || 'imap.gmail.com');
  const [emailPort, setEmailPort] = useState(organization.emailPort || 993);
  const [emailEnabled, setEmailEnabled] = useState(organization.emailEnabled || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onUpdate({ 
      name: name.trim(),
      logo: logo || undefined,
      emailUser: emailUser.trim() || null,
      emailPassword: emailPassword || null,
      emailHost: emailHost.trim() || null,
      emailPort: emailPort || null,
      emailEnabled,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(organization.name);
    setLogo(organization.logo || '');
    setEmailUser(organization.emailUser || '');
    setEmailPassword(organization.emailPasswordDecrypted || '');
    setEmailHost(organization.emailHost || 'imap.gmail.com');
    setEmailPort(organization.emailPort || 993);
    setEmailEnabled(organization.emailEnabled || false);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Information about the organization
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name of the organization
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isUpdating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          
          <ImageUploadField
            label="Organization logo"
            value={logo}
            onChange={(value) => setLogo(value as string)}
            multiple={false}
            mandatory={false}
          />

          {/* Email настройки */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Email integration
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="emailEnabledEdit"
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  disabled={isUpdating}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="emailEnabledEdit" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Enable email integration
                </label>
              </div>

              {emailEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-indigo-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={emailUser}
                      onChange={(e) => setEmailUser(e.target.value)}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      disabled={isUpdating}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Оставьте пустым, чтобы не менять"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      For Gmail: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Create App Password</a>
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
                        disabled={isUpdating}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                        disabled={isUpdating}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {organization.logo && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Logo</p>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={organization.logo}
                  alt={organization.name}
                  fill
                  className="object-contain p-2"
                  sizes="128px"
                />
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
            <p className="text-gray-900 dark:text-white font-medium text-lg">
              {organization.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">ID</p>
            <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
              {organization.id}
            </p>
          </div>

          {/* Email информация */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Email integration
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {organization.emailEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ✓ Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Disabled
                    </span>
                  )}
                </p>
              </div>
              
              {organization.emailEnabled && organization.emailUser && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {organization.emailUser}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">IMAP Server</p>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {organization.emailHost}:{organization.emailPort}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

