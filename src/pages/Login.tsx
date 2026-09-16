import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.post('/auth/login', {
        Email: email,
        Password: password,
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="login-container">
      {/* Responsive Inline CSS for Small Devices */}
      <style>{`
        .login-card {
          width: 100%;
          max-width: 420px;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 36px 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
          box-sizing: border-box;
          transition: all 0.2s ease-in-out;
        }

        /* Mobile Screens (Phones < 480px) */
        @media (max-width: 480px) {
          .login-container {
            padding: 12px !important;
            align-items: center !important;
          }
          .login-card {
            padding: 24px 18px !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important;
          }
          .login-input {
            font-size: 16px !important; /* Prevents auto-zoom on iOS Safari */
            padding: 12px 12px 12px 38px !important;
          }
          .login-btn {
            padding: 13px !important;
            font-size: 15px !important;
          }
        }
      `}</style>

      <div className="login-card">
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <LogIn size={26} color="#2563eb" />
          </div>
          <h2 style={styles.title}>Task Manager Login</h2>
          <p style={styles.subtitle}>Enter your details to sign in</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="email"
                required
                className="login-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="password"
                required
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-2px' }}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="login-btn" style={styles.primaryBtn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Don't have an account? </span>
          <Link to="/signup" style={styles.footerLink}>
            Sign Up
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
    display: 'block',
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
    transition: 'border-color 0.15s ease',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
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
    transition: 'background-color 0.15s ease',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerLink: {
    color: '#2563eb',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: 600,
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
    lineHeight: 1.4,
  },
};