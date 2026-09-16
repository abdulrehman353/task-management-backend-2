import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const res = await axiosClient.post('/auth/forgot-password', {
        Email: email,
        email: email,
      });

      setMessage(res.data?.message || 'Password reset link generated successfully! Redirecting...');

      // Backend se token aur userId extract karein
      const data = res.data?.data || res.data || {};
      const receivedToken = data.token || data.resetToken || res.data?.token || '';
      const receivedUserId = data.userId || data.UserID || data.id || res.data?.userId || '';

      setTimeout(() => {
        const queryParams = new URLSearchParams();
        if (receivedToken) queryParams.set('token', receivedToken);
        if (receivedUserId) queryParams.set('userId', String(receivedUserId));

        const queryString = queryParams.toString();
        navigate(queryString ? `/reset-password?${queryString}` : '/reset-password');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="auth-container">
      <style>{`
        .auth-card {
          width: 100%;
          max-width: 420px;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 36px 30px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
          box-sizing: border-box;
          transition: all 0.2s ease-in-out;
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 12px !important;
          }
          .auth-card {
            padding: 24px 18px !important;
            border-radius: 10px !important;
          }
          .auth-input {
            font-size: 16px !important;
            padding: 12px 12px 12px 38px !important;
          }
          .auth-btn {
            padding: 13px !important;
            font-size: 15px !important;
          }
        }
      `}</style>

      <div className="auth-card">
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <KeyRound size={26} color="#2563eb" />
          </div>
          <h2 style={styles.title}>Forgot Password?</h2>
          <p style={styles.subtitle}>Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={styles.successBanner}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Registered Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="email"
                required
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn" style={styles.primaryBtn}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '24px 16px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#334151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 12px 11px 38px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  primaryBtn: {
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '6px',
    boxSizing: 'border-box',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: 500,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
  },
};