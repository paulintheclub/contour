'use client';

import { trpc } from '@/lib/trpc/Provider';
import Link from 'next/link';
import { StatCard } from '@/components/super-admin';

export default function SuperAdminPage() {
  const { data: organizations, isLoading } = trpc.organization.getAll.useQuery();

  const totalUsers = organizations?.reduce((acc: number, org) => acc + org._count.users, 0) || 0;
  const totalTours = organizations?.reduce((acc: number, org) => acc + org._count.tours, 0) || 0;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Super administrator panel
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Management of organizations and users of the platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total number of organizations"
          value={organizations?.length || 0}
          color="indigo"
          isLoading={isLoading}
        />
        <StatCard
          title="Total users"
          value={totalUsers}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Total tours"
          value={totalTours}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quick actions
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/super-admin/organizations/create"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-center"
          >
            Create a new organization
          </Link>
          <Link
            href="/super-admin/organizations"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors text-center"
          >
            Management of organizations
          </Link>
        </div>
      </div>
    </div>
  );
}
