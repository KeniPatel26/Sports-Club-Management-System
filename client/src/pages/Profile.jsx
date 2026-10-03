import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Shield,
  Lock,
  Camera,
  Save,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import authService from '../services/authService';
import uploadService from '../services/uploadService';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        updateUser(res.data);
        toastSuccess('Profile updated successfully!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toastSuccess('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarFile = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingAvatar(true);
        const res = await uploadService.uploadAvatar(file);
        if (res.success && res.data?.url) {
          setProfileData((prev) => ({ ...prev, avatar: res.data.url }));
          await authService.updateProfile({ avatar: res.data.url });
          updateUser({ avatar: res.data.url });
          toastSuccess('Avatar uploaded and saved!');
        }
      } catch (err) {
        toastError('Failed to upload avatar');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="User Profile & Settings"
        subtitle="Manage your personal details, job title, and security credentials."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      <div className="grid-cols-3">
        {/* Left Avatar & Quick Info Card */}
        <div>
          <Card>
            <Card.Content style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                <img
                  src={
                    profileData.avatar ||
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`
                  }
                  alt={user?.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                  }}
                />
                <label
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
                </label>
              </div>

              <h3 style={{ margin: 0, fontWeight: 800 }}>{user?.name}</h3>
              <p style={{ margin: '0.2rem 0 0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {user?.emailId || user?.email}
              </p>

              <Badge variant={user?.role === 'admin' ? 'purple' : 'primary'} dot>
                {user?.role?.toUpperCase()}
              </Badge>

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  <strong>Title:</strong> {user?.title || 'Member'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Bio:</strong> {user?.bio || 'Full-stack developer building on MERN.'}
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Settings & Forms (2 cols) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Edit Profile Details */}
          <Card>
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
              <Card.Description>Update your display name, role title, and bio description</Card.Description>
            </Card.Header>

            <Card.Content>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid-cols-2">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Role / Title"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    placeholder="e.g. Lead Backend Engineer"
                  />
                </div>

                <Textarea
                  label="Biography"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="A short description about yourself..."
                  rows={3}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button type="submit" variant="primary" icon={Save} loading={savingProfile}>
                    Save Profile
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header>
              <Card.Title>Security & Password</Card.Title>
              <Card.Description>Ensure your account is using a secure password</Card.Description>
            </Card.Header>

            <Card.Content>
              <form onSubmit={handleChangePassword}>
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />

                <div className="grid-cols-2">
                  <Input
                    label="New Password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button type="submit" variant="primary" icon={Lock} loading={savingPassword}>
                    Update Password
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
