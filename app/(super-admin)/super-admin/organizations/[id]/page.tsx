'use client';

import { trpc } from '@/lib/trpc/Provider';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LoadingSpinner,
  OrganizationInfo,
  AddUserForm,
  UserCard,
  ChangePasswordForm,
} from '@/components/super-admin';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const { data: organization, isLoading } = trpc.organization.getById.useQuery({
    id: organizationId,
  });
  const { data: users } = trpc.user.getByOrganization.useQuery({
    organizationId,
  });

  const utils = trpc.useUtils();

  // Состояния
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState<string | null>(null);
  const [userError, setUserError] = useState('');
  const [orgError, setOrgError] = useState('');

  // Мутации
  const updateOrgMutation = trpc.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.getById.invalidate({ id: organizationId });
      setOrgError('');
    },
    onError: (error) => {
      setOrgError(error.message);
    },
  });

  const createUserMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      utils.user.getByOrganization.invalidate({ organizationId });
      setShowAddUser(false);
      setUserError('');
    },
    onError: (error) => {
      setUserError(error.message);
    },
  });

  const updateUserMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.user.getByOrganization.invalidate({ organizationId });
      setEditingUser(null);
      setUserError('');
    },
    onError: (error) => {
      setUserError(error.message);
    },
  });

  const updatePasswordMutation = trpc.user.updatePassword.useMutation({
    onSuccess: () => {
      setChangingPassword(null);
      alert('Пароль успешно изменен');
    },
    onError: (error) => {
      alert('Ошибка: ' + error.message);
    },
  });

  const deleteUserMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      utils.user.getByOrganization.invalidate({ organizationId });
    },
  });

  // Обработчики
  const handleUpdateOrg = async (data: { name?: string; logo?: string }) => {
    setOrgError('');
    await updateOrgMutation.mutateAsync({ id: organizationId, ...data });
  };

  const handleAddUser = (data: {
    email: string;
    name: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'GUIDE';
  }) => {
    setUserError('');
    createUserMutation.mutate({
      ...data,
      organizationId,
    });
  };

  const handleUpdateUser = (data: {
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'GUIDE';
  }) => {
    if (!editingUser) return;
    setUserError('');
    updateUserMutation.mutate({
      id: editingUser,
      ...data,
    });
  };

  const handleChangePassword = (password: string) => {
    if (!changingPassword) return;
    updatePasswordMutation.mutate({
      id: changingPassword,
      password,
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Organization not found</p>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
      >
        ← Back to the list of organizations
      </button>

      <OrganizationInfo
        organization={organization}
        onUpdate={handleUpdateOrg}
        isUpdating={updateOrgMutation.isPending}
        error={orgError}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Organization users
          </h3>
          <button
            onClick={() => {
              setShowAddUser(!showAddUser);
              setUserError('');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {showAddUser ? 'Cancel' : 'Add user'}
          </button>
        </div>

        {showAddUser && (
          <AddUserForm
            onSubmit={handleAddUser}
            onCancel={() => {
              setShowAddUser(false);
              setUserError('');
            }}
            isSubmitting={createUserMutation.isPending}
            error={userError}
          />
        )}

        {!users || users.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            There are no users in this organization
          </p>
        ) : (
          <div className="space-y-4">
            {users.map((user: any) => (
              <div key={user.id}>
                {changingPassword === user.id ? (
                  <ChangePasswordForm
                    userName={user.name || user.email}
                    onSubmit={handleChangePassword}
                    onCancel={() => setChangingPassword(null)}
                    isSubmitting={updatePasswordMutation.isPending}
                  />
                ) : (
                  <UserCard
                    user={user}
                    isEditing={editingUser === user.id}
                    onEdit={() => {
                      setEditingUser(user.id);
                      setUserError('');
                    }}
                    onUpdate={handleUpdateUser}
                    onCancelEdit={() => {
                      setEditingUser(null);
                      setUserError('');
                    }}
                    onChangePassword={() => setChangingPassword(user.id)}
                    onDelete={() => handleDeleteUser(user.id)}
                    isUpdating={updateUserMutation.isPending}
                    error={editingUser === user.id ? userError : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
