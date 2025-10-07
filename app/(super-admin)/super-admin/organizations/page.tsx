'use client';

import { trpc } from '@/lib/trpc/Provider';
import { useState } from 'react';
import {
  PageHeader,
  OrganizationCard,
  EmptyState,
  LoadingSpinner,
} from '@/components/super-admin';

export default function OrganizationsPage() {
  const utils = trpc.useUtils();
  const { data: organizations, isLoading } = trpc.organization.getAll.useQuery();
  const deleteMutation = trpc.organization.delete.useMutation({
    onSuccess: () => {
      utils.organization.getAll.invalidate();
    },
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      setDeleteConfirm(null);
    } catch (error) {
      alert('Ошибка при удалении организации');
    }
  };

  return (
    <div>
      <PageHeader
        title="Организации"
        description="Управление всеми организациями платформы"
        action={{
          label: 'Создать организацию',
          href: '/super-admin/organizations/create',
        }}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : organizations?.length === 0 ? (
        <EmptyState
          title="Нет созданных организаций"
          actionLabel="Создать первую организацию"
          actionHref="/super-admin/organizations/create"
        />
      ) : (
        <div className="grid gap-6">
          {organizations?.map((org: any) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onDelete={handleDelete}
              isDeleteConfirm={deleteConfirm === org.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
