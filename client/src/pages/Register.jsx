import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, UserPlus, Phone, ShieldCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';
import { isValidEmail, isValidPassword } from '../utils/validators';

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.email) errs.email = 'Email address is required';
    else if (!isValidEmail(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.password) errs.password = 'Password is required';
    else if (!isValidPassword(formData.password)) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        emailId: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'MEMBER',
      });
      toastSuccess('Welcome to Champions Club! Your Member account is ready.', 'Account Created');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Member Registration"
      subtitle="Join Champions Club for exclusive court access & sports privileges"
    >
      {/* Role Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'rgba(143, 175, 152, 0.15)',
          border: '1px solid #DCE9DE',
          borderRadius: '10px',
          padding: '0.65rem 0.85rem',
          marginBottom: '1.25rem',
          fontSize: '0.8rem',
          color: '#2D4159',
        }}
      >
        <ShieldCheck size={18} color="#8FAF98" style={{ flexShrink: 0 }} />
        <span>
          Public signup creates an active <strong>Club Member</strong> account. Staff accounts are provisioned by Management.
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="e.g. Keni"
            icon={User}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="e.g. Patel"
            icon={User}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. keni@gmail.com"
          icon={Mail}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g. 9876543210"
          icon={Phone}
          error={errors.phone}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Min. 6 characters"
          icon={Lock}
          error={errors.password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          icon={Lock}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          icon={UserPlus}
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
          Create Member Account
        </Button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#D98E68', fontWeight: 700, textDecoration: 'none' }}>
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
