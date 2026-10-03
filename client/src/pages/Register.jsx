import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
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
    plan: 'GOLD',
    terms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const membershipTiers = [
    {
      id: 'GOLD',
      name: '🥇 Gold Tier',
      price: '₹12,000/yr',
      badge: 'Recommended',
      courtLimit: '20% Court • 15% Shop & Cafe',
      color: '#D98E68',
      borderColor: '#D98E68',
    },
    {
      id: 'SILVER',
      name: '🥈 Silver Tier',
      price: '₹8,000/yr',
      badge: 'Regular',
      courtLimit: '10% Court • 10% Shop • 5% Cafe',
      color: '#354962',
      borderColor: '#354962',
    },
    {
      id: 'JUNIOR',
      name: '🧒 Junior Tier',
      price: '₹5,000/yr',
      badge: 'Youth < 18',
      courtLimit: '15% Court • 10% Shop & Cafe',
      color: '#8FAF98',
      borderColor: '#8FAF98',
    },
  ];

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: '#CBD5E1' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#EF4444' };
      case 2:
        return { score: 2, label: 'Fair', color: '#F59E0B' };
      case 3:
        return { score: 3, label: 'Good', color: '#10B981' };
      case 4:
        return { score: 4, label: 'Strong', color: '#059669' };
      default:
        return { score: 0, label: 'None', color: '#CBD5E1' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.terms) {
      errs.terms = 'You must accept the club terms';
    }

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
        membershipTier: formData.plan,
      });
      toastSuccess('Welcome to Champions Club! Your membership is active.', 'Account Created');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      toastError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Member Account"
      subtitle="Join Champions Club to reserve courts, enter tournaments & enjoy exclusive amenities"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Section 1: Personal Information */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#354962', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
            1. Personal Details
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Alex"
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
              placeholder="e.g. Morgan"
              icon={User}
              error={errors.lastName}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              icon={Mail}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98980 00000"
              icon={Phone}
              error={errors.phone}
              required
            />
          </div>
        </div>

        {/* Section 2: Membership Tier Choice */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#354962', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              2. Select Membership Tier
            </label>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Billed monthly</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            {membershipTiers.map((tier) => {
              const isSelected = formData.plan === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setFormData((prev) => ({ ...prev, plan: tier.id }))}
                  style={{
                    border: isSelected ? `2px solid ${tier.color}` : '1px solid #DDE2EC',
                    backgroundColor: isSelected ? 'rgba(217, 142, 104, 0.06)' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '0.75rem 0.6rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: isSelected ? tier.color : '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {tier.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: '#17263B',
                      fontFamily: "'JetBrains Mono', monospace",
                      margin: '0.2rem 0',
                    }}
                  >
                    {tier.price}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.2 }}>
                    {tier.courtLimit}
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: tier.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle2 size={10} color="#FFFFFF" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Password & Security */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#354962', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
            3. Account Security
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
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
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              icon={Lock}
              error={errors.confirmPassword}
              required
            />
          </div>

          {/* Password Strength & Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            {formData.password ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748B' }}>Strength:</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '18px',
                        height: '4px',
                        borderRadius: '2px',
                        backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#E2E8F0',
                        transition: 'background-color 0.2s',
                      }}
                    />
                  ))}
                </div>
                <span style={{ color: passwordStrength.color, fontWeight: 700 }}>{passwordStrength.label}</span>
              </div>
            ) : <div />}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '2px 0',
              }}
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showPassword ? 'Hide' : 'Show'} passwords</span>
            </button>
          </div>
        </div>

        {/* Section 4: Terms Checkbox */}
        <div style={{ borderTop: '1px solid #DDE2EC', paddingTop: '0.85rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#64748B',
              cursor: 'pointer',
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              style={{
                accentColor: '#D98E68',
                width: '16px',
                height: '16px',
                marginTop: '1px',
                cursor: 'pointer',
              }}
            />
            <span>
              I agree to the Champions Club{' '}
              <a href="#rules" onClick={(e) => e.preventDefault()} style={{ color: '#D98E68', textDecoration: 'none', fontWeight: 600 }}>
                Court Rules
              </a>{' '}
              and{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: '#D98E68', textDecoration: 'none', fontWeight: 600 }}>
                Membership Terms
              </a>
              .
            </span>
          </label>
          {errors.terms && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.terms}</span>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          icon={UserPlus}
          style={{
            backgroundColor: '#D98E68',
            borderColor: '#D98E68',
            color: '#FFFFFF',
            fontWeight: 700,
            height: '46px',
            borderRadius: '10px',
            fontSize: '0.95rem',
          }}
        >
          Complete Registration & Join Club
        </Button>
      </form>

      {/* Footer link to login */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #DDE2EC',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748B',
        }}
      >
        Already a registered club member?{' '}
        <Link to="/login" style={{ color: '#D98E68', fontWeight: 700, textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
