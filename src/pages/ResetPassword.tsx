import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    const extractedUserId = getUserIdFromToken(token);

    if (!extractedUserId) {
      setError('Unable to identify user from token. Please request a new reset link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
    <div style={styles.viewport}>
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(70px, -50px) scale(1.18); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-60px, 40px) scale(1.22); }
        }
        .aura-blob-1 {
          animation: floatSlow1 10s ease-in-out infinite;
        }
        .aura-blob-2 {
          animation: floatSlow2 12s ease-in-out infinite;
        }
        .glass-panel {
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 35px 80px -20px rgba(6, 78, 59, 0.18), 
                      0 15px 35px -10px rgba(15, 23, 42, 0.08),
                      inset 0 1px 2px rgba(255, 255, 255, 1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-panel:hover {
          transform: translateY(-2px);
          box-shadow: 0 45px 90px -20px rgba(16, 185, 129, 0.28), 
                      0 20px 40px -10px rgba(15, 23, 42, 0.1),
                      inset 0 1px 2px rgba(255, 255, 255, 1);
        }
        .luxury-input:focus {
          background: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18), 0 4px 12px rgba(16, 185, 129, 0.08) !important;
        }
        .emerald-cta {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.45);
          transition: all 0.25s ease;
        }
        .emerald-cta:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 16px 32px -6px rgba(16, 185, 129, 0.55);
        }
        .emerald-cta:active:not(:disabled) {
          transform: translateY(0);
        }
        .eye-toggle-btn:hover {
          opacity: 0.8;
        }
        .back-nav-link:hover {
          color: #059669 !important;
          transform: translateX(-3px);
        }
        @media (max-width: 480px) {
          .glass-panel {
            padding: 30px 22px !important;
            border-radius: 24px !important;
          }
          .luxury-input {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Dynamic Animated Ambient Orbs */}
      <div style={styles.orbContainer}>
        <div className="aura-blob-1" style={styles.orb1} />
        <div className="aura-blob-2" style={styles.orb2} />
        <div style={styles.orb3} />
        <div style={styles.gridOverlay} />
      </div>

      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadgeContainer}>
            <div style={styles.logoBadgeGlow} />
            <div style={styles.logoBadgeInner}>
              <ShieldCheck size={24} color="#ffffff" strokeWidth={2.4} />
            </div>
            <div style={styles.liveBeacon}>
              <span style={styles.beaconDot} />
            </div>
          </div>

          <div style={styles.tagBadge}>
            <Sparkles size={12} color="#047857" />
            <span>ACCOUNT SECURITY</span>
          </div>

          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>Enter your new password to regain workspace access</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
            <span>Password updated! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} style={styles.form}>
          <div style={styles.fieldWrapper}>
            <label style={styles.label}>New Secure Password</label>
            <div style={styles.inputContainer}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                className="luxury-input"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="eye-toggle-btn"
                style={styles.eyeBtn}
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <Eye size={18} color="#10b981" />
                ) : (
                  <EyeOff size={18} color="#64748b" />
                )}
              </button>
            </div>
          </div>

          <div style={styles.fieldWrapper}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputContainer}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="luxury-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-toggle-btn"
                style={styles.eyeBtn}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <Eye size={18} color="#10b981" />
                ) : (
                  <EyeOff size={18} color="#64748b" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="emerald-cta"
            style={{
              ...styles.submitBtn,
              opacity: loading || success ? 0.75 : 1,
              cursor: loading || success ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            {!loading && <ArrowRight size={17} strokeWidth={2.4} />}
          </button>
        </form>

        <div style={styles.securityStrip}>
          <div style={styles.securityPoint}>
            <ShieldCheck size={14} color="#059669" />
            <span>Encrypted Hashing</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <div style={styles.securityPoint}>
            <CheckCircle2 size={14} color="#059669" />
            <span>Session Reset Active</span>
          </div>
        </div>

        <div style={styles.footerLinkWrapper}>
          <Link to="/login" className="back-nav-link" style={styles.backAnchor}>
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  viewport: {
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orb1: {
    position: 'absolute',
    top: '-5%',
    left: '12%',
    width: '580px',
    height: '580px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.15) 50%, transparent 70%)',
    filter: 'blur(70px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '-10%',
    right: '15%',
    width: '620px',
    height: '620px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 70%)',
    filter: 'blur(80px)',
  },
  orb3: {
    position: 'absolute',
    top: '35%',
    right: '32%',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, transparent 65%)',
    filter: 'blur(60px)',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), 
                      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 80%)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '450px',
    borderRadius: '28px',
    padding: '42px 38px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '26px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoBadgeContainer: {
    position: 'relative',
    marginBottom: '16px',
  },
  logoBadgeGlow: {
    position: 'absolute',
    inset: '-6px',
    borderRadius: '22px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.6), rgba(14, 165, 233, 0.4))',
    filter: 'blur(10px)',
    zIndex: -1,
  },
  logoBadgeInner: {
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
  },
  liveBeacon: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  },
  beaconDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  tagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#065f46',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: '4px 14px',
    borderRadius: '30px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '13.5px',
    color: '#475569',
    lineHeight: 1.5,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '12px 14px',
    borderRadius: '14px',
    marginBottom: '18px',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '12px 14px',
    borderRadius: '14px',
    marginBottom: '18px',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 44px',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(248, 250, 252, 0.7)',
    color: '#0f172a',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 600,
    fontSize: '14.5px',
    marginTop: '4px',
    boxSizing: 'border-box',
  },
  securityStrip: {
    marginTop: '26px',
    paddingTop: '18px',
    borderTop: '1px solid rgba(203, 213, 225, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  securityPoint: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#475569',
    fontWeight: 500,
  },
  footerLinkWrapper: {
    marginTop: '18px',
    textAlign: 'center',
  },
  backAnchor: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '13.5px',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
};