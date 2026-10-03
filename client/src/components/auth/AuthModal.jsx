import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormError('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (authModalMode === 'login') {
      if (!formData.email || !formData.password) {
        setFormError('Please enter both emailId/email and password.');
        return;
      }
      const res = await login({
        emailId: formData.email,
        email: formData.email,
        password: formData.password,
      });
      if (!res.success) setFormError(res.error || 'Invalid credentials');
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setFormError('Please complete all required fields.');
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      const res = await register({
        name: formData.name,
        emailId: formData.email,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      if (!res.success) setFormError(res.error || 'Registration failed');
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setFormData({
        name: 'Alex Sterling',
        email: 'alex.sterling@enterprise.com',
        password: 'password123',
        role: 'admin',
      });
    } else {
      setFormData({
        name: 'Keni Patel',
        email: 'keni.patel@example.com',
        password: 'password123',
        role: 'user',
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={closeAuthModal} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: 'var(--champagne-light)',
              color: 'var(--navy)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              border: '1px solid var(--champagne)',
            }}
          >
            <Sparkles size={14} style={{ marginRight: 6, color: 'var(--gold)' }} />
            MERN Stack Authentication
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '0.35rem' }}>
            {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {authModalMode === 'login'
              ? 'Access your authenticated dashboard and workspace.'
              : 'Join today and get full access to the starter platform.'}
          </p>
        </div>

        {/* Quick Demo Pre-fill helpers */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px dashed var(--champagne)',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>
            ⚡ Instant 1-Click Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              Fill User Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              Fill Admin Demo
            </button>
          </div>
        </div>

        {/* Error message */}
        {formError && (
          <div
            style={{
              padding: '0.65rem 0.9rem',
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              borderLeft: '4px solid #D32F2F',
            }}
          >
            {formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {authModalMode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Eleanor Vance"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <UserIcon
                  size={17}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--french-blue)' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail
                size={17}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--french-blue)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock
                size={17}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--french-blue)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: '46px' }}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{authModalMode === 'login' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Switch Tab / Footer */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setAuthModalMode('register')}
                style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setAuthModalMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
