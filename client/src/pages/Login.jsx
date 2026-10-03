import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  ShieldAlert,
  Crown,
  Calendar,
  ShoppingBag,
  Coffee,
  Award,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';
import { isValidEmail } from '../utils/validators';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const {
    login,
    loginDemoAdmin,
    loginDemoMember,
    loginDemoFrontDesk,
    loginDemoShop,
    loginDemoCanteen,
  } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required';
    else if (!isValidEmail(email)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email, password);
      toastSuccess('Welcome back to Champions Club!', 'Logged In');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleName) => {
    try {
      setLoading(true);
      if (roleName === 'manager') {
        await loginDemoAdmin();
        toastSuccess('Signed in as Club Manager (Full Permissions)');
      } else if (roleName === 'frontdesk') {
        await loginDemoFrontDesk();
        toastSuccess('Signed in as Front Desk Staff (Court Booking & Member Desk)');
      } else if (roleName === 'shop') {
        await loginDemoShop();
        toastSuccess('Signed in as Sports Shop Staff (Inventory & Pro-Shop POS)');
      } else if (roleName === 'canteen') {
        await loginDemoCanteen();
        toastSuccess('Signed in as Canteen Staff (Tables & Kitchen Orders)');
      } else {
        await loginDemoMember();
        toastSuccess('Signed in as Club Member');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      toastError(err.response?.data?.message || 'Demo login failed. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Champions Club account"
    >
      {/* 1-Click Demo Accounts by Role */}
      <div
        style={{
          backgroundColor: '#F4F6FC',
          border: '1px solid #DDE2EC',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <Sparkles size={15} color="#D98E68" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#17263B', letterSpacing: '0.04em' }}>
            1-CLICK DEMO ROLES (INSTANT ACCESS)
          </span>
        </div>

        {/* Manager Button */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDemoLogin('manager')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0.75rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDE2EC',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#17263B',
            cursor: 'pointer',
            marginBottom: '0.5rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#D98E68')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDE2EC')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={15} color="#D98E68" />
            <span>Club Manager</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Full ERP Admin</span>
        </button>

        {/* Staff Department Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('frontdesk')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DDE2EC',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#354962',
              cursor: 'pointer',
              textAlign: 'center',
              gap: '0.2rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8FAF98')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDE2EC')}
          >
            <Calendar size={14} color="#8FAF98" />
            <span>Front Desk</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('shop')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DDE2EC',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#354962',
              cursor: 'pointer',
              textAlign: 'center',
              gap: '0.2rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8FAF98')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDE2EC')}
          >
            <ShoppingBag size={14} color="#8FAF98" />
            <span>Pro Shop</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('canteen')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DDE2EC',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#354962',
              cursor: 'pointer',
              textAlign: 'center',
              gap: '0.2rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8FAF98')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDE2EC')}
          >
            <Coffee size={14} color="#8FAF98" />
            <span>Canteen</span>
          </button>
        </div>

        {/* Member Button */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDemoLogin('member')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0.75rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDE2EC',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#17263B',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDE2EC')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={15} color="#38bdf8" />
            <span>Gold Member (Keni Patel)</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Self-Service</span>
        </button>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. keni@championsclub.com"
          icon={Mail}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={Lock}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          icon={LogIn}
          style={{
            marginTop: '0.75rem',
            backgroundColor: '#D98E68',
            borderColor: '#D98E68',
            color: '#FFFFFF',
            fontWeight: 700,
            height: '44px',
            borderRadius: '10px',
          }}
        >
          Sign In to Club ERP
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#D98E68', fontWeight: 700, textDecoration: 'none' }}>
          Register as Member
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
