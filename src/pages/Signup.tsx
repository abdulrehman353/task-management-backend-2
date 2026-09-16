import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { UserPlus, User, Mail, Lock, Calendar, AlertCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload: Record<string, any> = {
        Name: name,
        Email: email,
        Password: password,
      };

      if (dateOfBirth) {
        payload.Date_of_birth = dateOfBirth;
      }

      await axiosClient.post('/auth/signup', payload);

      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="auth-container">
      <style>{`
        .auth-card {
          width: 100%;
          max-width: 440px;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px 28px;
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
            padding: 22px 16px !important;
            border-radius: 10px !important;
          }
          .auth-input {
            font-size: 16px !important;
            padding: 11px 12px 11px 38px !important;
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
            <UserPlus size={26} color="#2563eb" />
          </div>
          <h2 style={styles.title}>Create an Account</h2>
          <p style={styles.subtitle}>Sign up to start managing your projects</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="text"
                required
                className="auth-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="password"
                required
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Date of Birth (Optional)</label>
            <div style={styles.inputWrapper}>
              <Calendar size={18} color="#94a3b8" style={styles.fieldIcon} />
              <input
                type="date"
                className="auth-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn" style={styles.primaryBtn}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Already have an account? </span>
          <Link to="/login" style={styles.footerLink}>
            Sign In
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
    marginBottom: '20px',
  },
  iconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
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
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
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
    padding: '10px 12px 10px 38px',
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
    marginTop: '20px',
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
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '14px',
    fontSize: '13px',
  },
};