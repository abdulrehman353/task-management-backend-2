import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const targetEmail = email.trim();

    try {
      const response = await axiosClient.post('/auth/forgot-password', {
        email: targetEmail,
        Email: targetEmail
      });

      const data = response?.data;
      // Backend agar direct token return kar raha ho
      const resetToken = 
        data?.token || 
        data?.resetToken || 
        data?.data?.token || 
        data?.data?.resetToken;

      setMessage('Password reset instructions verified. Redirecting...');

      // Thoda delay taaki success animation dikhe phir redirect ho jaye
      setTimeout(() => {
        if (resetToken) {
          navigate(`/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(targetEmail)}`);
        } else {
          // Agar email me token gaya ho toh email param ke sath reset page par bhej dein
          navigate(`/reset-password?email=${encodeURIComponent(targetEmail)}`);
        }
      }, 700);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .forgot-card {
          width: 100%;
          max-width: 430px;
          background-color: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 10;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .forgot-card {
            max-width: 100% !important;
            padding: 24px 18px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>

      <div style={styles.glowTop}></div>
      <div style={styles.glowBottom}></div>

      <div className="forgot-card">
        {/* Top Action Row: Back Arrow */}
        <div style={styles.topRow}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={styles.backBtn}
            aria-label="Back to login"
          >
            <ArrowLeft size={18} color="#cbd5e1" />
          </button>
        </div>

        <div style={styles.header}>
          <div style={styles.badge}>
            <Sparkles size={12} color="#34d399" />
            <span>ACCOUNT RECOVERY</span>
          </div>
          <h2 style={styles.title}>Forgot Password</h2>
          <p style={styles.subtitle}>
            Enter your registered email address and we'll send you recovery details.
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={styles.successBox}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="#64748b" style={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            <Send size={15} />
            <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070b12',
    backgroundImage: `
      radial-gradient(at 10% 20%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
      radial-gradient(at 90% 80%, rgba(5, 150, 105, 0.06) 0px, transparent 50%)
    `,
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif'
  },
  glowTop: {
    position: 'absolute',
    top: '-10%',
    left: '10%',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  },
  glowBottom: {
    position: 'absolute',
    bottom: '-10%',
    right: '10%',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  backBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  header: {
    marginBottom: '24px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '100px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '12px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: 0
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.28)',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '18px'
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    color: '#34d399',
    fontSize: '13px',
    marginBottom: '18px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  label: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '6px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
    marginTop: '6px'
  },
  footer: {
    marginTop: '22px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#34d399',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none'
  }
};

export default ForgotPassword;