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
      alert('Error when deleting an organization');
    }
  };

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Management of all organizations on the platform"
        action={{
          label: 'Create an organization',
          href: '/super-admin/organizations/create',
        }}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : organizations?.length === 0 ? (
        <EmptyState
          title="No organizations created"
          actionLabel="Create your first organization"
          actionHref="/super-admin/organizations/create"
        />
      ) : (
        <div className="grid gap-6">
          {organizations?.map((org) => (
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
