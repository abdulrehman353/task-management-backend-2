import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

// Token se safely userId nikalne ka helper
function getUserIdFromToken(rawToken: string): number | null {
  try {
    const parts = rawToken.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    // JWT payload ke tamam standard ID fields check karein
    const foundId =
      payload.UserID ??
      payload.userId ??
      payload.id ??
      payload.ID ??
      payload.user_id ??
      payload.sub ??
      null;

    return foundId !== null ? Number(foundId) : null;
  } catch (err) {
    console.error('Failed to parse JWT token', err);
    return null;
  }
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || sessionStorage.getItem('resetToken') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Debugging check on mount
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('resetToken', token);
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Reset token is missing in URL.');
      return;
    }

    // Token se ID nikaalein
    const extractedUserId = getUserIdFromToken(token);

    if (!extractedUserId) {
      setError('Unable to identify user from token. Please request a new reset link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Backend requirements ke tamam variations bhejte hain
      const payload = {
        token: token,
        Token: token,
        userId: extractedUserId,
        UserID: extractedUserId,
        id: extractedUserId,
        newPassword: newPassword,
        NewPassword: newPassword,
        password: newPassword,
      };

      await axiosClient.post('/auth/reset-password', payload);

      sessionStorage.removeItem('resetToken');
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
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

        .auth-input {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }

        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover, 
        .auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
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
            <ShieldCheck size={26} color="#2563eb" />
          </div>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>Enter your new password to regain access</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBanner}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>Password updated! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="password"
                required
                className="auth-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="password"
                required
                className="auth-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading || success} className="auth-btn" style={styles.primaryBtn}>
            {loading ? 'Updating Password...' : 'Save New Password'}
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