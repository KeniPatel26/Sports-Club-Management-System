import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  ShieldAlert,
  UserCheck,
  Edit2,
  Trash2,
  Mail,
  Lock,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import FilterDropdown from '../components/ui/FilterDropdown';
import userService from '../services/userService';
import { formatDate } from '../utils/formatDate';
import { USER_ROLES } from '../utils/constants';

export const UsersManagement = () => {
  const { user: currentUser } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    title: 'Member',
  });

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({
        role: selectedRole !== 'all' ? selectedRole : undefined,
      });
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      // Fallback demo users
      setUsers([
        {
          _id: 'u1',
          name: 'Admin User',
          emailId: 'admin@demo.com',
          role: 'admin',
          title: 'System Administrator & CTO',
          createdAt: new Date(),
        },
        {
          _id: 'u2',
          name: 'Alex Morgan',
          emailId: 'user@demo.com',
          role: 'user',
          title: 'Senior Fullstack Engineer',
          createdAt: new Date(),
        },
        {
          _id: 'u3',
          name: 'Sarah Chen',
          emailId: 'sarah.chen@demo.com',
          role: 'manager',
          title: 'Lead Product Manager',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      title: 'Product Specialist',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (u, e) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setCurrentId(u._id);
    setFormData({
      name: u.name || '',
      email: u.emailId || u.email || '',
      password: '',
      role: u.role || 'user',
      title: u.title || 'Member',
    });
    setModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (isEditing && currentId) {
        await userService.updateUser(currentId, {
          name: formData.name,
          role: formData.role,
          title: formData.title,
        });
        toastSuccess('User updated successfully');
      } else {
        await userService.createUser({
          name: formData.name,
          email: formData.email,
          emailId: formData.email,
          password: formData.password || 'User@123',
          role: formData.role,
          title: formData.title,
        });
        toastSuccess('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await userService.deleteUser(deleteId);
      toastSuccess('User removed successfully');
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'User',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${val || 'User'}`}
            alt={val}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{val}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.title || 'Member'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      key: 'emailId',
      sortable: true,
      render: (val, row) => <span>{val || row.email}</span>,
    },
    {
      header: 'Role',
      key: 'role',
      sortable: true,
      render: (val) => {
        const variant = val === 'admin' ? 'purple' : val === 'manager' ? 'info' : 'secondary';
        return (
          <Badge variant={variant} dot>
            {val}
          </Badge>
        );
      },
    },
    {
      header: 'Joined',
      key: 'createdAt',
      sortable: true,
      render: (val) => <span>{formatDate(val)}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            title="Edit User"
            onClick={(e) => handleOpenEdit(row, e)}
            style={{
              padding: '0.35rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <Edit2 size={15} />
          </button>
          {row._id !== currentUser?._id && (
            <button
              type="button"
              title="Delete User"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(row._id);
                setDeleteDialogOpen(true);
              }}
              style={{
                padding: '0.35rem',
                background: 'var(--danger-light)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger-text)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Team & User Management"
        subtitle="Admin controls for role assignment, account creation, and user permissions."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Users' }]}
        action={
          <Button variant="primary" icon={UserPlus} onClick={handleOpenCreate}>
            Add Member
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by name, email, role..."
        filterComponent={
          <FilterDropdown label="Role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} options={USER_ROLES} />
        }
      />

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Team Member' : 'Add New Member'}
        subtitle="Configure role and access permissions for this account."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveUser} loading={actionLoading}>
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveUser}>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Alex Morgan"
            required
          />

          {!isEditing && (
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. alex@demo.com"
              required
            />
          )}

          <div className="grid-cols-2">
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'user', label: 'Team Member' },
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
              ]}
              placeholder=""
            />

            <Input
              label="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Frontend Dev"
            />
          </div>

          {!isEditing && (
            <Input
              label="Initial Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Default: User@123"
            />
          )}
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Member?"
        message="Are you sure you want to remove this user from the system? Their assigned tasks will remain archived."
        confirmText="Remove User"
        danger
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default UsersManagement;
