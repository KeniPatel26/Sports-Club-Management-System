import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Save,
  Crown,
  Calendar,
  ShoppingBag,
  Coffee,
  Award,
  ArrowRight,
  Activity,
  HeartPulse,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import authService from '../services/authService';
import uploadService from '../services/uploadService';
import membershipService from '../services/membershipService';
import courtBookingService from '../services/courtBookingService';
import shopCanteenService from '../services/shopCanteenService';

const money = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [membership, setMembership] = useState(null);
  const [pastMemberships, setPastMemberships] = useState([]);
  const [stats, setStats] = useState({
    bookings: 0,
    shopOrders: 0,
    canteenOrders: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredSport: user?.preferredSport || 'Tennis',
    bio: user?.bio || '',
    emergencyContact: user?.emergencyContact || '',
    avatar: user?.avatar || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        preferredSport: user.preferredSport || 'Tennis',
        bio: user.bio || '',
        emergencyContact: user.emergencyContact || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoadingData(true);
        const [memRes, bookingsRes, shopRes, canteenRes] = await Promise.allSettled([
          membershipService.getMyMembership(),
          courtBookingService.getBookings(),
          shopCanteenService.getOrders({ type: 'sports' }),
          shopCanteenService.getOrders({ type: 'canteen' }),
        ]);

        if (memRes.status === 'fulfilled' && memRes.value.success) {
          setMembership(memRes.value.data?.membership || null);
          setPastMemberships(memRes.value.data?.pastMemberships || []);
        }

        const bookingList = bookingsRes.status === 'fulfilled' && bookingsRes.value.success ? bookingsRes.value.data : [];
        const shopList = shopRes.status === 'fulfilled' && shopRes.value.success ? shopRes.value.data : [];
        const canteenList = canteenRes.status === 'fulfilled' && canteenRes.value.success ? canteenRes.value.data : [];

        setStats({
          bookings: bookingList.length || 0,
          shopOrders: shopList.length || 0,
          canteenOrders: canteenList.length || 0,
        });
      } catch (err) {
        console.error('Error fetching member profile stats:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        updateUser(res.data);
        toastSuccess('Profile information updated successfully!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toastError('New password must be at least 6 characters long');
      return;
    }
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
      toastSuccess('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarFile = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const res = await uploadService.uploadAvatar(file);
        if (res.success && res.data?.url) {
          setProfileData((prev) => ({ ...prev, avatar: res.data.url }));
          await authService.updateProfile({ avatar: res.data.url });
          updateUser({ avatar: res.data.url });
          toastSuccess('Profile avatar updated!');
        }
      } catch (err) {
        toastError('Failed to upload avatar image');
      }
    }
  };

  const memberPlan = membership?.plan || null;
  const courtBenefit = memberPlan?.fullCourtAccess ? '100%' : `${memberPlan?.courtDiscount || memberPlan?.benefits?.courtDiscount || 0}%`;
  const cafeBenefit = `${memberPlan?.canteenDiscount || memberPlan?.benefits?.canteenDiscount || 0}%`;
  const shopBenefit = `${memberPlan?.shopDiscount || memberPlan?.benefits?.shopDiscount || 0}%`;

  return (
    <DashboardLayout>
      <PageHeader
        title="Member Profile & Account"
        subtitle="Manage your contact preferences, emergency details, and login security."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }]}
      />

      {/* Member Hero Header (Clean & Pass-free) */}
      <div className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-user-left">
            <div className="profile-avatar-wrapper">
              <img
                src={
                  profileData.avatar ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Member'}`
                }
                alt={user?.name}
                className="profile-avatar-img"
              />
              <label className="profile-camera-btn" title="Change Avatar">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="profile-user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h2>{user?.name || 'Club Member'}</h2>
                <Badge variant="primary" dot>
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>

              <div className="profile-user-meta">
                <span>
                  <Mail size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {user?.emailId || user?.email}
                </span>
                {user?.phone && (
                  <span>
                    <Phone size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {user?.phone}
                  </span>
                )}
              </div>

              <div className="profile-user-badges">
                {memberPlan ? (
                  <Badge variant="success" icon={Crown}>
                    {memberPlan.name} Member
                  </Badge>
                ) : (
                  <Badge variant="secondary">Club Member</Badge>
                )}
                {user?.preferredSport && (
                  <Badge variant="purple" icon={Activity}>
                    {user.preferredSport} Player
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="outline" icon={Crown} onClick={() => navigate('/memberships')}>
              View Memberships
            </Button>
          </div>
        </div>
      </div>

      {/* Member Activity Stats */}
      <div className="profile-stats-row">
        <div className="profile-stat-tile">
          <div className="profile-stat-icon">
            <Calendar size={22} />
          </div>
          <div className="profile-stat-data">
            <span>Court Bookings</span>
            <strong>{stats.bookings}</strong>
          </div>
        </div>

        <div className="profile-stat-tile">
          <div className="profile-stat-icon">
            <ShoppingBag size={22} />
          </div>
          <div className="profile-stat-data">
            <span>Pro Shop Orders</span>
            <strong>{stats.shopOrders}</strong>
          </div>
        </div>

        <div className="profile-stat-tile">
          <div className="profile-stat-icon">
            <Coffee size={22} />
          </div>
          <div className="profile-stat-data">
            <span>Cafe Orders</span>
            <strong>{stats.canteenOrders}</strong>
          </div>
        </div>

        <div className="profile-stat-tile">
          <div className="profile-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success-text, #10b981)' }}>
            <Award size={22} />
          </div>
          <div className="profile-stat-data">
            <span>Active Privileges</span>
            <strong style={{ fontSize: '0.95rem' }}>
              {courtBenefit} Courts · {cafeBenefit} Cafe
            </strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'personal', label: 'Personal Details', icon: User },
          { id: 'membership', label: 'Membership Tier', icon: Crown },
          { id: 'security', label: 'Security & Password', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                background: isSelected ? 'var(--primary-light, rgba(217, 142, 104, 0.12))' : 'transparent',
                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Information Form */}
      {activeTab === 'personal' && (
        <Card>
          <Card.Header>
            <Card.Title>Personal Information</Card.Title>
            <Card.Description>Keep your profile details, preferred sport, and emergency contacts current</Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="grid-cols-2">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Keni Patel"
                  icon={User}
                  required
                />
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="e.g. +91-9898000011"
                  icon={Phone}
                />
              </div>

              <div className="grid-cols-2">
                <Select
                  label="Preferred Club Sport"
                  value={profileData.preferredSport}
                  onChange={(e) => setProfileData({ ...profileData, preferredSport: e.target.value })}
                  options={[
                    { value: 'Tennis', label: 'Lawn Tennis' },
                    { value: 'Badminton', label: 'Badminton' },
                    { value: 'Squash', label: 'Squash' },
                    { value: 'Swimming', label: 'Swimming Pool' },
                    { value: 'Table Tennis', label: 'Table Tennis' },
                    { value: 'Gym & Fitness', label: 'Gym & Fitness' },
                  ]}
                />
                <Input
                  label="Emergency Contact (Name & Number)"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                  placeholder="e.g. Sunita Sharma (+91 9898000000)"
                  icon={HeartPulse}
                />
              </div>

              <Textarea
                label="Member Bio / Fitness Goals"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Share your playing background, club interests, or fitness goals..."
                rows={3}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button type="submit" variant="primary" icon={Save} loading={savingProfile}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Tab 2: Membership Tier */}
      {activeTab === 'membership' && (
        <Card>
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <Card.Title>Membership Status</Card.Title>
                <Card.Description>Review your active subscription and member discounts</Card.Description>
              </div>
              <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/memberships')}>
                Browse & Upgrade Plans
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            {memberPlan ? (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, rgba(217, 142, 104, 0.12), rgba(70, 98, 127, 0.12))',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', fontWeight: 700 }}>
                      Current Active Tier
                    </span>
                    <h3 style={{ margin: '0.2rem 0', fontSize: '1.35rem', fontWeight: 800 }}>{memberPlan.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Billing Cycle: {memberPlan.durationMonths || 1} Month(s) &bull; Fee: {money(memberPlan.price)}
                    </p>
                  </div>
                  <Badge variant="success" size="lg">
                    ACTIVE
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Court Fee Discount</span>
                    <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {courtBenefit} OFF
                    </strong>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cafe & Bar Discount</span>
                    <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {cafeBenefit} OFF
                    </strong>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pro Gear Shop Discount</span>
                    <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {shopBenefit} OFF
                    </strong>
                  </div>
                </div>
                {/* Past Memberships History */}
                {pastMemberships && pastMemberships.length > 0 && (
                  <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main, #17263B)' }}>
                        Past Membership Subscriptions & Renewals
                      </span>
                      <Badge variant="secondary">{pastMemberships.length} Previous</Badge>
                    </div>

                    <div style={{ display: 'grid', gap: '0.65rem' }}>
                      {pastMemberships.map((pm, idx) => (
                        <div
                          key={pm._id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.85rem 1rem',
                            backgroundColor: 'var(--bg-subtle, #F4F6FC)',
                            borderRadius: 'var(--radius-md, 8px)',
                            border: '1px solid var(--border-color, #DDE2EC)',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ fontSize: '0.95rem' }}>{pm.plan?.name || 'Membership'} Plan</strong>
                              <Badge variant="secondary" size="sm">
                                {pm.status || 'EXPIRED'}
                              </Badge>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {new Date(pm.startDate).toLocaleDateString()} &rarr; {new Date(pm.endDate || pm.expiryDate).toLocaleDateString()}
                              {pm.paymentMethod && ` • Paid via ${pm.paymentMethod}`}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '0.95rem' }}>₹{pm.amountPaid || pm.plan?.price || 0}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-success-text, #10b981)', fontWeight: 700 }}>
                              {pm.paymentStatus || 'PAID'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Crown size={40} style={{ color: 'var(--primary)', marginBottom: '0.75rem', opacity: 0.8 }} />
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem' }}>No Active Paid Plan</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                  Subscribe to a membership plan to unlock complimentary court bookings, guest passes, and cafe & pro-shop discounts.
                </p>
                <Button variant="primary" icon={Crown} onClick={() => navigate('/memberships')}>
                  View Membership Plans
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <Card>
          <Card.Header>
            <Card.Title>Security & Password</Card.Title>
            <Card.Description>Update your password to keep your account safe</Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1.15rem', maxWidth: '540px' }}>
              <Input
                label="Current Password"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="Enter current password..."
                icon={Lock}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Minimum 6 characters..."
                icon={Lock}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Re-enter new password..."
                icon={Lock}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <Button type="submit" variant="primary" icon={Lock} loading={savingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Profile;
