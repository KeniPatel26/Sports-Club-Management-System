import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';
import { isValidEmail } from '../utils/validators';
import { isManagerRole, normalizeRole } from '../utils/roles';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email.trim()) && !email.trim().includes('@')) {
      // allow flexible input or standard email
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      const u = res.user || res.data?.user || res.data;
      const r = normalizeRole(u?.role);
      const d = normalizeRole(u?.department);

      toastSuccess(`Welcome back, ${u?.firstName || u?.name || 'Member'}!`, 'Signed In');

      if (isManagerRole(r)) {
        navigate('/manager/dashboard');
      } else if (d === 'FRONT_DESK' || r === 'FRONT_DESK') {
        navigate('/staff/front-desk');
      } else if (d === 'SPORTS_SHOP' || r === 'SHOP_STAFF') {
        navigate('/staff/shop');
      } else if (d === 'CANTEEN' || r === 'CANTEEN_STAFF') {
        navigate('/staff/canteen');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      console.error('Login error:', err);
      toastError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Member & Staff Sign In"
      subtitle="Sign in to access court bookings, club facilities & member dashboard"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="e.g. yourname@example.com"
          icon={Mail}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder="Enter your account password"
          icon={Lock}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        {/* Remember me & Forgot Password */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#64748B' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                accentColor: '#D98E68',
                width: '16px',
                height: '16px',
                cursor: 'pointer',
              }}
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/login"
            onClick={(e) => {
              e.preventDefault();
              toastSuccess('Please contact Champions Club front desk to reset your password.', 'Password Assistance');
            }}
            style={{ color: '#D98E68', fontWeight: 600, textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          icon={LogIn}
          style={{
            marginTop: '0.5rem',
            backgroundColor: '#D98E68',
            borderColor: '#D98E68',
            color: '#FFFFFF',
            fontWeight: 700,
            height: '46px',
            borderRadius: '10px',
            fontSize: '0.95rem',
          }}
        >
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
